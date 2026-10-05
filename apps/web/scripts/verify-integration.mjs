import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { readFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import { adminClient } from "./admin-client.mjs";
import { vendorEmail } from "../src/lib/validation.ts";

const admin = adminClient();
const client = () =>
  createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
const visitor = client();
const run = randomUUID().slice(0, 8);
const boothIds = [randomUUID(), randomUUID()];
const userIds = [],
  imagePaths = [];
const credentialFiles = [];
let checks = 0;
function ok(value, message) {
  assert.ok(value, message);
  checks++;
  console.log(`PASS ${message}`);
}
function required(result, message) {
  assert.ok(
    !result.error,
    `${message}: ${result.error?.code || "request failed"}`,
  );
  return result.data;
}

try {
  required(
    await admin.from("booths").insert(
      boothIds.map((id, i) => ({
        id,
        name: `검증용 ${run} ${i}`,
        booth_number: `QA-${i}`,
        category: "검증용",
        is_active: false,
        sort_order: 90000 + i,
      })),
    ),
    "create test booths",
  );
  const vendors = [];
  for (let i = 0; i < 2; i++) {
    const loginId = `qa_${run}_${i}`;
    let password = randomBytes(18).toString("base64url");
    const created = required(
      await admin.auth.admin.createUser({
        email: vendorEmail(loginId),
        password,
        email_confirm: true,
      }),
      "create test account",
    );
    userIds.push(created.user.id);
    required(
      await admin.rpc("assign_vendor_account", {
        vendor_user_id: created.user.id,
        target_booth_id: boothIds[i],
        vendor_login_id: loginId,
      }),
      "assign test account",
    );
    const vendor = client();
    if (i === 0) {
      const credentialPath = `.local/vendor-${loginId}.json`;
      credentialFiles.push(credentialPath);
      execFileSync(
        "node",
        [
          "--env-file=../../.env.local",
          "scripts/reset-vendor-password.mjs",
          "--login-id",
          loginId,
        ],
        { stdio: ["ignore", "pipe", "pipe"] },
      );
      const oldLogin = await vendor.auth.signInWithPassword({
        email: vendorEmail(loginId),
        password,
      });
      ok(
        Boolean(oldLogin.error),
        "운영자 비밀번호 재발급 후 이전 비밀번호 거부",
      );
      password = JSON.parse(readFileSync(credentialPath, "utf8")).password;
    }
    const signedIn = await vendor.auth.signInWithPassword({
      email: vendorEmail(loginId),
      password,
    });
    ok(
      !signedIn.error && Boolean(signedIn.data.session),
      `업체 ${i + 1} 아이디·비밀번호 로그인 (${signedIn.error?.code || "ok"})`,
    );
    vendors.push(vendor);
  }
  const [a, b] = vendors;
  ok((await a.rpc("my_booth_id")).data === boothIds[0], "자기 매대 연결 조회");
  const product = required(
    await a
      .from("products")
      .insert({
        booth_id: boothIds[0],
        name: `검증상품 ${run}`,
        description: "등록 설명",
        price: 12000,
      })
      .select()
      .single(),
    "create own product",
  );
  ok(Boolean(product.id), "업체 자기 상품 등록");
  ok(product.price === 12000, "업체 상품 가격 저장");
  ok(
    (await visitor.from("products").select("id").eq("id", product.id)).data
      ?.length === 0,
    "비공개 매대 상품 비노출",
  );
  required(
    await admin
      .from("booths")
      .update({ is_active: true })
      .eq("id", boothIds[0]),
    "publish test booth",
  );
  ok(
    (await visitor.from("products").select("name").eq("id", product.id))
      .data?.[0]?.name === product.name,
    "저장된 상품을 별도 방문객 세션에서 즉시 조회",
  );
  required(
    await a
      .from("products")
      .update({ description: "수정된 설명", price: 0 })
      .eq("id", product.id)
      .select()
      .single(),
    "update own product",
  );
  ok(
    (await visitor.from("products").select("description").eq("id", product.id))
      .data?.[0]?.description === "수정된 설명",
    "상품 수정 즉시 공개",
  );
  ok(
    (await visitor.from("products").select("price").eq("id", product.id))
      .data?.[0]?.price === 0,
    "0원 가격 수정 즉시 공개",
  );
  ok(
    (await a.from("products").update({ price: -1 }).eq("id", product.id)).error
      ?.code === "23514",
    "DB에서 음수 가격 거부",
  );
  required(
    await a
      .from("booths")
      .update({ description: "내 매대 소개" })
      .eq("id", boothIds[0])
      .select()
      .single(),
    "update booth description",
  );
  ok(
    (await visitor.from("booths").select("description").eq("id", boothIds[0]))
      .data?.[0]?.description === "내 매대 소개",
    "자기 매대 소개 수정·공개",
  );

  const foreignInsert = await b
    .from("products")
    .insert({ booth_id: boothIds[0], name: "다른 업체 상품" });
  ok(Boolean(foreignInsert.error), "다른 업체 매대 ID로 상품 생성 차단");
  const foreignUpdate = await b
    .from("products")
    .update({ name: "변조", price: 1 })
    .eq("id", product.id)
    .select();
  ok(
    Boolean(foreignUpdate.error) || foreignUpdate.data?.length === 0,
    "다른 업체 상품 수정 차단",
  );
  const foreignDelete = await b
    .from("products")
    .delete()
    .eq("id", product.id)
    .select();
  ok(
    Boolean(foreignDelete.error) || foreignDelete.data?.length === 0,
    "다른 업체 상품 삭제 차단",
  );
  ok(
    Boolean(
      (
        await a
          .from("products")
          .update({ booth_id: boothIds[1] })
          .eq("id", product.id)
      ).error,
    ),
    "상품 소유 매대 변경 차단",
  );
  ok(
    Boolean(
      (
        await a
          .from("booths")
          .update({ booth_number: "변조" })
          .eq("id", boothIds[0])
      ).error,
    ),
    "업체의 매대 번호 변경 차단",
  );
  ok(
    Boolean(
      (await a.from("booths").update({ is_active: true }).eq("id", boothIds[0]))
        .error,
    ),
    "업체의 운영자 전용 공개 상태 변경 차단",
  );
  const foreignBooth = await b
    .from("booths")
    .update({ description: "변조" })
    .eq("id", boothIds[0])
    .select();
  ok(
    Boolean(foreignBooth.error) || foreignBooth.data?.length === 0,
    "다른 업체 매대 소개 수정 차단",
  );
  ok(
    Boolean(
      (
        await visitor
          .from("products")
          .insert({ booth_id: boothIds[0], name: "방문객 등록" })
      ).error,
    ),
    "로그아웃 상태 상품 등록 차단",
  );
  ok(
    Boolean(
      (await visitor.schema("private").from("vendor_accounts").select("*"))
        .error,
    ),
    "비공개 계정 매핑 조회 차단",
  );
  ok(
    Boolean(
      (
        await b.rpc("assign_vendor_account", {
          vendor_user_id: userIds[1],
          target_booth_id: boothIds[0],
          vendor_login_id: `qa_${run}_1`,
        })
      ).error,
    ),
    "업체 계정 재배정 차단",
  );

  const image = readFileSync("public/sample-images/booth-01-thumb.jpg");
  const imagePath = `${boothIds[0]}/${randomUUID()}.jpg`;
  imagePaths.push(imagePath);
  ok(
    Boolean(
      (
        await visitor.storage
          .from("market-images")
          .upload(imagePath, image, { contentType: "image/jpeg" })
      ).error,
    ),
    "로그아웃 상태 사진 업로드 차단",
  );
  required(
    await a.storage
      .from("market-images")
      .upload(imagePath, image, { contentType: "image/jpeg" }),
    "upload own photo",
  );
  ok(
    Boolean(
      (await visitor.storage.from("market-images").download(imagePath)).data,
    ),
    "방문객 사진 조회",
  );
  const stolenPath = `${boothIds[0]}/${randomUUID()}.jpg`;
  imagePaths.push(stolenPath);
  ok(
    Boolean(
      (
        await b.storage
          .from("market-images")
          .upload(stolenPath, image, { contentType: "image/jpeg" })
      ).error,
    ),
    "다른 업체 폴더 사진 업로드 차단",
  );
  ok(
    Boolean(
      (
        await b.storage
          .from("market-images")
          .upload(imagePath, image, { contentType: "image/jpeg", upsert: true })
      ).error,
    ),
    "다른 업체 사진 덮어쓰기 차단",
  );
  await b.storage.from("market-images").remove([imagePath]);
  ok(
    Boolean(
      (await visitor.storage.from("market-images").download(imagePath)).data,
    ),
    "다른 업체 사진 삭제 요청 후 원본 보존",
  );
  const oversizePath = `${boothIds[0]}/${randomUUID()}.jpg`;
  imagePaths.push(oversizePath);
  ok(
    Boolean(
      (
        await a.storage
          .from("market-images")
          .upload(oversizePath, Buffer.alloc(1048577), {
            contentType: "image/jpeg",
          })
      ).error,
    ),
    "Storage 1MB 초과 파일 거부",
  );
  const svgPath = `${boothIds[0]}/${randomUUID()}.svg`;
  imagePaths.push(svgPath);
  ok(
    Boolean(
      (
        await a.storage
          .from("market-images")
          .upload(svgPath, "<svg/>", { contentType: "image/svg+xml" })
      ).error,
    ),
    "허용하지 않은 이미지 형식 거부",
  );
  required(
    await a
      .from("products")
      .update({ image_path: imagePath })
      .eq("id", product.id)
      .select()
      .single(),
    "assign image",
  );
  ok(
    Boolean(
      (
        await a
          .from("products")
          .update({ image_path: `${boothIds[1]}/foreign.jpg` })
          .eq("id", product.id)
      ).error,
    ),
    "다른 매대의 사진 경로 연결 차단",
  );

  const search = required(
    await visitor.rpc("list_booths", { search_text: `검증상품 ${run}` }),
    "search booth by product",
  );
  ok(
    search.length === 1 && search[0].id === boothIds[0],
    "판매상품 이름으로 매대 검색",
  );
  const first = required(
    await visitor.rpc("list_booths", { page_size: 1, page_offset: 0 }),
    "first page",
  );
  const second = required(
    await visitor.rpc("list_booths", { page_size: 1, page_offset: 1 }),
    "second page",
  );
  ok(
    first.length === 1 && second.length === 1 && first[0].id !== second[0].id,
    "DB 매대 동적 추가 및 중복 없는 페이지 조회",
  );
  required(
    await a.from("products").delete().eq("id", product.id).select().single(),
    "delete own product",
  );
  ok(
    (await visitor.from("products").select("id").eq("id", product.id)).data
      ?.length === 0,
    "상품 삭제 후 공개 목록에서 제거",
  );
  required(
    await a.storage.from("market-images").remove([imagePath]),
    "remove own image",
  );
  ok(
    Boolean((await a.storage.from("market-images").download(imagePath)).error),
    "자기 사진 정리",
  );
  const settings = await fetch(`${process.env.SUPABASE_URL}/auth/v1/settings`, {
    headers: { apikey: process.env.SUPABASE_PUBLISHABLE_KEY },
  });
  const settingsBody = await settings.json();
  ok(settingsBody.disable_signup === true, "원격 공개 회원가입 차단 설정");
  ok(
    settingsBody.external?.email === true,
    "기존 계정 비밀번호 로그인 제공자 활성화",
  );
  const signup = await visitor.auth.signUp({
    email: vendorEmail(`qa_${run}_signup`),
    password: randomBytes(18).toString("base64url"),
  });
  if (signup.data.user?.id) userIds.push(signup.data.user.id);
  ok(
    Boolean(signup.error) && !signup.data.user,
    "직접 Auth API를 통한 회원가입 차단",
  );
  console.log(`Integration checks passed: ${checks}`);
} finally {
  for (const file of credentialFiles) rmSync(file, { force: true });
  const cleanupErrors = [];
  if (
    imagePaths.length &&
    (await admin.storage.from("market-images").remove(imagePaths)).error
  )
    cleanupErrors.push("test photos");
  if ((await admin.from("booths").delete().in("id", boothIds)).error)
    cleanupErrors.push("test booths");
  for (const id of userIds)
    if ((await admin.auth.admin.deleteUser(id)).error)
      cleanupErrors.push("test account");
  if (cleanupErrors.length) {
    console.error(`Test cleanup needs attention: ${cleanupErrors.join(", ")}`);
    process.exitCode = 1;
  } else
    console.log(
      "Temporary test accounts, booths, products, and photos removed.",
    );
}
