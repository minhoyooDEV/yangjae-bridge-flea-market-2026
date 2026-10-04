import { useEffect, useRef, useState } from "react";
import { ChevronRight, MapPin, X } from "lucide-react";
import { Empty, Photo } from "../components";
import { booth, products, type MarketProduct } from "../data/market";
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
    <div className="beta-page">
      <div className="beta-heading">
        <p className="eyebrow">계단 위, 오늘의 작은 발견</p>
        <h1>{booth.name}</h1>
        {booth.is_sample && (
          <p className="sample-note">
            미리보기 · 상품과 가격은 예시이며 실제 판매 정보는 준비 중이에요.
          </p>
        )}
      </div>
      <Photo
        path={booth.image_path}
        alt={`${booth.name} 매대 사진`}
        className="beta-photo"
        eager
        zoom
      />
      {booth.description && (
        <p className="beta-description">{booth.description}</p>
      )}
      <section className="beta-products" aria-labelledby="products-title">
        <h2 id="products-title">오늘의 물건들</h2>
        <p className="beta-hint">궁금한 물건을 터치해 자세히 살펴보세요.</p>
        <ul className="beta-product-list">
          {products.map((product) => (
            <li key={product.id}>
              <button
                className="beta-product-row"
                aria-haspopup="dialog"
                onClick={(event) => {
                  opener.current = event.currentTarget;
                  setSelected(product);
                }}
              >
                <span className="beta-product-name">{product.name}</span>
                <strong>{formatPrice(product.price)}</strong>
                <ChevronRight size={18} aria-hidden="true" />
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
        className="location-box"
        aria-label="매대 위치"
      >
        <MapPin size={22} aria-hidden="true" />
        <div>
          <strong>매대 {booth.booth_number}에서 만나요</strong>
          <p>{booth.location_text}</p>
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
