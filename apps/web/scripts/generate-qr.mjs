import QRCode from "qrcode";
import { mkdirSync, writeFileSync } from "node:fs";

const url = new URL(process.argv[2]);
if (url.protocol !== "https:")
  throw new Error("Use the verified public HTTPS address.");
mkdirSync("artifacts", { recursive: true });
const options = {
  errorCorrectionLevel: "M",
  margin: 4,
  width: 1024,
  color: { dark: "#244938", light: "#ffffff" },
};
await QRCode.toFile("artifacts/market-qr.png", url.href, options);
writeFileSync(
  "artifacts/market-qr.svg",
  await QRCode.toString(url.href, { ...options, type: "svg" }),
);
writeFileSync(
  "artifacts/README.md",
  `# 현장 QR\n\n연결 주소: [양재천 브릿지마켓](${url.href})\n\n- 인쇄용: market-qr.svg (확대해도 선명)\n- 일반 이미지: market-qr.png (1024 × 1024)\n- QR 주변 흰 여백을 자르지 않고 인쇄합니다.\n- 실제 휴대폰으로 인쇄 크기와 현장 통신 환경에서 마지막 확인을 합니다.\n`,
);
console.log(`QR generated for ${url.href}`);
