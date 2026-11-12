import PageShell from "../layout/PageShell";
import PageHero from "../common/PageHero";
import Section from "../common/Section";
import usePageMeta from "../../hooks/usePageMeta";
import { SITE } from "@shared/site.js";

const sections = [
  {
    title: "Who we are",
    body: [
      `Zenitheum is a fabless semiconductor company based at ${SITE.address.join(" ")} For anything in this notice, write to ${SITE.emails.support}.`,
    ],
  },
  {
    title: "What we collect",
    list: [
      "Enquiry form: your name, email, phone and role (optional), company, the topic, what your company builds and which chip interests you (optional), and your message.",
      "Job applications: your name, email, phone, current institute or employer, a profile link, your preferred track, a note, and the resume you choose to upload.",
      "Early-access list: your email address and the page you signed up from.",
      "Website activity, only if you allow it (see “Website analytics” below).",
    ],
    after:
      "We do not store your IP address with a submission or with analytics. Our hosting provider may keep standard server logs for security and reliability.",
  },
  {
    id: "analytics",
    title: "Website analytics",
    body: [
      "When you first visit we ask whether we may measure the visit. If you say no, nothing is recorded. If you say yes, our own server records which pages you view and for how long, how far you scroll, how you found us (the site you came from and any campaign tags in the link), your screen size, language and time zone, the type of device, browser and operating system, which buttons you use, and whether you start or send a form. It never records what you type into a form.",
      "This is first-party: the data goes only to Zenitheum's own server, with no advertising or third-party tracking services. A random identifier is kept in your browser's local storage (not a cookie) so that a return visit can be recognised; if you send an enquiry or application after allowing analytics, the campaign that brought you here is saved with it, so we can tell which of our efforts reach customers and candidates.",
      "If your browser sends Do Not Track or Global Privacy Control, we treat it as a no. You can change your mind at any time with “Analytics settings” in the footer; choosing no deletes the identifier from your browser.",
    ],
  },
  {
    title: "Why we use it",
    list: [
      "To reply to your enquiry and to follow up on what you asked, including about the chips you showed interest in.",
      "To assess your application and contact you about the role.",
      "To send release news, if you joined the early-access list.",
      "To understand which pages and campaigns lead to enquiries and applications, so that the site and our outreach improve.",
    ],
    after: "We do not sell your information and we do not use it for advertising.",
  },
  {
    title: "Who can see it",
    body: [
      "Our founders and the people involved in answering enquiries or hiring for the role you applied for, through a password-protected staff console. We use e-mail and hosting providers to run the site and receive submissions; they process data on our behalf and only for that purpose.",
    ],
  },
  {
    title: "How long we keep it",
    list: [
      "Job applications and resumes are kept for up to 12 months after the role is filled or closed, and then deleted.",
      "Enquiries are kept while we are in touch with you, and for a reasonable period afterwards.",
      "Early-access addresses are kept until you ask to be removed.",
      "Detailed website activity is deleted after 18 months. An enquiry or application keeps only a short note of the channel and campaign that brought you.",
    ],
    after: "You can ask us to delete your data at any time.",
  },
  {
    title: "Your choices",
    body: [
      `You can ask to see, correct or delete what we hold about you — including your website activity — and withdraw your consent at any time, by writing to ${SITE.emails.support}. We handle personal data in line with applicable Indian law, including the Digital Personal Data Protection Act, 2023.`,
    ],
  },
  {
    title: "Cookies and third parties",
    body: [
      "This site does not set cookies for visitors and does not use advertising or third-party analytics. It serves its own fonts and scripts. Staff signing in to the console receive a sign-in cookie that is used for nothing else. Links to other sites, such as LinkedIn, lead to services with their own policies.",
    ],
  },
  {
    title: "Security",
    body: [
      "Submissions travel over an encrypted connection and are stored in our company database. Uploaded resumes are kept in that database too, and are only available to signed-in staff hiring for the role. Staff passwords are stored as salted hashes, and every export or deletion in the console is logged.",
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
    description: "How Zenitheum collects, uses and protects the information you send us through its forms and, if you allow it, its first-party website analytics.",
    path: "/privacy",
  });

  return (
    <PageShell>
      <PageHero
        eyebrow="Privacy"
        title="Privacy"
        accent="notice."
        description="Plainly: what we collect when you use the forms on this site or allow analytics, why, who sees it, how long we keep it, and how to have it removed."
      />
      <Section>
        <div className="mx-auto max-w-3xl space-y-6">
          {sections.map((section, i) => (
            <section key={section.title} id={section.id} className="panel hud scroll-mt-28 p-7 sm:p-8">
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
          <p className="px-1 font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">Last updated: 12 November 2026</p>
        </div>
      </Section>
    </PageShell>
  );
}

export default PrivacyPage;
