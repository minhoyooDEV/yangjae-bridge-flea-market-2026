import { BUCKET, supabase } from "./supabase";
import { isOwnedImage } from "./validation";

async function jpeg(bitmap: ImageBitmap, maxSize: number, quality: number) {
  const ratio = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
  canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
  const context = canvas.getContext("2d");
  if (!context)
    throw new Error(
      "이 기기에서 사진을 처리할 수 없어요. 다른 브라우저에서 다시 시도해 주세요.",
    );
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("사진 변환에 실패했어요.")),
      "image/jpeg",
      quality,
    ),
  );
}
export async function prepareImage(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error(
      "JPG·PNG·WebP 사진을 선택해 주세요. HEIC 사진은 JPG로 변환해 주세요.",
    );
  if (file.size > 20 * 1024 * 1024)
    throw new Error("원본 사진은 20MB 이하로 선택해 주세요.");
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("사진을 열 수 없어요. 다른 사진을 선택해 주세요.");
  }
  try {
    if (bitmap.width * bitmap.height > 60_000_000)
      throw new Error(
        "사진 해상도가 너무 커요. 크기를 줄여 다시 선택해 주세요.",
      );
    let full = await jpeg(bitmap, 1280, 0.76);
    if (full.size > 1024 * 1024) full = await jpeg(bitmap, 960, 0.58);
    if (full.size > 1024 * 1024)
      throw new Error(
        "사진을 1MB 이하로 줄일 수 없어요. 다른 사진을 선택해 주세요.",
      );
    return { full, thumb: await jpeg(bitmap, 480, 0.7) };
  } finally {
    bitmap.close();
  }
}
export async function uploadImage(file: File, boothId: string) {
  const { full, thumb } = await prepareImage(file);
  const id = crypto.randomUUID();
  const image_path = `${boothId}/${id}.jpg`,
    thumbnail_path = `${boothId}/${id}-thumb.jpg`;
  const first = await supabase.storage.from(BUCKET).upload(image_path, full, {
    contentType: "image/jpeg",
    cacheControl: "86400",
    upsert: false,
  });
  if (first.error)
    throw new Error(
      "사진을 올리지 못했어요. 연결을 확인하고 다시 시도해 주세요.",
    );
  const second = await supabase.storage
    .from(BUCKET)
    .upload(thumbnail_path, thumb, {
      contentType: "image/jpeg",
      cacheControl: "86400",
      upsert: false,
    });
  if (second.error) {
    await supabase.storage.from(BUCKET).remove([image_path]);
    throw new Error("사진을 올리지 못했어요. 다시 시도해 주세요.");
  }
  return { image_path, thumbnail_path };
}
export async function removeImages(
  paths: Array<string | null>,
  boothId: string,
) {
  const owned = [
    ...new Set(paths.filter((p): p is string => isOwnedImage(p, boothId))),
  ];
  if (!owned.length) return true;
  try {
    const { error } = await supabase.storage.from(BUCKET).remove(owned);
    return !error;
  } catch {
    // Cleanup failure must not undo a database save that already succeeded.
    return false;
  }
}
