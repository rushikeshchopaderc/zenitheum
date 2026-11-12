import Marquee from "../fx/Marquee";
import { SEGMENT_TICKER } from "../../data/ecosystem";

/** A thin ticker of the products our customers build: the markets the two chips are designed for. */
function SegmentsStrip() {
  return (
    <div className="border-y border-white/10 bg-ink-950/70">
      <div className="shell flex items-center gap-6">
        <span className="mono-label hidden shrink-0 sm:block">Built for</span>
        <Marquee items={SEGMENT_TICKER} label="The products our customers build" className="min-w-0 flex-1" />
      </div>
    </div>
  );
}

export default SegmentsStrip;
