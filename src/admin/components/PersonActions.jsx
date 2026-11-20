import { telHref } from "../format";
import { CopyButton } from "./Controls";
import Icon from "./icons";

/** Email (a prepared mailto: link), call and copy-address buttons for the person on a record. */
export default function PersonActions({ email, phone, mailHref, mailLabel = "Reply by email" }) {
  const tel = telHref(phone);
  return (
    <div className="adm-actions">
      <a className="adm-btn adm-btn--primary" href={mailHref}>
        <Icon name="send" size={16} /> {mailLabel}
      </a>
      {tel ? (
        <a className="adm-btn" href={tel}>
          <Icon name="phone" size={16} /> Call
        </a>
      ) : null}
      <CopyButton text={email} small>
        Copy email
      </CopyButton>
    </div>
  );
}
