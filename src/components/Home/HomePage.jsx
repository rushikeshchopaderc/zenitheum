import PageShell from "../layout/PageShell";
import usePageMeta from "../../hooks/usePageMeta";
import CTABand from "../common/CTABand";
import Hero from "./Hero";
import SegmentsStrip from "./SegmentsStrip";
import ChipsSection from "./ChipsSection";
import ClientPitch from "./ClientPitch";
import HowWeBuild from "./HowWeBuild";
import MilestonesSection from "./MilestonesSection";
import EcosystemSection from "./EcosystemSection";
import HiringStrip from "./HiringStrip";
import LeadershipStrip from "./LeadershipStrip";
import { SITE } from "@shared/site.js";

function HomePage() {
  usePageMeta({
    title: null,
    description: SITE.description,
    path: "/",
  });

  return (
    <PageShell>
      <Hero />
      <SegmentsStrip />
      <ChipsSection />
      <ClientPitch />
      <MilestonesSection />
      <HowWeBuild />
      <EcosystemSection />
      <HiringStrip />
      <LeadershipStrip />
      <CTABand />
    </PageShell>
  );
}

export default HomePage;
