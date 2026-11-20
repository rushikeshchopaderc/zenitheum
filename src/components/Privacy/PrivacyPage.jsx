import PageShell from "../layout/PageShell";
import PageHero from "../common/PageHero";
import Section from "../common/Section";
import usePageMeta from "../../hooks/usePageMeta";
import { SITE } from "@shared/site.js";

const sections = [
  {
    title: "Who we are",
    body: [`Zenitheum is a fabless semiconductor company based at ${SITE.address.join(" ")} For anything in this notice, write to ${SITE.emails.team}.`],
  },
  {
    title: "What we collect",
    list: [
      "Book a demo: your name, email, phone, company, role (optional), the chip you are interested in (and, for the analog chip, whether you want soft or hard IP), the time you choose and a note.",
      "Book an order: your contact person's name, email, phone, company, the chip, the delivery format, quantity, delivery date and location, any customisation you describe, and a note.",
      "Ask a question or request a customisation: your name, email, phone and role (optional), company, the chip and delivery format you are asking about, and your message.",
      "Chip release news: your email, your name and the chip you want news about (optional), and the delivery format you care about.",
      "Job applications: your name, email, phone, current institute or employer, a profile link, the role you apply for, a note, and the resume you choose to upload.",
    ],
    after: "This site does not measure or track visits. We do not store your IP address with a submission. Our hosting providers may keep standard server logs for security and reliability.",
  },
  {
    title: "Why we use it",
    list: [
      "To reply to your question or customisation request, run the demo you booked and prepare the order you placed.",
      "To email you the calendar invitation and Google Meet link for your demo, and a confirmation of what you submitted.",
      "To send chip release news, if you joined the list. Every message says how to stop.",
      "To assess your application and contact you about the role.",
    ],
    after: "We do not sell your information and we do not use it for advertising.",
  },
  {
    title: "Who can see it",
    body: [
      "Our founders and the people who answer enquiries, deliver orders or hire for the role you applied for, through a password-protected staff console. We rely on a small set of providers that process data on our behalf and only for that purpose: Neon (database), Render and Cloudflare (hosting), and Google (the company Calendar and Google Meet for demos, Google Drive for uploaded resumes, and Gmail for notifications).",
    ],
  },
  {
    title: "How long we keep it",
    list: [
      "Job applications and resumes: up to 12 months after the role is filled or closed, then deleted.",
      "Demo, order and question records: while we are in touch with you and for a reasonable period afterwards. Orders are kept as long as needed for delivery, warranty and accounts.",
      "Chip release news addresses: until you ask to be removed.",
    ],
    after: "You can ask us to delete your data at any time.",
  },
  {
    title: "Your choices",
    body: [
      `You can ask to see, correct or delete what we hold about you, and withdraw your consent at any time, by writing to ${SITE.emails.team}. We handle personal data in line with applicable Indian law, including the Digital Personal Data Protection Act, 2023.`,
    ],
  },
  {
    title: "Cookies and third parties",
    body: [
      "This site does not set cookies for visitors and does not use advertising or third-party analytics. It serves its own fonts and scripts. Staff signing in to the console receive a sign-in cookie that is used for nothing else. If you book a demo, the Google Meet call is subject to Google's own policies. Links to other sites, such as LinkedIn, lead to services with their own policies.",
    ],
  },
  {
    title: "Security",
    body: [
      "Submissions travel over an encrypted connection and are stored in our company database. Uploaded resumes are stored as documents in a private Google Drive folder that only the company account can open; the database keeps only a link to each one. Console access is limited to authorised staff.",
    ],
  },
  {
    title: "Changes",
    body: ["If we change this notice we will update this page and the date below."],
  },
];

function PrivacyPage() {
  usePageMeta({
    title: "Privacy",
    description: "How Zenitheum collects, uses and protects the information you send through its demo, order, question, release-news and application forms.",
    path: "/privacy",
  });

  return (
    <PageShell>
      <PageHero
        eyebrow="Privacy"
        title="Privacy"
        accent="notice."
        description="Plainly: what we collect when you use the forms on this site, why, who sees it, how long we keep it, and how to have it removed."
      />
      <Section>
        <div className="mx-auto max-w-3xl space-y-6">
          {sections.map((section, i) => (
            <section key={section.title} className="panel hud scroll-mt-28 p-7 sm:p-8">
              <h2 className="flex items-baseline gap-3 font-display text-xl font-semibold text-white">
                <span className="font-mono text-xs tracking-[0.2em] text-accent-400">{String(i + 1).padStart(2, "0")}</span>
                {section.title}
              </h2>
              {section.body?.map((paragraph) => (
                <p key={paragraph} className="mt-4 leading-relaxed text-zinc-400">
                  {paragraph}
                </p>
              ))}
              {section.list && (
                <ul className="mt-4 space-y-2.5">
                  {section.list.map((item) => (
                    <li key={item} className="flex gap-3 leading-relaxed text-zinc-300">
                      <span aria-hidden="true" className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {section.after && <p className="mt-4 leading-relaxed text-zinc-400">{section.after}</p>}
            </section>
          ))}
          <p className="px-1 font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">Last updated: 20 November 2026</p>
        </div>
      </Section>
    </PageShell>
  );
}

export default PrivacyPage;
