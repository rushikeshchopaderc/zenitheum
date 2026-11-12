import { Link } from "react-router-dom";

import { EmptyState } from "../components/Feedback";
import PageHeader from "../components/PageHeader";
import { useDocumentTitle } from "../hooks/useMisc";

export default function NotFoundPage() {
  useDocumentTitle("Page not found");
  return (
    <div className="adm-page">
      <PageHeader title="Page not found" />
      <div className="adm-card">
        <EmptyState
          icon="info"
          title="There is no such screen in the console"
          action={
            <Link className="adm-btn adm-btn--primary" to="/admin">
              Go to the overview
            </Link>
          }
        >
          The address may be mistyped, or the screen was renamed.
        </EmptyState>
      </div>
    </div>
  );
}
