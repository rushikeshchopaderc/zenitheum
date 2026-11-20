/**
 * Company-wide constants. Imported by the React app AND the Node API so that
 * contact details, mail routing and leadership names live in exactly one place.
 */
export const SITE = {
  name: "Zenitheum",
  tagline: "Fabless semiconductor company",
  url: "https://www.zenitheum.com",
  description:
    "Zenitheum is an end-to-end fabless chip company. Two chips built to drop into your product: ZT-AFE1, a 24-bit analog sensor front-end (soft or hard IP), and ZT-SEC1, a digital secure-authentication core (soft IP), both customisable to your product.",
  location: "Khamgaon, Maharashtra, India",
  locality: "Khamgaon",
  region: "Maharashtra",
  country: "India",
  address: ["Dipali Nagar,", "Khamgaon, Maharashtra, India"],
  phone: { label: "+91 70664 97023", href: "tel:+917066497023" },
  emails: {
    team: "zenitheumsolutions@gmail.com",
  },
  social: {
    linkedin: "https://www.linkedin.com/company/zenitheum",
  },
  leaders: {
    founder: {
      name: "Rushikesh Chopade",
      title: "Founder & CEO",
      linkedin: "https://www.linkedin.com/in/rushikesh3388/",
    },
    director: {
      name: "Susandhya Nikam",
      title: "Director",
    },
  },
};

export default SITE;
