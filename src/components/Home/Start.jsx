import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { FaEnvelope, FaPhoneAlt } from "react-icons/fa";
import { CHIPS, SEGMENTS, ids } from "@shared/market.js";
import { SITE } from "@shared/site.js";
import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import Reveal from "../common/Reveal";
import DemoForm from "../forms/DemoForm";
import OrderForm from "../forms/OrderForm";
import QuestionForm from "../forms/QuestionForm";

const TABS = [
  { id: "demo", label: "Book a demo", blurb: "A 30-minute Google Meet call: see how the chip connects to your device and what we can tailor." },
  { id: "order", label: "Place an order", blurb: "Tell us the chip, quantity, delivery date and place. We confirm price and delivery by email." },
  { id: "ask", label: "Ask a question", blurb: "Not ready for a call? Send us a question and we will reply." },
];

const known = (list, id) => (ids(list).includes(id) ? id : "");

/**
 * The call to action: three tabs (demo, order, question). Links elsewhere on the page arrive here as
 * /?segment=weighing&chip=analog#demo, so the form is already open on the right tab and pre-filled.
 */
export default function Start() {
  const { search, hash, key } = useLocation();
  const [tab, setTab] = useState("demo");
  const tabsRef = useRef([]);

  useEffect(() => {
    const wanted = hash.slice(1);
    if (TABS.some((t) => t.id === wanted)) setTab(wanted);
  }, [hash, key]);

  const defaults = useMemo(() => {
    const params = new URLSearchParams(search);
    return { segment: known(SEGMENTS, params.get("segment")), chip: known(CHIPS, params.get("chip")) };
  }, [search]);
  const formKey = `${tab}:${search}:${key}`;

  const onKeyDown = (event) => {
    const i = TABS.findIndex((t) => t.id === tab);
    const next = { ArrowRight: (i + 1) % TABS.length, ArrowLeft: (i + TABS.length - 1) % TABS.length, Home: 0, End: TABS.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setTab(TABS[next].id);
    tabsRef.current[next]?.focus();
  };

  const active = TABS.find((t) => t.id === tab);

  return (
    <Section id="start" glow>
      {/* Targets for /#demo, /#order and /#ask */}
      <span id="demo" className="absolute -top-20" aria-hidden="true" />
      <span id="order" className="absolute -top-20" aria-hidden="true" />
      <span id="ask" className="absolute -top-20" aria-hidden="true" />

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] lg:gap-14">
        <div>
          <SectionHeading eyebrow="Get started" title="See it. Order it. Shape it." />
          <Reveal delay={120}>
            <p className="mt-6 text-lg leading-relaxed text-zinc-400">{active.blurb}</p>
            <ul className="mt-8 space-y-4 text-zinc-300">
              <li className="flex items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-accent-300"><FaEnvelope size={15} /></span>
                <a href={`mailto:${SITE.emails.team}`} className="inline-flex min-h-[44px] items-center break-all transition hover:text-accent-300">{SITE.emails.team}</a>
              </li>
              <li className="flex items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-accent-300"><FaPhoneAlt size={14} /></span>
                <a href={SITE.phone.href} className="inline-flex min-h-[44px] items-center transition hover:text-accent-300">{SITE.phone.label}</a>
              </li>
            </ul>
          </Reveal>
        </div>

        <div>
          <div className="inline-flex max-w-full flex-wrap gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-1" role="tablist" aria-label="How would you like to start?" onKeyDown={onKeyDown}>
            {TABS.map((t, i) => (
              <button
                key={t.id}
                ref={(el) => (tabsRef.current[i] = el)}
                id={`tab-${t.id}`}
                role="tab"
                type="button"
                aria-selected={tab === t.id}
                aria-controls="start-panel"
                tabIndex={tab === t.id ? 0 : -1}
                onClick={() => setTab(t.id)}
                className={`min-h-[44px] rounded-xl px-4 py-2 text-sm font-semibold transition ${tab === t.id ? "bg-accent-700 text-white shadow-lg shadow-accent-950/50" : "text-zinc-400 hover:text-white"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div id="start-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="mt-5">
            {tab === "demo" && <DemoForm key={formKey} defaults={defaults} />}
            {tab === "order" && <OrderForm key={formKey} defaults={defaults} />}
            {tab === "ask" && <QuestionForm key={formKey} defaults={defaults} />}
          </div>
        </div>
      </div>
    </Section>
  );
}
