import { Link } from "react-router-dom";
import PageShell from "../layout/PageShell";
import PageHero from "../common/PageHero";
import usePageMeta from "../../hooks/usePageMeta";

function NotFoundPage() {
  usePageMeta({ title: "Signal lost", description: "That page could not be found." });

  return (
    <PageShell>
      <PageHero
        eyebrow="Error 404"
        title="Signal"
        accent="lost"
        description="The page you were routing to does not exist — it may have moved when we rebuilt the site around silicon IP."
      >
        <p className="glitch mb-10 font-display text-7xl font-extrabold text-white sm:text-8xl" data-text="404" aria-hidden="true">
          404
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/" className="btn-primary">
            Back to home
          </Link>
          <Link to="/roadmap" className="btn-ghost">
            See the roadmap
          </Link>
        </div>
      </PageHero>
    </PageShell>
  );
}

export default NotFoundPage;
