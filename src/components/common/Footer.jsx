import { Link } from "react-router-dom";
import { FaLinkedinIn } from "react-icons/fa";
import logoImage from "../../assets/img/Zenitheum_removebg.webp";
import { SITE } from "@shared/site.js";
import SubscribeForm from "../forms/SubscribeForm";

function Footer() {
  return (
    <footer className="relative mt-auto border-t border-white/10 bg-ink-950">
      <div aria-hidden="true" className="grid-lines pointer-events-none absolute inset-0 opacity-30 mask-fade-b" />
      <div className="shell relative py-14 sm:py-16">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <Link to="/" className="flex items-center gap-4" aria-label="Zenitheum home">
              <img src={logoImage} alt="" aria-hidden="true" width="56" height="56" className="h-14 w-14 object-contain" />
              <span className="leading-none">
                <span className="block font-display text-3xl font-bold italic text-white">Zenitheum</span>
                <span className="mt-1.5 block font-mono text-[10px] uppercase tracking-[0.3em] text-accent-400">Fabless semiconductor company</span>
              </span>
            </Link>
            <ul className="mt-8 space-y-1 text-zinc-400">
              <li>
                <a href={`mailto:${SITE.emails.team}`} className="flex min-h-[44px] items-center break-all transition hover:text-accent-300">
                  {SITE.emails.team}
                </a>
              </li>
              <li>
                <a href={SITE.phone.href} className="flex min-h-[44px] items-center transition hover:text-accent-300">
                  {SITE.phone.label}
                </a>
              </li>
            </ul>
            <a
              href={SITE.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Zenitheum on LinkedIn"
              className="mt-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 transition duration-200 hover:-translate-y-0.5 hover:border-accent-500/50 hover:bg-accent-600/20 hover:text-white"
            >
              <FaLinkedinIn size={16} />
            </a>
          </div>

          <div>
            <h2 className="mono-label !text-zinc-500">Chip release news</h2>
            <p className="mt-3 max-w-md text-zinc-400">Be first to hear when a chip is released.</p>
            <SubscribeForm source="footer" className="mt-5 max-w-lg" />
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-zinc-500">&copy; {new Date().getFullYear()} Zenitheum. All rights reserved.</p>
          <p className="flex flex-wrap items-center gap-x-6 text-zinc-500">
            <Link to="/careers" className="inline-flex min-h-[44px] items-center transition hover:text-accent-300">
              Careers
            </Link>
            <Link to="/privacy" className="inline-flex min-h-[44px] items-center transition hover:text-accent-300">
              Privacy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
