import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageview } from "../../lib/analytics";

/** Reports a page view whenever the route changes. Renders nothing. */
function RouteTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    // The page's own <title> is set a moment later (setPageTitle patches it in before the batch is sent).
    trackPageview(pathname, document.title);
  }, [pathname]);

  return null;
}

export default RouteTracker;
