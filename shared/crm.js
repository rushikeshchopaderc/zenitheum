/**
 * Pipeline stages for the admin console. The same ids are enforced by CHECK constraints in
 * database/migrations, so the console, the API and the database can never disagree.
 */

export const CONTACT_STATUSES = [
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "qualified", label: "Qualified" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
  { id: "spam", label: "Spam" },
];

export const DEMO_STATUSES = [
  { id: "requested", label: "Requested" },
  { id: "scheduled", label: "Scheduled" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
  { id: "no_show", label: "No show" },
];

export const ORDER_STATUSES = [
  { id: "new", label: "New" },
  { id: "confirmed", label: "Confirmed" },
  { id: "in_progress", label: "In progress" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
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
