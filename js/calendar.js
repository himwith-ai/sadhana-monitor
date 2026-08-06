/* ==========================================================================
   🪷 SADHANA MONITOR — VAISHNAVA CALENDAR (js/calendar.js)
   ========================================================================== */

export const VAISHNAVA_EVENTS = [
  // 2026 Major Events & Ekadashis
  { date: "2026-08-09", name: "Kamada Ekadashi", type: "ekadashi" },
  { date: "2026-08-15", name: "Sri Krishna Janmashtami", type: "festival" },
  { date: "2026-08-16", name: "Srila Prabhupada Vyasa Puja", type: "festival" },
  { date: "2026-08-24", name: "Pavitropana Ekadashi", type: "ekadashi" },
  { date: "2026-09-06", name: "Radhastami", type: "festival" },
  { date: "2026-09-08", name: "Annada Ekadashi", type: "ekadashi" },
  { date: "2026-09-22", name: "Parsva Ekadashi", type: "ekadashi" },
  { date: "2026-10-07", name: "Indira Ekadashi", type: "ekadashi" },
  { date: "2026-10-22", name: "Pasankusa Ekadashi", type: "ekadashi" },
  { date: "2026-11-05", name: "Rama Ekadashi", type: "ekadashi" },
  { date: "2026-11-08", name: "Deepavali & Govardhan Puja", type: "festival" },
  { date: "2026-11-20", name: "Utthana Ekadashi", type: "ekadashi" },
  { date: "2026-12-05", name: "Utpanna Ekadashi", type: "ekadashi" },
  { date: "2026-12-20", name: "Moksada Ekadashi (Gita Jayanti)", type: "festival" }
];

export function getNextEvent(fromDateStr) {
  const targetDate = fromDateStr ? new Date(fromDateStr) : new Date();
  targetDate.setHours(0, 0, 0, 0);

  for (const event of VAISHNAVA_EVENTS) {
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    
    if (eventDate >= targetDate) {
      const diffTime = Math.abs(eventDate - targetDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        ...event,
        daysAway: diffDays
      };
    }
  }

  // Fallback
  return { date: "2026-12-31", name: "End of Year Reflection", type: "festival", daysAway: 30 };
}
