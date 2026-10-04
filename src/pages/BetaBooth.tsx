import { useEffect, useRef, useState } from "react";
import { ExternalLink, MapPin, Play, X } from "lucide-react";
import { Empty, Photo } from "../components";
import { booth, brand, products, type MarketProduct } from "../data/market";
import { track } from "../lib/analytics";
import { groupByCategory } from "../lib/products";
import { imageUrl } from "../lib/public-image";
import { formatPrice } from "../lib/validation";

export function BetaBooth() {
  const [selected, setSelected] = useState<MarketProduct | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!selected) return;
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      opener.current?.focus();
    };
  }, [selected]);

  return (
    <div className="cm-page">
      <section className="cm-booth" aria-labelledby="page-title">
        <h1 id="page-title" className="sr-only">
          {booth.market_name} {booth.name} 매대
        </h1>
        {booth.image_path && (
          <Photo
            path={booth.image_path}
            alt={`${booth.market_name} ${booth.name} 매대 전경`}
            className="media landscape"
            eager
            zoom
          />
        )}
      </section>
      {booth.is_sample && (
        <p className="sample-note">미리보기 · 상품과 가격은 예시예요.</p>
      )}
      <section className="section" aria-labelledby="products-title">
        <h2 id="products-title">플리마켓 기획상품</h2>
        <p className="hint">물건을 누르면 자세한 설명이 열려요.</p>
        {groupByCategory(products).map((group) => (
          <div key={group.category} className="product-group">
            <h3>{group.category}</h3>
            <ul className="list-plain grid-2">
              {group.products.map((product) => (
                <li key={product.id}>
                  <button
                    className="cm-product"
                    aria-haspopup="dialog"
                    onClick={(event) => {
                      opener.current = event.currentTarget;
                      setSelected(product);
                      track("product_viewed", {
                        product_id: product.id,
                        product_name: product.name,
                        category: product.category,
                        price: product.price,
                      });
                    }}
                  >
                    <Photo
                      path={product.image_path}
                      alt=""
                      className="media square"
                    />
                    <span>{product.name}</span>
                    <strong className="price">
                      {formatPrice(product.price)}
                    </strong>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {!products.length && (
          <Empty title="물건을 준비하고 있어요">
            상품과 가격이 등록되면 여기에 보여요.
          </Empty>
        )}
      </section>
      <section
        id="booth-location"
        className="section inverse cm-location"
        aria-labelledby="location-title"
      >
        <div>
          <h2 id="location-title">{booth.market_name}에서 만나요</h2>
          <p className="cm-location-place">
            <MapPin size={18} aria-hidden="true" />
            {booth.location_text}
          </p>
          <p className="lede">{booth.description}</p>
        </div>
      </section>
      <section className="cm-hero inverse" aria-labelledby="hero-title">
        <img
          className="cm-hero-image"
          src={imageUrl(brand.hero_path)}
          alt=""
          loading="lazy"
          decoding="async"
        />
        <div className="cm-hero-copy">
          <h2 id="hero-title" className="display" lang="en">
            {brand.tagline}
          </h2>
          <p className="lede">{brand.intro}</p>
        </div>
      </section>
      <section className="section" aria-labelledby="story-title">
        <h2 id="story-title">1919년 런던에서 시작했어요</h2>
        <p className="lede">
          소금과 후추를 가는 도구 하나로 100년을 넘겼어요. 세계 최초의 아크릴
          그라인더, 소금·후추 듀얼 그라인딩 특허 모두 콜앤메이슨에서 나왔어요.
        </p>
        <Photo
          path={brand.heritage_path}
          alt="1919년 무렵 런던 거리 사진 위에 놓인 Since 1919 표시"
          className="media square cm-story-image"
        />
        <ol className="list-plain timeline">
          {brand.story.map((item) => (
            <li key={item.year}>
              <span className="timeline-year">{item.year}</span>
              <span>{item.text}</span>
            </li>
          ))}
        </ol>
      </section>
      <section className="section" aria-labelledby="materials-title">
        <h2 id="materials-title">손에 닿는 세 가지 소재</h2>
        <ul className="list-plain trio">
          {brand.materials.map((material) => (
            <li key={material.name}>
              <span className="latin" lang="en">
                {material.name}
              </span>
              <span>{material.text}</span>
            </li>
          ))}
        </ul>
      </section>
      <section id="brand-film" className="section" aria-labelledby="film-title">
        <h2 id="film-title">영상으로 만나보세요</h2>
        <BrandFilm />
        <a
          className="text-button"
          href={`https://www.youtube.com/watch?v=${brand.video.youtube_id}`}
          target="_blank"
          rel="noreferrer"
        >
          유튜브에서 보기
          <ExternalLink size={14} aria-hidden="true" />
        </a>
        <h3 className="cm-series-title" lang="en">
          {brand.series.title}
        </h3>
        <p className="lede">{brand.series.description}</p>
        <a
          className="cm-series"
          href={brand.series.url}
          onClick={() => track("series_opened")}
          target="_blank"
          rel="noreferrer"
          aria-label="Tom Hunt 공식 요리 영상 시리즈 보기 (새 창)"
        >
          <Photo
            path={brand.series.image_path}
            alt="Tom Hunt가 리크 타르트를 들고 있는 영상 대표 이미지"
            className="media square"
          />
          <span className="cm-series-label">
            <Play size={18} aria-hidden="true" />
            공식 영상 시리즈 보기
            <ExternalLink size={14} aria-hidden="true" />
          </span>
        </a>
      </section>
      {selected && (
        <dialog
          ref={dialog}
          className="product-dialog"
          aria-labelledby="product-title"
          aria-describedby="product-description"
          onClose={() => setSelected(null)}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              const box = event.currentTarget.getBoundingClientRect();
              if (
                event.clientX < box.left ||
                event.clientX > box.right ||
                event.clientY < box.top ||
                event.clientY > box.bottom
              )
                dialog.current?.close();
            }
          }}
        >
          <button
            className="icon-button product-dialog-close"
            aria-label="상품 상세 닫기"
            autoFocus
            onClick={() => dialog.current?.close()}
          >
            <X />
          </button>
          <ProductPhotos product={selected} />
          <h2 id="product-title">{selected.name}</h2>
          <p className="product-dialog-price">{formatPrice(selected.price)}</p>
          <p id="product-description">
            {selected.description || "자세한 이야기는 매대에서 만나보세요."}
          </p>
        </dialog>
      )}
    </div>
  );
}

// Loads the YouTube player only after a tap, so the page stays light on mobile data.
function BrandFilm() {
  const [playing, setPlaying] = useState(false);
  const { youtube_id, title, poster_path } = brand.video;
  if (playing)
    return (
      <div className="media wide cm-film">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtube_id}?autoplay=1&rel=0&playsinline=1`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    );
  return (
    <button
      className="media wide cm-film"
      onClick={() => {
        setPlaying(true);
        track("brand_film_played");
      }}
      aria-label={`${title} 영상 재생`}
    >
      <img src={imageUrl(poster_path)} alt="" loading="lazy" decoding="async" />
      <span className="cm-film-play" aria-hidden="true">
        <Play size={26} fill="currentColor" />
      </span>
    </button>
  );
}

function ProductPhotos({ product }: { product: MarketProduct }) {
  const paths = [product.image_path, ...(product.gallery ?? [])].filter(
    (path): path is string => Boolean(path),
  );
  if (!paths.length) return null;
  if (paths.length === 1)
    return (
      <Photo
        path={paths[0]}
        alt={product.name}
        className="product-dialog-photo"
      />
    );
  return (
    <>
      <ul
        className="list-plain carousel"
        aria-label={`${product.name} 사진 ${paths.length}장`}
      >
        {paths.map((path, index) => (
          <li key={path}>
            <Photo
              path={path}
              alt={`${product.name} 사진 ${index + 1}/${paths.length}`}
              className="media portrait"
            />
          </li>
        ))}
      </ul>
      <p className="hint">
        옆으로 넘기면 사진 {paths.length}장을 볼 수 있어요.
      </p>
    </>
  );
}
