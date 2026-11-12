import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { OverlayContext, useAuth } from "../context/contexts";
import { focusPageTitle } from "../dom";
import { useMediaQuery } from "../hooks/useMisc";
import Drawer from "./Drawer";
import Icon from "./icons";

const NAV = [
  { label: "Dashboard", items: [{ to: "/admin", end: true, icon: "overview", text: "Overview" }] },
  {
    label: "People",
    items: [
      { to: "/admin/leads", icon: "leads", text: "Leads" },
      { to: "/admin/applications", icon: "applications", text: "Applications" },
      { to: "/admin/subscribers", icon: "subscribers", text: "Subscribers" },
    ],
  },
  {
    label: "Website",
    items: [
      { to: "/admin/visitors", icon: "visitors", text: "Visitors" },
      { to: "/admin/campaigns", icon: "campaigns", text: "Campaigns" },
      { to: "/admin/audience", icon: "audience", text: "Audience" },
    ],
  },
  {
    label: "Company",
    items: [
      { to: "/admin/roadmap", icon: "roadmap", text: "Roadmap" },
      { to: "/admin/activity", icon: "history", text: "Activity log" },
    ],
  },
];

const currentSection = (pathname) => {
  const clean = pathname.replace(/\/+$/, "") || "/admin";
  for (const group of NAV) {
    for (const item of group.items) {
      if (item.end ? clean === item.to : clean === item.to || clean.startsWith(`${item.to}/`)) return { group: group.label, text: item.text };
    }
  }
  return { group: "", text: "Admin" };
};

function Brand({ compact = false }) {
  return (
    <NavLink to="/admin" end className="adm-brand" aria-label="Zenitheum admin, go to overview" style={compact ? { padding: 0 } : undefined}>
      <span className="adm-brand__mark" aria-hidden="true">
        Z
      </span>
      <span>
        <span className="adm-brand__name">Zenitheum</span>
        {compact ? null : <span className="adm-brand__tag">Admin console</span>}
      </span>
    </NavLink>
  );
}

function NavList({ onNavigate }) {
  return (
    <nav className="adm-nav" aria-label="Admin">
      {NAV.map((group) => (
        <div key={group.label}>
          <div className="adm-nav__label">{group.label}</div>
          <ul className="adm-nav__list">
            {group.items.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.end} onClick={onNavigate}>
                  <Icon name={item.icon} size={18} />
                  {item.text}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function WhoAmI() {
  const { admin, signOut, signingOut } = useAuth();
  return (
    <div className="adm-side__foot">
      <div className="adm-who">
        <div className="adm-who__label">Signed in as</div>
        <div className="adm-who__email">{admin.email}</div>
      </div>
      <button type="button" className="adm-btn adm-btn--block" onClick={signOut} disabled={signingOut}>
        <Icon name="logout" size={16} /> Sign out
      </button>
    </div>
  );
}

function SiteLink() {
  return (
    <div className="adm-side__site">
      <a href="/" target="_blank" rel="noopener noreferrer" className="adm-sitelink">
        <Icon name="external" size={16} />
        View the public site
      </a>
    </div>
  );
}

function MobileMenu({ onClose }) {
  return (
    <Drawer side="left" title="Menu" onClose={onClose} closeLabel="Close menu">
      <NavList onNavigate={onClose} />
      <SiteLink />
      <WhoAmI />
    </Drawer>
  );
}

/** The signed-in frame: sidebar (wide screens), top bar, slide-over menu (small screens) and the page area. */
export default function Shell({ children }) {
  const { admin, signOut, signingOut } = useAuth();
  const location = useLocation();
  const [overlayRoot, setOverlayRoot] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const wide = useMediaQuery("(min-width: 1024px)");
  const mainRef = useRef(null);
  const lastPath = useRef(location.pathname);
  const section = currentSection(location.pathname);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // The slide-over only exists on small screens: close it if the window grows past the breakpoint.
  useEffect(() => {
    if (wide) setMenuOpen(false);
  }, [wide]);

  // Route change (not a filter change): back to the top, and focus the new page's heading for assistive tech.
  useEffect(() => {
    // Compares with the last path (not a "first render" flag) so React StrictMode's double effect run is harmless.
    if (lastPath.current === location.pathname) return;
    lastPath.current = location.pathname;
    window.scrollTo(0, 0);
    focusPageTitle();
  }, [location.pathname]);

  const skip = (event) => {
    event.preventDefault();
    mainRef.current?.focus();
  };

  return (
    <OverlayContext.Provider value={overlayRoot}>
      <div className="adm-frame" data-adm-inert>
        <a className="adm-skip" href="#adm-main" onClick={skip}>
          Skip to main content
        </a>
        <aside className="adm-side" aria-label="Sidebar">
          <Brand />
          <NavList />
          <SiteLink />
        </aside>
        <div className="adm-main">
          <header className="adm-topbar">
            <button type="button" className="adm-iconbtn adm-iconbtn--bordered adm-menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}>
              <Icon name="menu" size={20} />
            </button>
            <div className="adm-topbar__brand">
              <Brand compact />
            </div>
            <div className="adm-topbar__title" aria-hidden="true">
              {section.group && wide ? <span className="adm-muted">{section.group} / </span> : null}
              {wide ? section.text : null}
            </div>
            <div className="adm-topbar__who" title={admin.email}>
              <span className="adm-muted">Signed in as </span>
              {admin.email}
            </div>
            <button type="button" className="adm-btn adm-btn--sm adm-signout" onClick={signOut} disabled={signingOut} aria-label="Sign out">
              <Icon name="logout" size={16} />
              <span className="adm-signout__text">Sign out</span>
            </button>
          </header>
          <main id="adm-main" className="adm-content" tabIndex={-1} ref={mainRef}>
            {children}
          </main>
        </div>
      </div>
      {menuOpen && !wide ? <MobileMenu onClose={closeMenu} /> : null}
      <div className="adm-overlays" ref={setOverlayRoot} />
    </OverlayContext.Provider>
  );
}
