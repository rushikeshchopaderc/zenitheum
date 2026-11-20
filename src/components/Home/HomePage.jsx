import PageShell from "../layout/PageShell";
import usePageMeta from "../../hooks/usePageMeta";
import { SITE } from "@shared/site.js";
import Hero from "./Hero";
import Products from "./Products";
import Customers from "./Customers";
import Milestones from "./Milestones";
import Start from "./Start";
import About from "./About";

/** The whole marketing site on one page. */
function HomePage() {
  usePageMeta({ title: null, description: SITE.description, path: "/" });
  return (
    <PageShell>
      <Hero />
      <Products />
      <Customers />
      <Milestones />
      <Start />
      <About />
    </PageShell>
  );
}

export default HomePage;
