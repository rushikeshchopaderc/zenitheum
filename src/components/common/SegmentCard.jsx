import { Link } from "react-router-dom";
import Reveal from "./Reveal";
import { CHIPS } from "../../data/chips";

const chipParam = (chips) => (chips.length > 1 ? "both" : chips[0]);

/** One ideal-customer segment: who they are, the problem, what we offer, and a pre-filled way to start. */
function SegmentCard({ segment, delay = 0 }) {
  return (
    <Reveal delay={delay} as="li" className="h-full">
      <article className="panel hud spotlight panel-hover flex h-full flex-col p-6">
        <ul className="flex flex-wrap gap-2" aria-label="Chips for this customer">
          {segment.chips.map((id) => (
            <li key={id} className="chip !font-mono !text-[10px] !uppercase !tracking-[0.14em]" style={{ borderColor: `${CHIPS[id].color}55`, color: CHIPS[id].color }}>
              {CHIPS[id].code}
            </li>
          ))}
        </ul>
        <h3 className="mt-4 font-display text-lg font-semibold leading-snug text-white">{segment.title}</h3>
        <p className="mt-1 text-sm text-zinc-500">{segment.builds}</p>
        <p className="mt-4 text-sm leading-relaxed text-zinc-400">
          <b className="font-semibold text-zinc-300">The problem. </b>
          {segment.pain}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-zinc-300">
          <b className="font-semibold text-white">What you get. </b>
          {segment.offer}
        </p>
        <Link
          to={`/contactus?topic=design-partner&segment=${segment.id}&chip=${chipParam(segment.chips)}`}
          data-cta={`segment-${segment.id}`}
          className="mt-auto inline-flex min-h-[44px] items-center gap-2 pt-5 text-sm font-semibold uppercase tracking-wider text-accent-300 transition hover:gap-3 hover:text-accent-200"
        >
          Talk to us <span aria-hidden="true">&rarr;</span>
        </Link>
      </article>
    </Reveal>
  );
}

export default SegmentCard;
