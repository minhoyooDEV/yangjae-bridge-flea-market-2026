import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components";
import { BetaBooth } from "./pages/BetaBooth";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<BetaBooth />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
