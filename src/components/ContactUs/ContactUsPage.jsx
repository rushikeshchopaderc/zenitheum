import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import PageShell from "../layout/PageShell";
import PageHero from "../common/PageHero";
import Section from "../common/Section";
import Reveal from "../common/Reveal";
import ContactForm from "../forms/ContactForm";
import usePageMeta from "../../hooks/usePageMeta";
import { SITE } from "@shared/site.js";

const expectations = [
  "Design partners: tell us what you build and which part a chip would replace, and we will tell you honestly whether ZT-AFE1 or ZT-SEC1 fits.",
  "Evaluation: the ZT-SEC1 FPGA kit from spring 2027, and ZT-AFE1 evaluation boards when silicon returns.",
  "Partnerships: foundry, packaging, programme or investor conversations are welcome.",
  "Careers: use the job pages to apply, or write here if your role is not listed.",
];

function ContactUsPage() {
  usePageMeta({
    title: "Contact",
    description:
      "Contact Zenitheum about becoming a design partner for ZT-AFE1 or ZT-SEC1, evaluating the chips, partnering on a programme, or joining the team. Head office: Dipali Nagar, Khamgaon, Maharashtra.",
    path: "/contactus",
  });

  return (
    <PageShell>
      <PageHero
        eyebrow="Contact"
        title="Let's talk"
        accent="chips."
        description="Building instruments, meters or secure devices? Partnering on a programme, or joining the build? Tell us a little about what you are working on and we will come back with a concrete next step."
      />

      <Section id="form">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_1fr] lg:gap-14">
          <Reveal>
            <ContactForm />
          </Reveal>

          <div className="space-y-5">
            <Reveal delay={80}>
              <article className="panel hud spotlight flex gap-5 p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-accent-300">
                  <FaMapMarkerAlt size={16} />
                </span>
                <div>
                  <h2 className="font-display text-lg font-semibold text-white">Head office</h2>
                  <p className="mt-1.5 leading-relaxed text-zinc-400">
                    {SITE.address[0]}
                    <br />
                    {SITE.address[1]}
                  </p>
                </div>
              </article>
            </Reveal>

            <Reveal delay={140}>
              <article className="panel hud spotlight flex gap-5 p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-accent-300">
                  <FaPhoneAlt size={15} />
                </span>
                <div>
                  <h2 className="font-display text-lg font-semibold text-white">Hotline</h2>
                  <a href={SITE.phone.href} className="mt-1 flex min-h-[44px] items-center text-zinc-400 transition hover:text-accent-300">
                    {SITE.phone.label}
                  </a>
                </div>
              </article>
            </Reveal>

            <Reveal delay={200}>
              <article className="panel hud spotlight flex gap-5 p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-accent-300">
                  <FaEnvelope size={15} />
                </span>
                <div>
                  <h2 className="font-display text-lg font-semibold text-white">Mail us</h2>
                  <div className="mt-1 flex flex-col text-zinc-400">
                    {Object.values(SITE.emails).map((address) => (
                      <a key={address} href={`mailto:${address}`} className="flex min-h-[44px] items-center transition hover:text-accent-300">
                        {address}
                      </a>
                    ))}
                  </div>
                </div>
              </article>
            </Reveal>

            <Reveal delay={260}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <p className="mono-label">What to expect</p>
                <ul className="mt-4 space-y-3.5">
                  {expectations.map((line) => (
                    <li key={line} className="flex gap-3 text-sm leading-relaxed text-zinc-400">
                      <span aria-hidden="true" className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>
    </PageShell>
  );
}

export default ContactUsPage;
