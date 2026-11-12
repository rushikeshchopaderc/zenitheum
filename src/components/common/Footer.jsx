import { Link } from "react-router-dom";
import { FaEnvelope, FaLinkedinIn, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import logoImage from "../../assets/img/Zenitheum_removebg.webp";
import { SITE } from "@shared/site.js";
import { totalOpenings } from "@shared/jobs.js";
import SubscribeForm from "../forms/SubscribeForm";
import { OPEN_EVENT } from "../layout/ConsentBanner";

const explore = [
  { label: "Home", to: "/" },
  { label: "Products", to: "/products" },
  { label: "Customers", to: "/customers" },
  { label: "Roadmap 2026–27", to: "/roadmap" },
  { label: "Technology", to: "/technology" },
  { label: "About", to: "/about-us" },
  { label: "Careers", to: "/careers", note: `${totalOpenings} open` },
  { label: "Contact", to: "/contactus" },
];

function Footer() {
  return (
    <footer className="relative mt-auto border-t border-white/10 bg-ink-950">
      <div aria-hidden="true" className="grid-lines pointer-events-none absolute inset-0 opacity-30 mask-fade-b" />
      <div className="shell relative py-16 sm:py-20">
        <div className="grid gap-14 lg:grid-cols-[1.15fr_0.7fr_1fr] lg:gap-16">
          {/* Brand + early access */}
          <div>
            <Link to="/" className="flex items-center gap-4">
              <img src={logoImage} alt="" aria-hidden="true" width="56" height="56" className="h-14 w-14 object-contain" />
              <span className="leading-none">
                <span className="block font-display text-3xl font-bold italic text-white">Zenitheum</span>
                <span className="mt-1.5 block font-mono text-[10px] uppercase tracking-[0.3em] text-accent-400">
                  Fabless semiconductor company
                </span>
              </span>
            </Link>
            <p className="mt-6 max-w-md leading-relaxed text-zinc-400">
              A fabless semiconductor startup from Khamgaon, designing two chips with the customers who will use them: ZT-AFE1, an analog sensor
              front-end, and ZT-SEC1, a digital secure-authentication chip.
            </p>
            <div className="mt-8 max-w-md">
              <p className="mono-label mb-3">Get release news</p>
              <SubscribeForm source="footer" />
            </div>
            <a
              href={SITE.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Zenitheum on LinkedIn"
              className="mt-8 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 transition duration-200 hover:-translate-y-0.5 hover:border-accent-500/50 hover:bg-accent-600/20 hover:text-white"
            >
              <FaLinkedinIn size={16} />
            </a>
          </div>

          {/* Sitemap */}
          <nav aria-label="Footer">
            <h2 className="mono-label !text-zinc-500">Explore</h2>
            <ul className="mt-3">
              {explore.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="inline-flex min-h-[44px] items-center gap-2 text-zinc-300 transition hover:text-accent-300">
                    {link.label}
                    {link.note && (
                      <span className="rounded-full bg-accent-600/20 px-2 py-0.5 font-mono text-[10px] text-accent-300">{link.note}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h2 className="mono-label !text-zinc-500">Reach us</h2>
            <ul className="mt-5 space-y-6">
              <li className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-accent-300">
                  <FaMapMarkerAlt size={15} />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-white">Head office</span>
                  <span className="mt-1 block text-sm leading-relaxed text-zinc-400">
                    {SITE.address[0]}
                    <br />
                    {SITE.address[1]}
                  </span>
                </span>
              </li>
              <li className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-accent-300">
                  <FaPhoneAlt size={14} />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-white">Hotline</span>
                  <a href={SITE.phone.href} className="mt-1 flex min-h-[44px] items-center text-sm text-zinc-400 transition hover:text-accent-300">
                    {SITE.phone.label}
                  </a>
                </span>
              </li>
              <li className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-accent-300">
                  <FaEnvelope size={14} />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-white">Mail us</span>
                  <span className="mt-1 flex flex-col text-sm text-zinc-400">
                    {Object.values(SITE.emails).map((address) => (
                      <a key={address} href={`mailto:${address}`} className="flex min-h-[44px] items-center transition hover:text-accent-300">
                        {address}
                      </a>
                    ))}
                  </span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-8 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-zinc-500">&copy; {new Date().getFullYear()} Zenitheum. All rights reserved.</p>
          <p className="flex flex-wrap items-center gap-x-5 gap-y-2 text-zinc-500">
            <Link to="/privacy" className="inline-flex min-h-[44px] items-center transition hover:text-accent-300">
              Privacy
            </Link>
            <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))} className="inline-flex min-h-[44px] items-center transition hover:text-accent-300">
              Analytics settings
            </button>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em]">Fabless · Designed in India · Tape-out focused</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
