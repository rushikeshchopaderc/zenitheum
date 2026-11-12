import { useEffect, useState } from "react";

import { addDays, todayYmd } from "../format";
import { customRangeProblem, RANGE_PRESETS } from "../hooks/useRange";
import { InputField } from "./Fields";

/** Date range for the report screens: presets first, a custom from/to behind "Custom". */
export default function RangePicker({ range, setPreset, setCustom }) {
  const today = todayYmd();
  const [open, setOpen] = useState(range.key === "custom");
  const [from, setFrom] = useState(range.from ?? addDays(today, -29));
  const [to, setTo] = useState(range.to ?? today);
  const [touched, setTouched] = useState(false);

  // Follow the URL (Back button, shared link).
  useEffect(() => {
    if (range.key === "custom") {
      setOpen(true);
      setFrom(range.from);
      setTo(range.to);
    } else {
      setOpen(false);
    }
    setTouched(false);
  }, [range.key, range.from, range.to]);

  const problem = customRangeProblem(from, to);

  const apply = (event) => {
    event.preventDefault();
    setTouched(true);
    if (!problem) setCustom(from, to);
  };

  return (
    <div className="adm-range">
      <div className="adm-seg" role="group" aria-label="Date range">
        {RANGE_PRESETS.map((preset) => (
          <button key={preset.key} type="button" aria-pressed={range.key === preset.key} aria-label={preset.long} title={preset.long} onClick={() => setPreset(preset.key)}>
            <span className="adm-seg__long" aria-hidden="true">
              {preset.label}
            </span>
            <span className="adm-seg__short" aria-hidden="true">
              {preset.short}
            </span>
          </button>
        ))}
        <button type="button" aria-pressed={range.key === "custom"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          Custom
        </button>
      </div>
      {open ? (
        <form className="adm-range__custom" onSubmit={apply} noValidate>
          <InputField label="From" type="date" value={from} onChange={setFrom} max={today} />
          <InputField label="To" type="date" value={to} onChange={setTo} max={today} />
          <button type="submit" className="adm-btn adm-btn--primary">
            Apply
          </button>
          {touched && problem ? (
            <div className="adm-fielderror" role="alert" style={{ flex: "1 1 100%" }}>
              {problem}
            </div>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}
