import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
  Footprints,
  MapPin,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { Back, Empty, Loading, Message, Photo } from "../components";
import {
  configured,
  supabase,
  type Booth,
  type Product,
} from "../lib/supabase";

const PAGE_SIZE = 12;
function BoothCard({ booth }: { booth: Booth }) {
  return (
    <Link className="booth-card" to={`/booths/${booth.id}`}>
      <Photo
        path={booth.thumbnail_path || booth.image_path}
        alt={`${booth.name} 매대`}
        className="booth-thumbnail"
      />
      <div className="booth-card-body">
        <div className="card-eyebrow">
          <span>{booth.category}</span>
          <span className="booth-number">매대 {booth.booth_number}</span>
        </div>
        <h3>
          {booth.name}
          {booth.is_sample && <small className="sample-badge">샘플</small>}
        </h3>
        <p className="clamp-2">
          {booth.description || "어떤 물건들이 기다리고 있을까요?"}
        </p>
        <div className="card-bottom">
          <div className="product-tags">
            {(booth.product_names?.length
              ? booth.product_names
              : [booth.category]
            ).map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
          <ChevronRight size={19} aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}
export function Market() {
  const [input, setInput] = useState(""),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]),
    [booths, setBooths] = useState<Booth[]>([]);
  const [page, setPage] = useState(0),
    [more, setMore] = useState(false),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(0);
      setQuery(input.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [input]);
  useEffect(() => {
    if (!configured) return;
    const controller = new AbortController();
    void supabase
      .rpc("booth_categories")
      .abortSignal(controller.signal)
      .then(({ data }) => {
        if (!controller.signal.aborted && data) setCategories(data);
      });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    if (!configured) {
      setError("마켓 연결을 준비하고 있어요. 잠시 후 다시 방문해 주세요.");
      setLoading(false);
      return;
    }
    void supabase
      .rpc("list_booths", {
        search_text: query,
        category_filter: category,
        page_offset: page * PAGE_SIZE,
        page_size: PAGE_SIZE + 1,
      })
      .abortSignal(controller.signal)
      .then(({ data, error: requestError }) => {
        if (controller.signal.aborted) return;
        setLoading(false);
        if (requestError) {
          setError(
            "매대를 불러오지 못했어요. 연결을 확인하고 다시 시도해 주세요.",
          );
          return;
        }
        const rows: Booth[] = data || [];
        setMore(rows.length > PAGE_SIZE);
        setBooths((previous) =>
          page === 0
            ? rows.slice(0, PAGE_SIZE)
            : [...previous, ...rows.slice(0, PAGE_SIZE)],
        );
      });
    return () => controller.abort();
  }, [query, category, page, retry]);
  return (
    <>
      <section className="welcome">
        <div className="welcome-copy">
          <p className="eyebrow">
            <Sparkles size={14} />
            계단 위의 작은 발견
          </p>
          <h1>
            올라가기 전,
            <br />
            <em>먼저 둘러보세요.</em>
          </h1>
          <p>
            마음에 드는 물건을 발견하면
            <br />
            계단 위 매대에서 만나요.
          </p>
        </div>
        <div className="welcome-photo">
          <img
            src="/sample-images/promotion-thumb.jpg"
            alt="따뜻한 조명이 켜진 양재천 교각 아래 마켓 전경"
            width="384"
            height="512"
          />
          <span>반가워요!</span>
        </div>
      </section>
      <Link className="location-strip" to="/visit">
        <Footprints size={19} />
        <span>
          매대는 <strong>계단 위</strong>에 있어요
        </span>
        <ArrowRight size={17} />
      </Link>
      <section className="booth-section" aria-labelledby="booth-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">TAKE A LITTLE LOOK</p>
            <h2 id="booth-title">어떤 매대가 있을까요?</h2>
          </div>
          <span className="flower" aria-hidden="true">
            ✳
          </span>
        </div>
        <form
          className="search-field"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(0);
            setQuery(input.trim());
          }}
        >
          <Search size={19} />
          <input
            aria-label="매대 또는 상품 검색"
            placeholder="매대나 궁금한 물건을 찾아보세요"
            value={input}
            maxLength={100}
            onChange={(e) => setInput(e.target.value)}
          />
          {input && (
            <button
              type="button"
              aria-label="검색어 지우기"
              onClick={() => setInput("")}
            >
              <X size={17} />
            </button>
          )}
        </form>
        {categories.length > 0 && (
          <div className="category-list" aria-label="매대 종류">
            {["", ...categories].map((item) => (
              <button
                key={item}
                className={category === item ? "selected" : ""}
                aria-pressed={category === item}
                onClick={() => {
                  setCategory(item);
                  setPage(0);
                }}
              >
                {item || "전체 매대"}
              </button>
            ))}
          </div>
        )}
        {error ? (
          <Message error>
            {error}
            <button
              className="text-button"
              onClick={() => setRetry((v) => v + 1)}
            >
              다시 불러오기
            </button>
          </Message>
        ) : (
          <>
            {loading && page === 0 ? (
              <div
                className="skeleton-list"
                aria-label="매대 불러오는 중"
                role="status"
              >
                <div />
                <div />
              </div>
            ) : booths.length === 0 ? (
              <Empty
                title={
                  query || category
                    ? "아직 찾는 매대가 없어요"
                    : "매대를 준비하고 있어요"
                }
              >
                {query || category
                  ? "다른 검색어나 종류로 다시 찾아보세요."
                  : "참가 매대가 등록되면 이곳에서 만나볼 수 있어요."}
              </Empty>
            ) : (
              <div className="booth-list">
                {booths.map((booth) => (
                  <BoothCard key={booth.id} booth={booth} />
                ))}
              </div>
            )}
            {more && (
              <button
                className="button secondary full-width load-more"
                disabled={loading}
                onClick={() => setPage((p) => p + 1)}
              >
                {loading ? "불러오는 중…" : "매대 더 보기"}
              </button>
            )}
          </>
        )}
        {booths.some((b) => b.is_sample) && !loading && (
          <p className="sample-note">
            ‘샘플’ 표시 매대는 제공된 사진으로 만든 미리보기예요.
          </p>
        )}
      </section>
      <section className="gentle-note">
        <span aria-hidden="true">✦</span>
        <div>
          <h2>구경은 가볍게, 발견은 즐겁게</h2>
          <p>
            사진으로 먼저 둘러보고
            <br />
            마음이 가는 매대에 들러보세요.
          </p>
        </div>
      </section>
    </>
  );
}

export function BoothDetail() {
  const { id } = useParams();
  const [booth, setBooth] = useState<Booth | null>(null),
    [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [missing, setMissing] = useState(false),
    [page, setPage] = useState(0),
    [more, setMore] = useState(false),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    setPage(0);
    setProducts([]);
    setBooth(null);
    setMissing(false);
  }, [id]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
      setMissing(true);
      setLoading(false);
      return;
    }
    void Promise.all([
      supabase
        .from("booths")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .abortSignal(controller.signal)
        .maybeSingle(),
      supabase
        .from("products")
        .select("*")
        .eq("booth_id", id)
        .order("sort_order")
        .order("created_at")
        .order("id")
        .range(page * 20, page * 20 + 20)
        .abortSignal(controller.signal),
    ]).then(([boothResult, productResult]) => {
      if (controller.signal.aborted) return;
      setLoading(false);
      if (boothResult.error || productResult.error) {
        setError("매대 소식을 불러오지 못했어요. 다시 시도해 주세요.");
        return;
      }
      if (!boothResult.data) {
        setMissing(true);
        return;
      }
      setBooth(boothResult.data);
      const rows = productResult.data || [];
      setMore(rows.length > 20);
      setProducts((old) =>
        page === 0 ? rows.slice(0, 20) : [...old, ...rows.slice(0, 20)],
      );
    });
    return () => controller.abort();
  }, [id, page, retry]);
  return (
    <div className="detail-page">
      <Back />
      {error ? (
        <Message error>
          {error}
          <button
            className="text-button"
            onClick={() => setRetry((v) => v + 1)}
          >
            다시 불러오기
          </button>
        </Message>
      ) : missing ? (
        <Empty title="이 매대는 찾을 수 없어요">
          운영이 종료되었거나 주소가 바뀌었을 수 있어요.{" "}
          <Link to="/">다른 매대 둘러보기</Link>
        </Empty>
      ) : !booth ? (
        <Loading />
      ) : (
        <>
          <div className="detail-heading">
            <span className="category-label">{booth.category}</span>
            <span className="booth-number">매대 {booth.booth_number}</span>
            <h1>{booth.name}</h1>
            {booth.is_sample && (
              <p className="sample-note">
                샘플 매대 · 실제 업체 정보는 준비 중이에요.
              </p>
            )}
          </div>
          <Photo
            path={booth.image_path}
            alt={`${booth.name} 전경`}
            className="detail-photo"
            eager
            zoom
          />
          <p className="booth-description">
            {booth.description || "매대 소개를 준비하고 있어요."}
          </p>
          <Link className="location-box" to="/visit">
            <MapPin size={22} />
            <div>
              <strong>이곳에서 만나요</strong>
              <p>{booth.location_text}</p>
            </div>
            <ChevronRight size={20} />
          </Link>
          <section className="products-section">
            <div className="section-heading">
              <h2>이 매대의 물건들</h2>
              <span className="tiny-label">직접 보고 골라요</span>
            </div>
            {products.length ? (
              <div className="product-list">
                {products.map((product) => (
                  <article className="product-card" key={product.id}>
                    <Photo
                      path={product.image_path}
                      alt={product.name}
                      className="product-photo"
                      zoom
                    />
                    <div>
                      <h3>{product.name}</h3>
                      <p>
                        {product.description ||
                          "자세한 이야기는 매대에서 만나보세요."}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <Empty title="물건 소개를 준비하고 있어요">
                매대 사진을 먼저 둘러보세요.
                <br />
                상품이 등록되면 바로 이곳에 보여요.
              </Empty>
            )}
            {more && (
              <button
                className="button secondary full-width"
                disabled={loading}
                onClick={() => setPage((p) => p + 1)}
              >
                {loading ? "불러오는 중…" : "상품 더 보기"}
              </button>
            )}
          </section>
          <Link to="/" className="button secondary full-width">
            다른 매대도 둘러보기 <ArrowRight size={17} />
          </Link>
        </>
      )}
    </div>
  );
}

export function Visit() {
  return (
    <div className="visit-page">
      <Back />
      <p className="eyebrow">COME SAY HELLO</p>
      <h1>
        마음에 드는 매대,
        <br />
        <em>이제 만나러 갈까요?</em>
      </h1>
      <Photo
        path="/sample-images/promotion.jpg"
        alt="계단과 따뜻한 조명이 보이는 마켓 전경"
        className="visit-photo"
        eager
        zoom
      />
      <ol className="visit-steps">
        <li>
          <span>01</span>
          <div>
            <h2>1층에서 먼저 둘러봐요</h2>
            <p>매대 소개와 물건들을 편하게 살펴보세요.</p>
          </div>
        </li>
        <li>
          <span>02</span>
          <div>
            <h2>매대 번호를 기억해요</h2>
            <p>관심 있는 매대의 상세 화면에서 번호와 위치를 확인해 주세요.</p>
          </div>
        </li>
        <li>
          <span>03</span>
          <div>
            <h2>계단 위에서 만나요</h2>
            <p>
              계단을 올라 관심 있는 매대를 찾아가요.
              <br />
              물건은 현장에서 직접 보고 고를 수 있어요.
            </p>
          </div>
        </li>
      </ol>
      <div className="message">
        정확한 행사 시간과 매대 배치는 준비되는 대로 안내할게요.
      </div>
      <Link to="/" className="button primary full-width">
        매대 둘러보기 <ArrowRight size={18} />
      </Link>
    </div>
  );
}
