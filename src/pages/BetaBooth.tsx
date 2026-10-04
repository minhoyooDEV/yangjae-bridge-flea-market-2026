import { useEffect, useRef, useState } from "react";
import { ExternalLink, MapPin, Play, X } from "lucide-react";
import { Empty, Photo } from "../components";
import { booth, brand, products, type MarketProduct } from "../data/market";
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
      <section className="cm-hero inverse" aria-labelledby="hero-title">
        <img
          className="cm-hero-image"
          src={imageUrl(brand.hero_path)}
          alt=""
          fetchPriority="high"
        />
        <div className="cm-hero-copy">
          <p className="hint">
            {booth.market_name} 매대 {booth.booth_number}
          </p>
          <h1 id="hero-title" className="display" lang="en">
            {brand.tagline}
          </h1>
          <p className="lede">{brand.intro}</p>
          <div className="cm-actions">
            <a className="button light" href="#brand-film">
              <Play size={16} aria-hidden="true" />
              브랜드 영상 보기
            </a>
            <a className="button outline" href="#booth-location">
              <MapPin size={16} aria-hidden="true" />
              매대 위치 보기
            </a>
          </div>
        </div>
      </section>
      {booth.is_sample && (
        <p className="sample-note">
          미리보기 · 상품과 가격은 공식몰 기준 예시이며 현장 판매 정보는 준비
          중이에요.
        </p>
      )}
      <section id="brand-film" className="section" aria-labelledby="film-title">
        <h2 id="film-title">영상으로 먼저 만나보세요</h2>
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
      <section className="section" aria-labelledby="products-title">
        <h2 id="products-title">매대에서 만나는 그라인더</h2>
        <p className="hint">물건을 누르면 자세한 설명이 열려요.</p>
        <ul className="list-plain grid-2">
          {products.map((product) => (
            <li key={product.id}>
              <button
                className="cm-product"
                aria-haspopup="dialog"
                onClick={(event) => {
                  opener.current = event.currentTarget;
                  setSelected(product);
                }}
              >
                <Photo
                  path={product.image_path}
                  alt=""
                  className="media square"
                />
                <span>{product.name}</span>
                <strong className="price">{formatPrice(product.price)}</strong>
              </button>
            </li>
          ))}
        </ul>
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
        {booth.image_path && (
          <Photo
            path={booth.image_path}
            alt={`${booth.market_name} ${booth.name} 매대 사진`}
            className="media landscape"
            zoom
          />
        )}
        <p className="cm-location-number">
          <span className="sr-only">매대 </span>
          {booth.booth_number}
        </p>
        <div>
          <h2 id="location-title">{booth.market_name}에서 만나요</h2>
          <p className="cm-location-place">
            <MapPin size={18} aria-hidden="true" />
            {booth.location_text}
          </p>
          <p className="lede">{booth.description}</p>
        </div>
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
          {selected.image_path && (
            <Photo
              path={selected.image_path}
              alt={selected.name}
              className="product-dialog-photo"
            />
          )}
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
      onClick={() => setPlaying(true)}
      aria-label={`${title} 영상 재생`}
    >
      <img src={imageUrl(poster_path)} alt="" loading="lazy" decoding="async" />
      <span className="cm-film-play" aria-hidden="true">
        <Play size={26} fill="currentColor" />
      </span>
    </button>
  );
}
