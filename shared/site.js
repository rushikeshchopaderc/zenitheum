/**
 * Company-wide constants. Imported by the React app AND the Node API so that
 * contact details, mail routing and leadership names live in exactly one place.
 */
export const SITE = {
  name: "Zenitheum",
  tagline: "Fabless semiconductor company",
  url: "https://www.zenitheum.com",
  description:
    "Zenitheum is a fabless semiconductor startup in Khamgaon, Maharashtra, designing two chips with the customers who will use them: ZT-AFE1, a 24-bit analog sensor front-end for instruments and meters, and ZT-SEC1, a digital secure-authentication chip.",
  location: "Khamgaon, Maharashtra, India",
  locality: "Khamgaon",
  region: "Maharashtra",
  country: "India",
  address: ["Dipali Nagar,", "Khamgaon, Maharashtra, India"],
  phone: { label: "+91 70664 97023", href: "tel:+917066497023" },
  emails: {
    support: "support@zenitheum.com",
    careers: "careers@zenitheum.com",
    admin: "admin@zenitheum.com",
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
