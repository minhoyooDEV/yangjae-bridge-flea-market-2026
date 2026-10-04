import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ImageOff, Store, X } from "lucide-react";
import { booth, brand } from "./data/market";
import { imageUrl } from "./lib/public-image";

export function Brand() {
  return (
    <Link className="brand" to="/" aria-label="콜앤메이슨 매대 홈">
      <img
        src={imageUrl(brand.logo_path)}
        alt="Cole & Mason England"
        width="159"
        height="25"
      />
    </Link>
  );
}
export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        본문으로 건너뛰기
      </a>
      <header className="site-header">
        <Brand />
      </header>
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <footer className="site-footer">
        <p>콜앤메이슨 코리아는 {booth.market_name}에 참여해요.</p>
        <a href={brand.website} target="_blank" rel="noreferrer">
          공식몰 둘러보기
        </a>
      </footer>
    </div>
  );
}
export function Back({
  to = "/",
  children = "매대 보기",
}: {
  to?: string;
  children?: ReactNode;
}) {
  return (
    <Link className="back-link" to={to}>
      <ArrowLeft size={18} />
      {children}
    </Link>
  );
}
export function Message({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <div
      className={`message ${error ? "error" : ""}`}
      role={error ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
export function Loading({
  children = "마켓을 불러오고 있어요",
}: {
  children?: ReactNode;
}) {
  return (
    <div className="loading" role="status">
      <span className="spinner" />
      {children}
    </div>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty-state">
      <Store size={32} strokeWidth={1.4} />
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  );
}
export function Photo({
  path,
  alt,
  className = "",
  eager = false,
  zoom = false,
}: {
  path: string | null | undefined;
  alt: string;
  className?: string;
  eager?: boolean;
  zoom?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const url = imageUrl(path);
  useEffect(() => setFailed(false), [path]);
  const picture =
    url && !failed ? (
      <img
        src={url}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onError={() => setFailed(true)}
      />
    ) : (
      <div className="photo-placeholder">
        <ImageOff size={26} />
        <span>사진 준비 중</span>
      </div>
    );
  if (!zoom || !url || failed)
    return <div className={`photo ${className}`}>{picture}</div>;
  return (
    <>
      <button
        className={`photo photo-button ${className}`}
        onClick={() => dialog.current?.showModal()}
        aria-label={`${alt} 크게 보기`}
      >
        {picture}
        <span className="photo-zoom">사진 크게 보기</span>
      </button>
      <dialog
        ref={dialog}
        className="photo-dialog"
        aria-label={`${alt} 크게 보기`}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <button
          className="icon-button photo-close"
          onClick={() => dialog.current?.close()}
          aria-label="사진 닫기"
        >
          <X />
        </button>
        <img src={url} alt={alt} />
      </dialog>
    </>
  );
}
export function usePreview(file: File | null) {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    if (!file) {
      setUrl(undefined);
      return;
    }
    const value = URL.createObjectURL(file);
    setUrl(value);
    return () => URL.revokeObjectURL(value);
  }, [file]);
  return url;
}
