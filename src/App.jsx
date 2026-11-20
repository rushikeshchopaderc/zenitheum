import { Suspense, lazy } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import ScrollToTop from "./components/layout/ScrollToTop";
import RouteFallback from "./components/layout/RouteFallback";
import CursorGlow from "./components/fx/CursorGlow";

// The site is one page (Home); careers, the privacy notice and the staff console are separate chunks.
const HomePage = lazy(() => import("./components/Home/HomePage"));
const CareersPage = lazy(() => import("./components/Careers/CareersPage"));
const JobDescriptionPage = lazy(() => import("./components/Careers/JobDescriptionPage"));
const PrivacyPage = lazy(() => import("./components/Privacy/PrivacyPage"));
const NotFoundPage = lazy(() => import("./components/NotFound/NotFoundPage"));
const AdminApp = lazy(() => import("./admin/AdminApp"));

/** Old addresses keep working: they land on the matching section of the one-page site. */
const SECTION_REDIRECTS = {
  "/products": "/#products",
  "/ip": "/#products",
  "/customers": "/#customers",
  "/clients": "/#customers",
  "/roadmap": "/#milestones",
  "/technology": "/#products",
  "/research": "/#products",
  "/about-us": "/#about",
  "/contactus": "/#demo",
  "/services": "/#products",
  "/services/aiservices": "/#products",
  "/trainings": "/",
};

function App() {
  const { pathname } = useLocation();

  // The staff console renders on its own, without the public navigation and effects.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return (
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <>
      <ScrollToTop />
      <CursorGlow />
      <Navbar />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/careers/:slug" element={<JobDescriptionPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          {Object.entries(SECTION_REDIRECTS).map(([from, to]) => (
            <Route key={from} path={from} element={<Navigate to={to} replace />} />
          ))}
          <Route path="/careers/joblistings-backend" element={<Navigate to="/careers" replace />} />
          <Route path="/careers/joblistings-datascientist" element={<Navigate to="/careers" replace />} />
          <Route path="/careers/joblistings-aibusinessanalyst" element={<Navigate to="/careers" replace />} />
          <Route path="/careers/backend-developer" element={<Navigate to="/careers" replace />} />
          <Route path="/careers/data-scientist" element={<Navigate to="/careers" replace />} />
          <Route path="/careers/ai-business-analyst" element={<Navigate to="/careers" replace />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
