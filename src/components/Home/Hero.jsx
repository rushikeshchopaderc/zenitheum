import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Reveal from "../common/Reveal";
import CircuitCanvas from "../fx/CircuitCanvas";
import ChipStack from "../fx/ChipStack";

const offers = [
  { code: "ZT-AFE1", text: "Sensor front-end", format: "Soft IP or hard IP" },
  { code: "ZT-SEC1", text: "Secure authentication", format: "Soft IP licence" },
  { code: "Custom", text: "Tailored to your product", format: "Tell us what you need", to: { pathname: "/", hash: "#customise" } },
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
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
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
                End-to-end fabless chip company
              </span>
            </Reveal>

            <Reveal delay={90}>
              <h1 className="fluid-display mt-8 font-extrabold">
                <span className="text-gradient">Chips for sensing and security,</span>
                <br />
                <span className="text-gradient-blue text-glow">tailored to</span> <span className="text-gradient">your product.</span>
              </h1>
            </Reveal>

            <Reveal delay={170}>
              <p className="fluid-lead mt-8 max-w-xl text-zinc-300">
                Start from a standard chip that reads your sensors with 24-bit precision or proves your devices are genuine, then have it shaped to fit
                your product.
              </p>
            </Reveal>

            <Reveal delay={250}>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link to="/#demo" className="btn-primary">
                  Book a demo
                </Link>
                <Link to="/#order" className="btn-ghost">
                  Place an order
                </Link>
              </div>
            </Reveal>
          </div>

          <div ref={anchorRef} className="relative z-0 mx-auto w-full max-w-[31rem] lg:mx-0 lg:justify-self-end">
            <div ref={stageRef}>
              <ChipStack />
            </div>
          </div>
        </div>

        <Reveal delay={420}>
          <dl className="grid border-t border-white/10 bg-ink-900/60 backdrop-blur-[3px] sm:grid-cols-3">
            {offers.map((offer) => (
              <div key={offer.code} className="border-white/10 px-1 py-5 sm:border-l sm:px-6 sm:first:border-l-0 sm:first:pl-0">
                <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-300">{offer.code}</dt>
                <dd className="mt-1.5 font-display text-lg font-semibold text-white">{offer.text}</dd>
                <dd className="text-sm text-zinc-400">
                  {offer.to ? (
                    <Link to={offer.to} className="inline-flex min-h-[44px] items-center text-accent-300 underline underline-offset-4 transition hover:text-accent-200">
                      {offer.format} →
                    </Link>
                  ) : (
                    offer.format
                  )}
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
