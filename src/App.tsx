import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, RequireVendor } from "./auth";
import { Back, Empty, Layout, Loading } from "./components";
import { BoothDetail, Market, Visit } from "./pages/Market";
const BoothEditor = lazy(() =>
  import("./pages/Vendor").then((module) => ({ default: module.BoothEditor })),
);
const Login = lazy(() =>
  import("./pages/Vendor").then((module) => ({ default: module.Login })),
);
const ProductEditor = lazy(() =>
  import("./pages/Vendor").then((module) => ({
    default: module.ProductEditor,
  })),
);
const VendorDashboard = lazy(() =>
  import("./pages/Vendor").then((module) => ({
    default: module.VendorDashboard,
  })),
);

export default function App() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <AuthProvider>
      <Layout>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Market />} />
            <Route path="/booths/:id" element={<BoothDetail />} />
            <Route path="/visit" element={<Visit />} />
            <Route path="/vendor/login" element={<Login />} />
            <Route
              path="/vendor"
              element={
                <RequireVendor>
                  <VendorDashboard />
                </RequireVendor>
              }
            />
            <Route
              path="/vendor/booth"
              element={
                <RequireVendor>
                  <BoothEditor />
                </RequireVendor>
              }
            />
            <Route
              path="/vendor/products/new"
              element={
                <RequireVendor>
                  <ProductEditor key="new" />
                </RequireVendor>
              }
            />
            <Route
              path="/vendor/products/:id"
              element={
                <RequireVendor>
                  <ProductEditor key={location.pathname} />
                </RequireVendor>
              }
            />
            <Route
              path="*"
              element={
                <div className="detail-page">
                  <Back />
                  <Empty title="길을 조금 벗어났어요">
                    매대 목록으로 돌아가 다시 둘러보세요.
                  </Empty>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </Layout>
    </AuthProvider>
  );
}
