import { useId, useMemo, useRef, useState } from "react";

import { CopyButton } from "../components/Controls";
import { Card } from "../components/Cards";
import { Field, InputField } from "../components/Fields";
import Icon from "../components/icons";
import { Notice } from "../components/Feedback";
import { slugify } from "../format";
import { channelLabel } from "../labels";

/** The main public pages. "Another page" lets staff tag any other path. */
const PAGES = [
  { path: "/", label: "Home" },
  { path: "/products", label: "Products" },
  { path: "/customers", label: "Customers" },
  { path: "/roadmap", label: "Roadmap" },
  { path: "/careers", label: "Careers" },
  { path: "/contactus", label: "Contact us" },
];
const CUSTOM = "__custom__";

/**
 * One-click starting points. Mediums are chosen so the API files the visit under the right channel
 * (see reportedChannel below): social, paid_social, email.
 */
const PRESETS = [
  { id: "linkedin-post", label: "LinkedIn post", source: "linkedin", medium: "social" },
  { id: "linkedin-ad", label: "LinkedIn ad", source: "linkedin", medium: "paid_social" },
  { id: "email-newsletter", label: "Email newsletter", source: "newsletter", medium: "email" },
  { id: "whatsapp", label: "WhatsApp", source: "whatsapp", medium: "social" },
  { id: "instagram-bio", label: "Instagram bio", source: "instagram", medium: "social", content: "bio" },
  { id: "event-qr", label: "Event QR", source: "qr", medium: "offline", content: "" },
];

/**
 * Which channel the visit will be filed under, from the tags alone. This mirrors the tagged-link rules in
 * server/lib/ua.js (classifyChannel); a link with none of these keywords is classified by the referrer instead.
 */
function reportedChannel({ source, medium }) {
  const m = medium.toLowerCase();
  const s = source.toLowerCase();
  if (/^(cpc|ppc|paid|paidsearch|paid-search|paid_social|paidsocial|display|retargeting)$/.test(m)) return "paid";
  if (m === "email" || /newsletter|mailchimp|email/.test(s)) return "email";
  if (/^(social|social-media|sm)$/.test(m)) return "social";
  if (m === "organic" || m === "search") return "search";
  return null;
}

const EMPTY = { source: "", medium: "", campaign: "", term: "", content: "" };

/** Slug preview line under a field: shown only when the saved value differs from what was typed. */
const slugHint = (raw, slug) => (raw.trim() && slug !== raw.trim() ? `Will be saved as ${slug || "(empty)"}` : undefined);

export default function UtmBuilder() {
  const [origin, setOrigin] = useState(() => (typeof window === "undefined" ? "" : window.location.origin));
  const [page, setPage] = useState("/");
  const [customPath, setCustomPath] = useState("/");
  const [values, setValues] = useState(EMPTY);
  const outputRef = useRef(null);
  const pageId = useId();

  const set = (key) => (value) => setValues((current) => ({ ...current, [key]: value }));
  const slugs = useMemo(() => Object.fromEntries(Object.entries(values).map(([key, value]) => [key, slugify(value)])), [values]);

  const path = page === CUSTOM ? customPath || "/" : page;
  const required = ["source", "medium", "campaign"];
  const missing = required.filter((key) => !slugs[key]);

  const result = useMemo(() => {
    let site;
    try {
      site = new URL(origin.trim());
      if (site.protocol !== "http:" && site.protocol !== "https:") throw new Error("protocol");
    } catch {
      return { error: "Enter a full website address, such as https://www.zenitheum.com", url: "" };
    }
    // One leading slash, forward slashes only: "//host/x" or "\\host" would otherwise resolve to another site.
    const cleanPath = `/${String(path).trim().replace(/\\/g, "/").replace(/^\/+/, "")}`;
    const base = new URL(cleanPath, site);
    if (base.origin !== site.origin) return { error: "The page must be on this website.", url: "" };
    if (missing.length) return { error: null, url: "" };
    base.searchParams.set("utm_source", slugs.source);
    base.searchParams.set("utm_medium", slugs.medium);
    base.searchParams.set("utm_campaign", slugs.campaign);
    if (slugs.term) base.searchParams.set("utm_term", slugs.term);
    if (slugs.content) base.searchParams.set("utm_content", slugs.content);
    return { error: null, url: base.href };
  }, [origin, path, slugs, missing.length]);

  const applyPreset = (preset) => setValues((current) => ({ ...current, source: preset.source, medium: preset.medium, content: preset.content ?? current.content }));
  const isPreset = (preset) => slugs.source === preset.source && slugs.medium === preset.medium && (preset.content === undefined || slugs.content === preset.content);

  const channel = slugs.medium || slugs.source ? reportedChannel(slugs) : null;

  return (
    <div className="adm-grid adm-grid--builder">
      <Card title="Build a tagged link" subtitle="Tag every link you share, so visits, leads and sign-ups can be traced to the post, newsletter or event that brought them.">
        <div className="adm-stack" style={{ gap: 18 }}>
          <div>
            <div className="adm-label" id={`${pageId}-presets`} style={{ marginBottom: 8 }}>
              Start from a preset
            </div>
            <div className="adm-presets" role="group" aria-labelledby={`${pageId}-presets`}>
              {PRESETS.map((preset) => (
                <button key={preset.id} type="button" className="adm-chipbtn" aria-pressed={isPreset(preset)} onClick={() => applyPreset(preset)}>
                  {preset.label}
                </button>
              ))}
            </div>
            <p className="adm-hint" style={{ marginTop: 8 }}>
              A preset fills in the source and medium. Add a campaign name to finish.
            </p>
          </div>

          <div className="adm-formgrid">
            <InputField label="Website address" value={origin} onChange={setOrigin} type="url" inputMode="url" placeholder="https://www.zenitheum.com" error={result.error ?? undefined} hint="Defaults to the address you are on now." />
            <Field label="Page">
              {(props) => (
                <span className="adm-selectwrap">
                  <select className="adm-select" value={page} onChange={(event) => setPage(event.target.value)} {...props}>
                    {PAGES.map((item) => (
                      <option key={item.path} value={item.path}>
                        {item.label} ({item.path})
                      </option>
                    ))}
                    <option value={CUSTOM}>Another page…</option>
                  </select>
                  <Icon name="chevronDown" size={16} />
                </span>
              )}
            </Field>
            {page === CUSTOM ? <InputField label="Path" value={customPath} onChange={setCustomPath} placeholder="/careers/vlsi-engineer" mono hint="Starts with a slash." /> : null}
          </div>

          <div className="adm-formgrid">
            <InputField label="Source (required)" value={values.source} onChange={set("source")} placeholder="linkedin" hint={slugHint(values.source, slugs.source) ?? "Where the link is posted: linkedin, newsletter, whatsapp."} maxLength={100} mono />
            <InputField label="Medium (required)" value={values.medium} onChange={set("medium")} placeholder="social" hint={slugHint(values.medium, slugs.medium) ?? "The kind of channel: social, email, paid_social, cpc."} maxLength={100} mono />
            <InputField label="Campaign (required)" value={values.campaign} onChange={set("campaign")} placeholder="launch-linkedin" hint={slugHint(values.campaign, slugs.campaign) ?? "Your name for it. Reuse the same name for every link in one push."} maxLength={100} mono className="adm-field--wide" />
            <InputField label="Term (optional)" value={values.term} onChange={set("term")} placeholder="analog-ip" hint={slugHint(values.term, slugs.term) ?? "A paid keyword."} maxLength={100} mono />
            <InputField label="Content (optional)" value={values.content} onChange={set("content")} placeholder="bio" hint={slugHint(values.content, slugs.content) ?? "Tells two links in one campaign apart."} maxLength={100} mono />
          </div>
          <p className="adm-hint">Values are lower-cased and stripped to letters, numbers, hyphens, dots and underscores, because the API lower-cases them too. “LinkedIn Post” becomes linkedin-post.</p>
        </div>
      </Card>

      <div className="adm-stack adm-sticky">
        <Card title="Your link" subtitle={result.url ? "Ready to paste." : result.error ? "Fix the website address to generate the link." : `Add ${missing.join(", ")} to generate the link.`}>
          <div className="adm-stack" style={{ gap: 12 }}>
            <label className="adm-sr" htmlFor={`${pageId}-out`}>
              Generated link
            </label>
            <textarea
              id={`${pageId}-out`}
              ref={outputRef}
              className="adm-textarea adm-mono adm-linkout"
              readOnly
              rows={5}
              value={result.url}
              placeholder="Your tagged link appears here"
              onFocus={(event) => event.target.select()}
              spellCheck={false}
            />
            <div className="adm-actions">
              {result.url ? (
                <CopyButton text={result.url}>Copy link</CopyButton>
              ) : (
                <button type="button" className="adm-btn" disabled>
                  <Icon name="copy" size={15} /> Copy link
                </button>
              )}
              {result.url ? (
                <a className="adm-btn" href={result.url} target="_blank" rel="noopener noreferrer">
                  <Icon name="external" size={15} /> Open link
                </a>
              ) : null}
            </div>
            {result.url ? (
              channel ? (
                <Notice tone="info" icon="info">
                  Visits from this link will be reported as <strong>{channelLabel(channel)}</strong>, under the campaign <span className="adm-mono">{slugs.campaign}</span>.
                </Notice>
              ) : (
                <Notice tone="info" icon="info">
                  The medium has no channel keyword, so the channel comes from where the click happens (usually Direct or Referral). The campaign <span className="adm-mono">{slugs.campaign}</span> still appears in the Campaigns table. Use
                  social, email, paid_social or cpc as the medium to file visits under a channel.
                </Notice>
              )
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
