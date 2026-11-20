import { safeHttpUrl } from "../format";
import { Badge } from "./Badge";
import { CopyButton } from "./Controls";
import Icon from "./icons";

/** Join and Copy for a demo's Google Meet link; a clear "no link yet" marker when there is none. Http(s) links only. */
export default function MeetActions({ meetLink, size = "sm" }) {
  if (!meetLink) return <Badge tone="amber">No Meet link yet</Badge>;
  const href = safeHttpUrl(meetLink);
  if (!href) return <span className="adm-muted adm-break">{meetLink} (not a web address)</span>;
  return (
    <span className="adm-actions">
      <a className={`adm-btn adm-btn--primary${size === "sm" ? " adm-btn--sm" : ""}`} href={href} target="_blank" rel="noopener noreferrer">
        <Icon name="video" size={15} /> Join Meet
      </a>
      <CopyButton text={href} small={size === "sm"}>
        Copy link
      </CopyButton>
    </span>
  );
}
