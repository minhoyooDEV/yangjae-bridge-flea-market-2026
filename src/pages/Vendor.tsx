import { useEffect, useState, type FormEvent } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowUpRight,
  Check,
  ImagePlus,
  LogOut,
  Pencil,
  Plus,
  Store,
  Trash2,
} from "lucide-react";
import { useAuth } from "../auth";
import {
  Back,
  Empty,
  Loading,
  Message,
  Photo,
  usePreview,
} from "../components";
import { removeImages, uploadImage } from "../lib/images";
import { imageUrl, supabase, type Booth, type Product } from "../lib/supabase";
import { validateProduct, vendorEmail } from "../lib/validation";

function useVendorBooth() {
  const { session } = useAuth();
  const [booth, setBooth] = useState<Booth | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      const result = await supabase
        .rpc("my_booth_id")
        .abortSignal(controller.signal);
      if (controller.signal.aborted) return;
      if (result.error || !result.data) {
        setError("연결된 매대가 없어요. 운영자에게 계정 등록을 확인해 주세요.");
        setLoading(false);
        return;
      }
      const { data, error: requestError } = await supabase
        .from("booths")
        .select("*")
        .eq("id", result.data)
        .abortSignal(controller.signal)
        .single();
      if (controller.signal.aborted) return;
      if (requestError)
        setError(
          "매대 정보를 불러오지 못했어요. 새로고침 후 다시 시도해 주세요.",
        );
      else setBooth(data);
      setLoading(false);
    })();
    return () => controller.abort();
  }, [session?.user.id]);
  return { booth, setBooth, loading, error };
}
export function Login() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  if (loading) return <Loading />;
  if (session) return <Navigate to="/vendor" replace />;
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const email = vendorEmail(loginId);
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        setError(
          "아이디와 비밀번호를 확인해 주세요. 여러 번 실패했다면 잠시 후 다시 시도해 주세요.",
        );
        return;
      }
      setPassword("");
      navigate("/vendor", { replace: true });
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "로그인에 실패했어요. 다시 시도해 주세요.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="form-page">
      <Back />
      <div className="login-welcome">
        <span className="round-icon">
          <Store size={28} />
        </span>
        <p className="eyebrow">HELLO, MARKET FRIEND</p>
        <h1>
          우리 매대를
          <br />
          소개해 볼까요?
        </h1>
        <p>운영자가 발급한 계정으로 로그인해 주세요.</p>
      </div>
      <form onSubmit={submit} className="stack-form">
        <label>
          업체 아이디
          <input
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            minLength={3}
            maxLength={32}
            value={loginId}
            disabled={busy}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder="발급받은 아이디"
          />
        </label>
        <label>
          비밀번호
          <input
            type="password"
            autoComplete="current-password"
            required
            maxLength={128}
            value={password}
            disabled={busy}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
          />
        </label>
        {error && <Message error>{error}</Message>}
        <button className="button primary full-width" disabled={busy}>
          {busy ? "로그인 중…" : "로그인"}
        </button>
      </form>
      <p className="field-hint centered">
        계정 발급이나 비밀번호 재설정은
        <br />
        마켓 운영자에게 문의해 주세요.
      </p>
    </div>
  );
}

async function logout() {
  await supabase.auth.signOut({ scope: "local" });
}
export function VendorDashboard() {
  const location = useLocation();
  const notice =
    typeof location.state?.notice === "string" ? location.state.notice : "";
  const { booth, loading, error } = useVendorBooth();
  const [products, setProducts] = useState<Product[]>([]);
  const [listError, setListError] = useState(""),
    [listLoading, setListLoading] = useState(true),
    [page, setPage] = useState(0),
    [more, setMore] = useState(false),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!booth) return;
    const controller = new AbortController();
    setListLoading(true);
    setListError("");
    void supabase
      .from("products")
      .select("*")
      .eq("booth_id", booth.id)
      .order("sort_order")
      .order("created_at")
      .order("id")
      .range(page * 30, page * 30 + 30)
      .abortSignal(controller.signal)
      .then(({ data, error: requestError }) => {
        if (controller.signal.aborted) return;
        setListLoading(false);
        if (requestError) {
          setListError("상품 목록을 불러오지 못했어요.");
          return;
        }
        const rows = data || [];
        setMore(rows.length > 30);
        setProducts((old) =>
          page === 0 ? rows.slice(0, 30) : [...old, ...rows.slice(0, 30)],
        );
      });
    return () => controller.abort();
  }, [booth, page, retry]);
  if (loading) return <Loading />;
  return (
    <div className="vendor-page">
      <div className="vendor-top">
        <Back />
        <button className="text-button" onClick={() => void logout()}>
          <LogOut size={16} />
          로그아웃
        </button>
      </div>
      {notice && <Message>{notice}</Message>}
      {error ? (
        <Message error>{error}</Message>
      ) : (
        booth && (
          <>
            <p className="eyebrow">MY LITTLE SHOP</p>
            <h1>
              {booth.name}
              <small>매대 {booth.booth_number}</small>
            </h1>
            <p className="page-intro">오늘의 물건과 이야기를 전해 주세요.</p>
            {!booth.is_active && (
              <Message>
                현재 공개가 중지된 매대예요. 운영자에게 문의해 주세요.
              </Message>
            )}
            <div className="vendor-summary">
              <Photo
                path={booth.thumbnail_path || booth.image_path}
                alt={booth.name}
              />
              <div>
                <span className="category-label">{booth.category}</span>
                <p className="clamp-2">
                  {booth.description || "매대 소개를 작성해 주세요."}
                </p>
                <Link className="text-button" to="/vendor/booth">
                  <Pencil size={14} />
                  소개와 사진 수정
                </Link>
              </div>
            </div>
            <div className="publish-note">
              <Check size={17} />
              <span>저장한 내용은 방문객에게 바로 보여요.</span>
            </div>
            <div className="section-heading">
              <h2>판매상품 관리</h2>
              <Link className="button primary small" to="/vendor/products/new">
                <Plus size={17} />
                상품 등록
              </Link>
            </div>
            {listError ? (
              <Message error>
                {listError}
                <button
                  className="text-button"
                  onClick={() => setRetry((v) => v + 1)}
                >
                  다시 불러오기
                </button>
              </Message>
            ) : listLoading && page === 0 ? (
              <Loading />
            ) : products.length ? (
              <div className="manage-list">
                {products.map((product) => (
                  <Link
                    to={`/vendor/products/${product.id}`}
                    className="manage-item"
                    key={product.id}
                  >
                    <Photo
                      path={product.thumbnail_path || product.image_path}
                      alt={product.name}
                    />
                    <div>
                      <h3>{product.name}</h3>
                      <p className="clamp-2">
                        {product.description || "등록된 상품"}
                      </p>
                    </div>
                    <Pencil size={18} />
                  </Link>
                ))}
              </div>
            ) : (
              <Empty title="첫 번째 물건을 소개해 주세요">
                상품 이름과 사진을 올리면
                <br />
                방문객이 매대에서 만나볼 수 있어요.
              </Empty>
            )}
            {more && (
              <button
                className="button secondary full-width"
                disabled={listLoading}
                onClick={() => setPage((p) => p + 1)}
              >
                상품 더 보기
              </button>
            )}
            <Link
              className="button secondary full-width"
              to={`/booths/${booth.id}`}
            >
              방문객 화면 보기 <ArrowUpRight size={18} />
            </Link>
          </>
        )
      )}
    </div>
  );
}

function ImagePicker({
  current,
  file,
  setFile,
  remove,
  setRemove,
  busy,
}: {
  current: string | null;
  file: File | null;
  setFile: (file: File | null) => void;
  remove: boolean;
  setRemove: (value: boolean) => void;
  busy: boolean;
}) {
  const [selectionError, setSelectionError] = useState("");
  const preview = usePreview(file);
  const source = preview || (!remove ? imageUrl(current) : undefined);
  return (
    <div className="image-picker">
      <span className="field-label">
        대표 사진 <small>선택</small>
      </span>
      {source && (
        <img className="selected-image" src={source} alt="선택한 대표 사진" />
      )}
      <label className="image-input">
        <ImagePlus size={22} />
        <span>{source ? "다른 사진 선택" : "사진 선택하기"}</span>
        <input
          type="file"
          aria-label="대표 사진 선택"
          accept="image/jpeg,image/png,image/webp"
          disabled={busy}
          onChange={(e) => {
            const next = e.target.files?.[0];
            e.target.value = "";
            if (next) {
              if (
                !["image/jpeg", "image/png", "image/webp"].includes(next.type)
              ) {
                setSelectionError("JPG·PNG·WebP 사진을 선택해 주세요.");
                return;
              }
              if (next.size > 20 * 1024 * 1024) {
                setSelectionError("원본 사진은 20MB 이하로 선택해 주세요.");
                return;
              }
              setSelectionError("");
              setFile(next);
              setRemove(false);
            }
          }}
        />
      </label>
      {selectionError && <Message error>{selectionError}</Message>}
      <p className="field-hint">
        JPG·PNG·WebP, 원본 20MB 이하
        <br />
        업로드할 때 작은 웹용 사진으로 자동 변환해요.
      </p>
      {source && (
        <button
          className="text-button danger"
          type="button"
          disabled={busy}
          onClick={() => {
            setFile(null);
            setRemove(true);
          }}
        >
          사진 빼기
        </button>
      )}
    </div>
  );
}

export function BoothEditor() {
  const navigate = useNavigate();
  const { booth, loading, error: loadError } = useVendorBooth();
  const [description, setDescription] = useState(""),
    [file, setFile] = useState<File | null>(null),
    [remove, setRemove] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    if (booth) setDescription(booth.description);
  }, [booth]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!booth || busy) return;
    setBusy(true);
    setError("");
    let uploaded: Awaited<ReturnType<typeof uploadImage>> | undefined;
    try {
      if (description.trim().length > 1500)
        throw new Error("매대 소개는 1,500자까지 입력할 수 있어요.");
      if (file) uploaded = await uploadImage(file, booth.id);
      const paths =
        uploaded || (remove ? { image_path: null, thumbnail_path: null } : {});
      const { error: saveError } = await supabase
        .from("booths")
        .update({ description: description.trim(), ...paths })
        .eq("id", booth.id)
        .select("id")
        .single();
      if (saveError)
        throw new Error(
          "저장 결과를 확인하지 못했어요. 입력 내용은 유지됩니다. 매대 관리에서 저장 여부를 확인해 주세요.",
        );
      if (uploaded || remove)
        await removeImages([booth.image_path, booth.thumbnail_path], booth.id);
      navigate("/vendor", {
        replace: true,
        state: { notice: "매대 소개를 저장했어요." },
      });
    } catch (failure) {
      // A lost response can follow a successful commit. Keep new images until
      // the operator's age-limited orphan cleanup confirms they are unused.
      setError(
        failure instanceof Error
          ? failure.message
          : "저장에 실패했어요. 다시 시도해 주세요.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <Loading />;
  return (
    <div className="form-page">
      <Back to="/vendor">매대 관리</Back>
      <h1>우리 매대 소개</h1>
      {loadError ? (
        <Message error>{loadError}</Message>
      ) : (
        booth && (
          <form className="stack-form" onSubmit={submit}>
            <p className="page-intro">
              {booth.name} · 매대 {booth.booth_number}
            </p>
            <ImagePicker
              current={booth.image_path}
              file={file}
              setFile={setFile}
              remove={remove}
              setRemove={setRemove}
              busy={busy}
            />
            <label>
              매대 이야기
              <textarea
                rows={6}
                maxLength={1500}
                value={description}
                disabled={busy}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="우리 매대만의 이야기와 주요 판매품목을 소개해 주세요."
              />
              <span className="field-hint counter">
                {description.length}/1,500
              </span>
            </label>
            {error && <Message error>{error}</Message>}
            <button className="button primary full-width" disabled={busy}>
              {busy ? "사진 처리 및 저장 중…" : "저장하고 공개하기"}
            </button>
            <p className="field-hint centered">
              매대 이름·번호·위치 변경은 운영자에게 문의해 주세요.
            </p>
          </form>
        )
      )}
    </div>
  );
}

export function ProductEditor() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const { booth, loading, error: boothError } = useVendorBooth();
  const [product, setProduct] = useState<Product | null>(null),
    [name, setName] = useState(""),
    [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null),
    [remove, setRemove] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [loadError, setLoadError] = useState(""),
    [itemLoading, setItemLoading] = useState(!isNew),
    [confirmDelete, setConfirmDelete] = useState(false);
  useEffect(() => {
    if (!booth || !id) return;
    const controller = new AbortController();
    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      setLoadError("수정할 상품을 찾을 수 없어요.");
      setItemLoading(false);
      return;
    }
    void supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .eq("booth_id", booth.id)
      .abortSignal(controller.signal)
      .maybeSingle()
      .then(({ data, error: requestError }) => {
        if (controller.signal.aborted) return;
        setItemLoading(false);
        if (requestError || !data) {
          setLoadError(
            "수정할 상품을 찾을 수 없어요. 매대 관리에서 다시 선택해 주세요.",
          );
          return;
        }
        setProduct(data);
        setName(data.name);
        setDescription(data.description);
      });
    return () => controller.abort();
  }, [booth, id]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!booth || busy) return;
    setBusy(true);
    setError("");
    let uploaded: Awaited<ReturnType<typeof uploadImage>> | undefined;
    try {
      const fields = validateProduct(name, description);
      if (file) uploaded = await uploadImage(file, booth.id);
      const paths =
        uploaded || (remove ? { image_path: null, thumbnail_path: null } : {});
      const values = { ...fields, ...paths };
      const result = isNew
        ? await supabase
            .from("products")
            .insert({ ...values, booth_id: booth.id })
            .select("id")
            .single()
        : await supabase
            .from("products")
            .update(values)
            .eq("id", id!)
            .eq("booth_id", booth.id)
            .select("id")
            .single();
      if (result.error)
        throw new Error(
          "저장 결과를 확인하지 못했어요. 입력 내용은 유지됩니다. 매대 관리에서 저장 여부를 확인한 뒤 다시 시도해 주세요.",
        );
      if ((uploaded || remove) && product)
        await removeImages(
          [product.image_path, product.thumbnail_path],
          booth.id,
        );
      navigate("/vendor", {
        replace: true,
        state: { notice: "상품을 저장했어요. 방문객 화면에서 확인해 보세요." },
      });
    } catch (failure) {
      // Do not delete a new image when the write may already have committed.
      setError(
        failure instanceof Error
          ? failure.message
          : "저장에 실패했어요. 다시 시도해 주세요.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function deleteProduct() {
    if (!booth || !product || busy) return;
    setBusy(true);
    setError("");
    try {
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id)
        .eq("booth_id", booth.id)
        .select("id")
        .single();
      if (deleteError)
        throw new Error("상품을 지우지 못했어요. 다시 시도해 주세요.");
      await removeImages(
        [product.image_path, product.thumbnail_path],
        booth.id,
      );
      navigate("/vendor", {
        replace: true,
        state: { notice: "상품을 삭제했어요." },
      });
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "삭제에 실패했어요.",
      );
    } finally {
      setBusy(false);
      setConfirmDelete(false);
    }
  }
  if (loading || (itemLoading && !boothError)) return <Loading />;
  return (
    <div className="form-page">
      <Back to="/vendor">매대 관리</Back>
      <h1>{isNew ? "새로운 물건 소개" : "물건 소개 수정"}</h1>
      {boothError || loadError ? (
        <Message error>{boothError || loadError}</Message>
      ) : (
        <form className="stack-form" onSubmit={submit}>
          <p className="page-intro">방문객이 궁금해할 이야기를 적어 주세요.</p>
          <ImagePicker
            current={product?.image_path || null}
            file={file}
            setFile={setFile}
            remove={remove}
            setRemove={setRemove}
            busy={busy}
          />
          <label>
            상품 이름 <span className="required">필수</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={80}
              disabled={busy}
              placeholder="어떤 물건인가요?"
            />
          </label>
          <label>
            상품 이야기
            <textarea
              rows={5}
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={busy}
              placeholder="특징, 소재, 사용법 등 궁금할 내용을 소개해 주세요."
            />
            <span className="field-hint counter">
              {description.length}/1,000
            </span>
          </label>
          {error && <Message error>{error}</Message>}
          <button className="button primary full-width" disabled={busy}>
            {busy ? "사진 처리 및 저장 중…" : "저장하고 공개하기"}
          </button>
          {!isNew &&
            (!confirmDelete ? (
              <button
                className="text-button danger centered"
                type="button"
                disabled={busy}
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 size={16} />이 상품 삭제하기
              </button>
            ) : (
              <div
                className="delete-confirm"
                role="group"
                aria-label="상품 삭제 확인"
              >
                <p>
                  상품을 삭제할까요?
                  <br />
                  방문객 목록에서도 사라져요.
                </p>
                <div>
                  <button
                    className="button secondary"
                    type="button"
                    disabled={busy}
                    onClick={() => setConfirmDelete(false)}
                  >
                    취소
                  </button>
                  <button
                    className="button destructive"
                    type="button"
                    disabled={busy}
                    onClick={() => void deleteProduct()}
                  >
                    삭제하기
                  </button>
                </div>
              </div>
            ))}
        </form>
      )}
    </div>
  );
}
