import { imageUrl } from "./lib/public-image";
import "./herb-keeper-film.css";

/** Self-hosted film: nothing plays or downloads in full until the visitor asks. */
export function HerbKeeperFilm() {
  return (
    <section className="herb-film" aria-labelledby="herb-film-title">
      <p className="herb-film-eyebrow">SELF-WATERING STORY</p>
      <h3 id="herb-film-title">물주기의 작은 발견</h3>
      <p>조립부터 물이 전달되는 원리까지, 30초 책장 이야기.</p>
      <video
        controls
        playsInline
        preload="none"
        poster={imageUrl("/films/herb-keeper-single-poster.png")}
        aria-label="자동급수 허브 키퍼 1구의 조립과 급수 원리, 30초 영상"
        aria-describedby="herb-film-transcript"
        width="1280"
        height="720"
      >
        <source
          src={imageUrl("/films/herb-keeper-single.mp4")}
          type="video/mp4"
        />
        <a href={imageUrl("/films/herb-keeper-single.mp4")}>영상 다운로드</a>
      </video>
      <details id="herb-film-transcript">
        <summary>영상 내용을 글로 읽기</summary>
        <p>
          펠트 패드를 상부 용기에 고정하고 양쪽 날개를 슬롯으로 내려주세요. 물통
          위에 용기를 올리고 기존 허브 화분을 그대로 넣습니다. 앞쪽 주입구로
          물을 채우면 패드가 물을 흡수해 화분에 수분을 전달합니다. 물 높이는
          주기적으로 확인하고 보충해주세요.
        </p>
        <p>
          영상 속 구조와 허브의 변화는 이해를 돕기 위한 연출입니다. 실제 식물의
          상태와 환경에 따라 변화가 다를 수 있습니다.
        </p>
      </details>
    </section>
  );
}
