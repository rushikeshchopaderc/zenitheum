import { Link } from "react-router-dom";
import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import Reveal from "../common/Reveal";
import MilestoneStrip from "../Milestones/MilestoneStrip";

/** Progress at a glance: what is done, what is next, and when. */
function MilestonesSection() {
  return (
    <Section id="milestones">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <SectionHeading
          index="03"
          eyebrow="Milestones · Dec 2026 → Dec 2027"
          title="What is done, and when the rest lands."
          description="Every milestone of the company and of both chips on one timeline: completed ones are marked, and everything still to come has a target date. Dates that depend on a foundry shuttle calendar are marked as such."
        />
        <Reveal delay={160}>
          <Link to="/roadmap" className="btn-primary">
            Explore the full roadmap
          </Link>
        </Reveal>
      </div>
      <Reveal delay={100} className="mt-12">
        <MilestoneStrip />
      </Reveal>
    </Section>
  );
}

export default MilestonesSection;
