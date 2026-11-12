import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import Logo from "../../assets/img/Zenitheum_removebg.webp";
import { totalOpenings } from "@shared/jobs.js";

const navItems = [
  { label: "Products", to: "/products" },
  { label: "Customers", to: "/customers" },
  { label: "Roadmap", to: "/roadmap" },
  { label: "Technology", to: "/technology" },
  { label: "About", to: "/about-us" },
  { label: "Careers", to: "/careers", badge: totalOpenings },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const progressRef = useRef(null);
  const location = useLocation();

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Solidify the bar once the page scrolls, and drive the progress line (no re-render per frame).
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 12);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [location.pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Escape closes the drawer.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const linkClasses = ({ isActive }) =>
    `relative inline-flex min-h-[44px] items-center rounded-full px-3.5 py-2 text-sm font-medium transition duration-200 xl:px-4 ${
      isActive ? "text-white" : "text-zinc-400 hover:text-white"
    }`;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-accent-700 focus:px-5 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <header
        className={`sticky top-0 z-50 border-b transition duration-300 ${
          scrolled ? "border-white/10 bg-ink-900/85 backdrop-blur-xl" : "border-transparent bg-ink-900/55 backdrop-blur-md"
        }`}
      >
        <div className="shell flex h-[68px] items-center justify-between gap-4">
          <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="Zenitheum home">
            <img src={Logo} alt="" aria-hidden="true" width="40" height="40" className="h-10 w-10 object-contain" />
            <span className="leading-none">
              <span className="block font-display text-xl font-bold italic tracking-tight text-white">Zenitheum</span>
              <span className="mt-1 hidden font-mono text-[9px] font-medium uppercase tracking-[0.3em] text-accent-400 sm:block">
                Fabless semiconductor
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClasses}>
                {({ isActive }) => (
                  <>
                    {item.label}
                    {item.badge ? (
                      <span className="ml-1.5 rounded-full bg-accent-600/25 px-1.5 py-0.5 font-mono text-[10px] leading-none text-accent-300">
                        {item.badge}
                      </span>
                    ) : null}
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-gradient-to-r from-accent-500 to-cyan-300"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/contactus" className="btn-primary hidden min-h-[44px] !px-6 !py-2.5 !text-xs sm:inline-flex">
              Get in touch
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10 lg:hidden"
            >
              {menuOpen ? <FaTimes size={16} /> : <FaBars size={16} />}
            </button>
          </div>
        </div>
        {/* Page scroll progress */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px overflow-hidden">
          <div
            ref={progressRef}
            className="h-full origin-left scale-x-0 bg-gradient-to-r from-accent-600 via-accent-400 to-cyan-300"
          />
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        id="mobile-nav"
        className={`fixed inset-0 z-40 lg:hidden ${menuOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!menuOpen}
      >
        <div
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-ink-900/80 backdrop-blur-sm transition-opacity duration-300 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <nav
          aria-label="Mobile"
          className={`absolute right-0 top-0 flex h-full w-[min(20rem,88vw)] flex-col border-l border-white/10 bg-ink-800 px-6 pb-10 pt-24 transition-transform duration-300 ease-out ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <ul className="flex flex-col gap-1">
            {[{ label: "Home", to: "/" }, ...navItems].map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  tabIndex={menuOpen ? 0 : -1}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-xl px-4 py-3 text-lg transition ${
                      isActive ? "bg-accent-600/15 font-semibold text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  {item.label}
                  {item.badge ? (
                    <span className="rounded-full bg-accent-600/25 px-2 py-0.5 font-mono text-xs text-accent-300">
                      {item.badge} open
                    </span>
                  ) : null}
                </NavLink>
              </li>
            ))}
          </ul>
          <Link to="/contactus" tabIndex={menuOpen ? 0 : -1} className="btn-primary mt-8 w-full">
            Get in touch
          </Link>
        </nav>
      </div>
    </>
  );
}

export default Navbar;
