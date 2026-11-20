import { useMemo } from "react";
import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import Reveal from "../common/Reveal";
import Marker from "../Milestones/Marker";
import useMilestones from "../../hooks/useMilestones";
import { STATUS_META, daysLabel, enrich, formatDate, todayIso } from "../../lib/milestones";

/** Broad milestones only: what is done and when the rest lands. Statuses come from the company database. */
export default function Milestones() {
  const { milestones } = useMilestones();
  const list = useMemo(() => enrich(milestones, todayIso()).sort((a, b) => a.targetDate.localeCompare(b.targetDate)), [milestones]);

  return (
    <Section id="milestones" grid>
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28">
          <SectionHeading
            eyebrow="Milestones"
            title="Where we are, and what comes next."
            description="The broad milestones, kept current. Dates are targets and may move."
          />
        </div>
        <ol>
          {list.map((m, i) => {
            const meta = STATUS_META[m.status] ?? STATUS_META.upcoming;
            const done = m.status === "completed";
            return (
              <Reveal key={m.id} as="li" delay={(i % 4) * 50}>
                <div className="relative flex gap-5 pb-8 last:pb-0">
                  {i < list.length - 1 && <span aria-hidden="true" className="absolute left-[10px] top-6 h-full w-px bg-white/15" />}
                  <span className="relative z-10 mt-1 flex h-5 w-5 shrink-0 items-center justify-center">
                    <Marker status={m.status} kind={m.kind} size={m.kind === "gate" ? 18 : 20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg font-semibold leading-snug text-white">{m.title}</p>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">
                      <span style={{ color: meta.color }}>{meta.label}</span>
                      <span aria-hidden="true"> · </span>
                      <span className="sr-only">, </span>
                      {done && m.completedOn ? formatDate(m.completedOn) : `Target ${formatDate(m.targetDate)}`}
                      {!done && m.daysToGo >= 0 ? ` (${daysLabel(m.daysToGo)})` : ""}
                      {m.overdue && <span className="text-red-300"> · overdue</span>}
                    </p>
                    {m.detail && <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{m.detail}</p>}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
