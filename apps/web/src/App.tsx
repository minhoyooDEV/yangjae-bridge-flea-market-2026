import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout, Loading, Message } from "./components";
import type { Market } from "./data/market";
import { track } from "./lib/analytics";
import { loadMarket } from "./lib/market-data";
import { BetaBooth } from "./pages/BetaBooth";

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; market: Market };

export default function App() {
  const [state, setState] = useState<State>({ status: "loading" });
  const load = useCallback(() => {
    setState({ status: "loading" });
    loadMarket().then(
      (market) => setState({ status: "ready", market }),
      (error: unknown) => {
        console.error(error);
        track("market_load_failed", {
          message: error instanceof Error ? error.message : String(error),
        });
        setState({ status: "error" });
      },
    );
  }, []);
  useEffect(load, [load]);

  if (state.status !== "ready")
    return (
      <Layout>
        {state.status === "loading" ? (
          <Loading>매대 정보를 불러오고 있어요</Loading>
        ) : (
          <Message error>
            매대 정보를 불러오지 못했어요.{" "}
            <button className="text-button" onClick={load}>
              다시 시도
            </button>
          </Message>
        )}
      </Layout>
    );
  return (
    <Layout brand={state.market.brand}>
      <Routes>
        <Route path="/" element={<BetaBooth market={state.market} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
