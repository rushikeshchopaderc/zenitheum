import { Link } from "react-router-dom";
import Section from "../common/Section";
import SectionHeading from "../common/SectionHeading";
import Reveal from "../common/Reveal";
import { CUSTOMERS } from "../../data/customers";
import { CHIPS } from "../../data/chips";

const chipParam = (chips) => (chips.length > 1 ? "both" : chips[0]);

/** An ordered list of the buyers the chips are made for. */
export default function Customers() {
  return (
    <Section id="customers" grid>
      <SectionHeading eyebrow="Ideal customers" title="Built for makers like you." description="In the order we would call them. If you build one of these, book a demo." />
      <ol className="mt-12 divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
        {CUSTOMERS.map((customer, i) => (
          <Reveal key={customer.id} as="li" delay={(i % 4) * 50}>
            <div className="grid items-center gap-4 px-5 py-5 sm:grid-cols-[3.5rem_1fr_auto] sm:gap-6 sm:px-7">
              <span className="font-display text-4xl font-bold text-accent-500/80 sm:text-5xl" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold leading-snug text-white sm:text-xl">
                  <span className="sr-only">{i + 1}. </span>
                  {customer.title}
                </h3>
                <p className="mt-1 text-zinc-400">{customer.pitch}</p>
                <ul className="mt-3 flex flex-wrap gap-2" aria-label="Chips for this customer">
                  {customer.chips.map((id) => (
                    <li key={id} className="chip !font-mono !text-[10px] !uppercase !tracking-[0.14em]" style={{ borderColor: `${CHIPS[id].color}66`, color: CHIPS[id].color }}>
                      {CHIPS[id].code}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to={{ pathname: "/", search: `?segment=${customer.id}&chip=${chipParam(customer.chips)}`, hash: "#demo" }}
                className="inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold uppercase tracking-wider text-accent-300 transition hover:gap-3 hover:text-accent-200"
              >
                Book a demo <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </Reveal>
        ))}
      </ol>
      <p className="mt-6 text-zinc-400">
        Something else that senses or must be trusted?{" "}
        <Link to={{ pathname: "/", hash: "#demo" }} className="font-semibold text-accent-300 underline underline-offset-4">
          Tell us what you build.
        </Link>
      </p>
    </Section>
  );
}
