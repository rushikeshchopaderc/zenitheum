/**
 * Pipeline stages for the admin console. The same ids are enforced by CHECK constraints in
 * database/migrations/001_init.sql, so the console, the API and the database can never disagree.
 */

export const CONTACT_STATUSES = [
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "qualified", label: "Qualified" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
  { id: "spam", label: "Spam" },
];

export const APPLICATION_STATUSES = [
  { id: "new", label: "New" },
  { id: "screening", label: "Screening" },
  { id: "interview", label: "Interview" },
  { id: "offer", label: "Offer" },
  { id: "hired", label: "Hired" },
  { id: "rejected", label: "Rejected" },
];

export const SUBSCRIBER_STATUSES = [
  { id: "active", label: "Active" },
  { id: "unsubscribed", label: "Unsubscribed" },
];

export const CHANNELS = [
  { id: "direct", label: "Direct" },
  { id: "search", label: "Search" },
  { id: "social", label: "Social" },
  { id: "referral", label: "Referral" },
  { id: "email", label: "Email" },
  { id: "paid", label: "Paid" },
];
