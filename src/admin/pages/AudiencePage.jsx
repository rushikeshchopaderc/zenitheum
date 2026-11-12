import { api } from "../api";
import RankedBars from "../charts/RankedBars";
import { Card } from "../components/Cards";
import { CardSkeleton, EmptyState, ErrorBanner } from "../components/Feedback";
import PageHeader from "../components/PageHeader";
import RangePicker from "../components/RangePicker";
import { fmtYmd, languageName, plural, placeName } from "../format";
import useLoad from "../hooks/useLoad";
import { useDocumentTitle } from "../hooks/useMisc";
import useRange from "../hooks/useRange";
import { deviceLabel } from "../labels";

/** Screen-width buckets in their natural order (the API orders by popularity). Unknown buckets go last. */
const SCREEN_ORDER = ["Under 480 px", "480–767 px", "768–1023 px", "1024–1439 px", "1440 px and up", "Unknown"];

const asItems = (list, label = (value) => value) =>
  (list ?? []).map((entry) => ({ key: entry.label, label: label(entry.label), value: entry.sessions }));

/** One ranked list per question: who is visiting, on what, from where. */
function AudienceCard({ title, subtitle, items, unit = "sessions", empty }) {
  return (
    <Card title={title} subtitle={subtitle}>
      {items.length ? <RankedBars items={items} unit={unit} share label={title} /> : <EmptyState compact icon="audience" title="Nothing to show yet">{empty ?? "This fills in as visits are recorded."}</EmptyState>}
    </Card>
  );
}

export default function AudiencePage() {
  useDocumentTitle("Audience");
  const { range, apiParams, setPreset, setCustom } = useRange();
  const { data, error, loading, reload } = useLoad((signal) => api.get("/audience", apiParams, signal), JSON.stringify(apiParams));

  // Width buckets are ordered, so they take the ordinal ramp (small screens dark, large screens light).
  const screens = data
    ? [...(data.screens ?? [])]
        .sort((a, b) => {
          const ai = SCREEN_ORDER.indexOf(a.label);
          const bi = SCREEN_ORDER.indexOf(b.label);
          return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
        })
        .map((entry, index) => ({ key: entry.label, label: entry.label, value: entry.sessions, color: entry.label === "Unknown" ? "var(--adm-other)" : `var(--adm-ord-${Math.min(index + 1, 5)})` }))
    : [];

  const empty = data && Object.values(data).every((list) => !list?.length);

  return (
    <div className="adm-page">
      <PageHeader
        eyebrow="Website"
        title="Audience"
        lede={range.key === "custom" ? `Who visited between ${fmtYmd(range.from)} and ${fmtYmd(range.to)}.` : "Who is visiting, on what device and from where, for the period you choose."}
      >
        <button type="button" className="adm-btn" onClick={reload} disabled={loading}>
          Refresh
        </button>
      </PageHeader>
      <div className="adm-toolbar">
        <RangePicker range={range} setPreset={setPreset} setCustom={setCustom} />
      </div>

      {error ? <ErrorBanner error={error} onRetry={reload} title="The audience data could not be loaded." /> : null}
      {!data && loading ? (
        <div className="adm-grid adm-grid--3">
          {Array.from({ length: 6 }, (_, index) => (
            <CardSkeleton key={index} lines={4} />
          ))}
        </div>
      ) : null}

      {data ? (
        <div className={loading ? "adm-dim" : undefined} aria-busy={loading}>
          {empty ? (
            <div className="adm-card" style={{ marginBottom: 14 }}>
              <EmptyState icon="audience" title="No visits in this period">
                Audience data comes from visitors who accept analytics on the public site. Try a longer range.
              </EmptyState>
            </div>
          ) : null}
          <div className="adm-grid adm-grid--3">
            <AudienceCard title="Devices" subtitle="Visits by device type." items={asItems(data.devices, deviceLabel)} />
            <AudienceCard title="Browsers" subtitle="Visits by browser." items={asItems(data.browsers)} />
            <AudienceCard title="Operating systems" subtitle="Visits by operating system." items={asItems(data.systems)} />
            <AudienceCard title="Languages" subtitle="The language each browser is set to." items={asItems(data.languages, languageName)} />
            <AudienceCard title="Places" subtitle="Country when the host provides it, otherwise the visitor’s time zone." items={asItems(data.places, placeName)} />
            <Card title="Screen widths" subtitle="Browser window width, smallest to largest.">
              {screens.length ? <RankedBars items={screens} unit="sessions" share label="Visits by screen width" /> : <EmptyState compact icon="monitor" title="Nothing to show yet">This fills in as visits are recorded.</EmptyState>}
            </Card>
            <AudienceCard
              title="New and returning"
              subtitle="People, not visits. “New” means first seen during this period."
              items={asItems(data.returning)}
              unit="people"
            />
          </div>
          <p className="adm-hint" style={{ marginTop: 12 }}>
            {plural(data.devices?.reduce((sum, entry) => sum + entry.sessions, 0) ?? 0, "visit")} in this period. Shares are of the visits (or people) listed in each card.
          </p>
        </div>
      ) : null}
    </div>
  );
}
