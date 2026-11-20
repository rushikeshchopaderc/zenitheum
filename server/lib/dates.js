/** Today's date in India (UTC+05:30, no daylight saving) as YYYY-MM-DD. */
export const todayInIndia = (now = new Date()) => new Date(now.getTime() + 330 * 60_000).toISOString().slice(0, 10);
