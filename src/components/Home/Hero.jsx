import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Reveal from "../common/Reveal";
import CircuitCanvas from "../fx/CircuitCanvas";
import ChipStack from "../fx/ChipStack";
import ProgrammeClock from "../fx/ProgrammeClock";
import CountUp from "../fx/CountUp";
import { totalOpenings } from "@shared/jobs.js";

const stats = [
  { value: 2, unit: "", label: "Chips in development", note: "ZT-SEC1 · ZT-AFE1" },
  { value: "3–4", unit: "mo", label: "Digital soft-IP phase", note: "ZT-SEC1" },
  { value: 12, unit: "mo", label: "Analog silicon proof", note: "ZT-AFE1" },
  { value: 180, unit: "nm", label: "Target process", note: "SCL via MPW" },
];

function Hero() {
  const heroRef = useRef(null);
  const anchorRef = useRef(null);
  const stageRef = useRef(null);

  // Tilt the chip stack toward the pointer (eased; fine pointers only).
  useEffect(() => {
    const hero = heroRef.current;
    const stage = stageRef.current;
    if (!hero || !stage) return undefined;
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }
    let frame = 0;
    let cx = 0;
    let cy = 0;
    let tx = 0;
    let ty = 0;

    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      stage.style.setProperty("--tx", cx.toFixed(2));
      stage.style.setProperty("--ty", cy.toFixed(2));
      frame = Math.abs(tx - cx) > 0.02 || Math.abs(ty - cy) > 0.02 ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (event) => {
      const rect = hero.getBoundingClientRect();
      tx = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
      ty = ((event.clientY - rect.top) / rect.height - 0.5) * -8;
      if (!frame) frame = requestAnimationFrame(tick);
    };
    hero.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      hero.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header ref={heroRef} className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="glow pointer-events-none absolute inset-0 -z-20" />
      <div aria-hidden="true" className="grid-lines pointer-events-none absolute inset-0 -z-20 opacity-40 mask-fade-b" />
      <div className="net-mask absolute inset-0 -z-10">
        <CircuitCanvas anchorRef={anchorRef} />
      </div>

      <div className="shell relative">
        <div className="grid items-center gap-4 py-14 sm:py-16 lg:min-h-[min(44rem,calc(100svh-68px-7rem))] lg:grid-cols-[1.08fr_0.92fr] lg:gap-8 lg:py-16">
          <div className="relative z-10">
            <Reveal>
              <span className="eyebrow">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-accent-400" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-400" />
                </span>
                Fabless semiconductor company · Khamgaon, India
              </span>
            </Reveal>

            <Reveal delay={90}>
              <h1 className="fluid-display mt-8 font-extrabold">
                <span className="text-gradient">Chips for India&apos;s</span>
                <br />
                <span className="text-gradient-blue text-glow">instruments</span>{" "}
                <span className="text-gradient">and meters.</span>
              </h1>
            </Reveal>

            <Reveal delay={170}>
              <p className="fluid-lead mt-8 max-w-xl text-zinc-300">
                Zenitheum is a fabless semiconductor startup designing two chips with the customers who will use them:{" "}
                <b className="font-semibold text-white">ZT-AFE1</b>, a 24-bit analog sensor front-end, and{" "}
                <b className="font-semibold text-white">ZT-SEC1</b>, a digital secure-authentication chip that proves a device is genuine.
              </p>
            </Reveal>

            <Reveal delay={250}>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link to="/contactus?topic=design-partner" data-cta="hero-design-partner" className="btn-primary">
                  Become a design partner
                </Link>
                <Link to="/roadmap#milestones" data-cta="hero-milestones" className="btn-ghost">
                  See our milestones
                </Link>
                <Link to="/careers" data-cta="hero-careers" className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-300 transition hover:text-white">
                  Join the team
                  <span className="rounded-full bg-accent-600/30 px-2 py-0.5 font-mono text-[11px] normal-case tracking-normal text-accent-200">
                    {totalOpenings} open
                  </span>
                </Link>
              </div>
            </Reveal>

            <Reveal delay={330}>
              <ProgrammeClock className="mt-10 w-full max-w-md" />
            </Reveal>
          </div>

          <div ref={anchorRef} className="relative z-0 mx-auto w-full max-w-[31rem] lg:mx-0 lg:justify-self-end">
            <div ref={stageRef}>
              <ChipStack />
            </div>
          </div>
        </div>

        <Reveal delay={420}>
          <dl className="grid grid-cols-2 border-t border-white/10 bg-ink-900/60 backdrop-blur-[3px] sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="border-white/10 px-1 py-6 sm:border-l sm:px-6 sm:first:border-l-0 sm:first:pl-0">
                <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">{stat.label}</dt>
                <dd className="mt-2 flex items-baseline gap-2">
                  <span className="font-display text-3xl font-bold text-white sm:text-4xl">
                    {typeof stat.value === "number" ? <CountUp value={stat.value} /> : stat.value}
                  </span>
                  {stat.unit && <span className="font-mono text-sm text-accent-300">{stat.unit}</span>}
                  <span className="ml-1 text-xs text-zinc-500">{stat.note}</span>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </header>
  );
}

export default Hero;
