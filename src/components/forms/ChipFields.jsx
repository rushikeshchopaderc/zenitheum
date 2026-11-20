import { ANALOG_FORMATS, CHIPS, includesAnalog } from "@shared/market.js";
import Field from "./Field";
import { describe } from "../../lib/aria";

/**
 * Which chip, and how it should be delivered. ZT-AFE1 (analog) comes as soft IP, hard IP or both, so a choice is asked
 * whenever it is involved; ZT-SEC1 (digital) is licensed as soft IP only, so no choice is offered for it.
 */
export default function ChipFields({ form, id, errors = {}, allowBoth = true, required = true, askFormat = true, placeholder = "Choose a chip" }) {
  const { values, bind, setValue } = form;
  const chips = allowBoth ? CHIPS : CHIPS.filter((c) => c.id !== "both");
  return (
    <>
      <Field id={`${id}-chip`} label="Which chip?" required={required} error={errors.chip}>
        <select
          className="field"
          {...bind("chip")}
          onChange={(event) => {
            setValue("chip", event.target.value);
            if (!includesAnalog(event.target.value)) setValue("analogFormat", "");
          }}
          {...describe(`${id}-chip`, errors.chip)}
        >
          <option value="">{placeholder}</option>
          {chips.map((chip) => (
            <option key={chip.id} value={chip.id}>
              {chip.label}
            </option>
          ))}
        </select>
      </Field>

      {askFormat && includesAnalog(values.chip) && (
        <Field id={`${id}-format`} label="ZT-AFE1 delivered as" required error={errors.analogFormat}>
          <select className="field" {...bind("analogFormat")} {...describe(`${id}-format`, errors.analogFormat)}>
            <option value="">Choose soft IP, hard IP or both</option>
            {ANALOG_FORMATS.map((format) => (
              <option key={format.id} value={format.id}>
                {format.label}
              </option>
            ))}
          </select>
        </Field>
      )}

      {values.chip && values.chip !== "analog" && (
        <p className="rounded-xl border border-cyan-300/20 bg-cyan-300/[0.05] px-4 py-3 text-sm text-cyan-100 sm:col-span-2">
          ZT-SEC1 is licensed as <b className="font-semibold">soft IP only</b>.
        </p>
      )}
    </>
  );
}
