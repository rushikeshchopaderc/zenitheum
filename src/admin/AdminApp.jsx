import { useCallback, useEffect, useMemo, useState } from "react";
import { Route, Routes } from "react-router-dom";

import "./admin.css";
import { api, onUnauthorized } from "./api";
import { ErrorBanner } from "./components/Feedback";
import Icon from "./components/icons";
import LoginScreen from "./components/LoginScreen";
import Shell from "./components/Shell";
import ToastProvider from "./components/ToastProvider";
import { AuthContext } from "./context/contexts";
import { useRobotsMeta } from "./hooks/useMisc";
import ActivityPage from "./pages/ActivityPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import AudiencePage from "./pages/AudiencePage";
import CampaignsPage from "./pages/CampaignsPage";
import LeadsPage from "./pages/LeadsPage";
import NotFoundPage from "./pages/NotFoundPage";
import OverviewPage from "./pages/OverviewPage";
import RoadmapPage from "./pages/RoadmapPage";
import SubscribersPage from "./pages/SubscribersPage";
import VisitorsPage from "./pages/VisitorsPage";

/** Signed in: the frame plus one route per screen (paths are relative to /admin). */
function Console() {
  return (
    <Shell>
      <Routes>
        <Route index element={<OverviewPage />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="subscribers" element={<SubscribersPage />} />
        <Route path="visitors" element={<VisitorsPage />} />
        <Route path="campaigns" element={<CampaignsPage />} />
        <Route path="audience" element={<AudiencePage />} />
        <Route path="roadmap" element={<RoadmapPage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Shell>
  );
}

/** Decides between "checking", "sign in" and the console. The session itself lives in an HttpOnly cookie. */
function AuthGate() {
  const [auth, setAuth] = useState({ status: "checking", admin: null, notice: "", tone: "info", error: null });
  const [attempt, setAttempt] = useState(0);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setAuth((current) => (current.status === "error" ? { ...current, status: "checking" } : current));
    api.me(controller.signal).then(
      (response) => setAuth({ status: "in", admin: response.admin, notice: "", tone: "info", error: null }),
      (error) => {
        if (error?.name === "AbortError") return;
        if (error.status === 401) setAuth({ status: "out", admin: null, notice: "", tone: "info", error: null });
        else setAuth({ status: "error", admin: null, notice: "", tone: "info", error });
      },
    );
    return () => controller.abort();
  }, [attempt]);

  // Any request that comes back 401 means the session ended: back to sign-in, keeping the URL.
  useEffect(
    () =>
      onUnauthorized(() =>
        setAuth((current) =>
          current.status === "in"
            ? { status: "out", admin: null, notice: "Your session has expired. Sign in again to carry on where you were.", tone: "warn", error: null }
            : current,
        ),
      ),
    [],
  );

  const signOut = useCallback(async () => {
    setSigningOut(true);
    try {
      await api.logout();
    } catch {
      /* the cookie is cleared server-side on success; either way we leave the console */
    }
    setSigningOut(false);
    setAuth({ status: "out", admin: null, notice: "You have been signed out.", tone: "info", error: null });
  }, []);

  const value = useMemo(() => ({ admin: auth.admin, signOut, signingOut }), [auth.admin, signOut, signingOut]);

  if (auth.status === "checking") {
    return (
      <div className="adm-boot" role="status">
        <Icon name="spinner" size={22} className="adm-spin" />
        <span>Checking your session…</span>
      </div>
    );
  }
  if (auth.status === "error") {
    return (
      <div className="adm-boot">
        <div style={{ width: "min(520px, 100%)" }}>
          <ErrorBanner error={auth.error} onRetry={() => setAttempt((value) => value + 1)} title="Couldn’t reach the console." />
        </div>
      </div>
    );
  }
  if (auth.status === "out") {
    return <LoginScreen notice={auth.notice} noticeTone={auth.tone} onSignedIn={(admin) => setAuth({ status: "in", admin, notice: "", tone: "info", error: null })} />;
  }
  return (
    <AuthContext.Provider value={value}>
      <Console />
    </AuthContext.Provider>
  );
}

/**
 * The staff console. Rendered standalone (no public navigation) at /admin/*.
 * Everything inside is scoped under .adm so the stylesheet never touches the public pages.
 */
export default function AdminApp() {
  useRobotsMeta();
  return (
    <div className="adm">
      <ToastProvider>
        <AuthGate />
      </ToastProvider>
    </div>
  );
}
