/* ==========================================================================
   🪷 SADHANA MONITOR — PRABHUPADA QUOTES LIBRARY (js/quotes.js)
   ========================================================================== */

export const QUOTES = [
  {
    id: 1,
    text: "Chant Hare Krishna and be happy. This is the simplest and most sublime method for self-realization in this age.",
    source: "Srila Prabhupada",
    reference: "Letter to Hayagriva, 1968",
    category: "Japa & Chanting"
  },
  {
    id: 2,
    text: "There is no requirement of material qualifications for chanting Hare Krishna. Anyone in any part of the world can chant.",
    source: "Srila Prabhupada",
    reference: "Nectar of Devotion, Ch. 1",
    category: "Japa & Chanting"
  },
  {
    id: 3,
    text: "The holy name of Krishna is transcendentally blissful. It bestows all spiritual benedictions, for it is Krishna Himself.",
    source: "Srila Prabhupada",
    reference: "Cc. Madhya 17.133 purport",
    category: "Japa & Chanting"
  },
  {
    id: 4,
    text: "Sravanam, hearing, is the basic principle of spiritual life. By hearing attentively, Krishna will clean all dust from the heart.",
    source: "Srila Prabhupada",
    reference: "Srimad-Bhagavatam 1.2.17 lecture",
    category: "Hearing & Association"
  },
  {
    id: 5,
    text: "If you read my books daily for even 15 minutes, you will remain fixed in Krishna consciousness.",
    source: "Srila Prabhupada",
    reference: "Room Conversation, Mayapur 1975",
    category: "Shastra & Knowledge"
  },
  {
    id: 6,
    text: "Purity is the force. If we maintain our principles strictly, Krishna will give all strength and victory.",
    source: "Srila Prabhupada",
    reference: "Letter to Brahmananda, 1967",
    category: "Devotional Purity"
  },
  {
    id: 7,
    text: "Morning japa is the best time because the atmosphere is calm and peaceful, free from worldly anxieties.",
    source: "Srila Prabhupada",
    reference: "Morning Walk, Vrindavan 1974",
    category: "Japa & Chanting"
  },
  {
    id: 8,
    text: "Sadhana-bhakti means regulating our lives so that we remember Krishna constantly and never forget Him.",
    source: "Srila Prabhupada",
    reference: "Nectar of Devotion, Ch. 2",
    category: "Encouragement & Progress"
  },
  {
    id: 9,
    text: "Do not be discouraged by initial difficulties. A child stumbles when learning to walk, but perseverance brings perfection.",
    source: "Srila Prabhupada",
    reference: "Letter to Satsvarupa, 1969",
    category: "Encouragement & Progress"
  },
  {
    id: 10,
    text: "The spirit soul is eternally the servant of Krishna. Serving Him is our natural constitutional position.",
    source: "Srila Prabhupada",
    reference: "Cc. Madhya 20.108 lecture",
    category: "Surrender & Devotion"
  },
  {
    id: 11,
    text: "Ekadashi is called the mother of devotion. Observing it sincerely pleases the Lord immensely.",
    source: "Srila Prabhupada",
    reference: "Cc. Adi 15.9 purport",
    category: "Devotional Purity"
  },
  {
    id: 12,
    text: "Bhagavad-gita is not an ordinary book; it is the spoken word of the Supreme Personality of Godhead Himself.",
    source: "Srila Prabhupada",
    reference: "Bhagavad-gita As It Is Introduction",
    category: "Shastra & Knowledge"
  },
  {
    id: 13,
    text: "Always pray to Krishna: 'My Lord, I am fallen, please keep me under the shade of Your lotus feet.'",
    source: "Srila Prabhupada",
    reference: "Lecture, London 1973",
    category: "Love of Godhead"
  },
  {
    id: 14,
    text: "By serving the Spiritual Master, one instantly receives the mercy of Krishna. Without his mercy, no progress is possible.",
    source: "Srila Prabhupada",
    reference: "Gurvashtaka purport",
    category: "Guru & Disciplic Succession"
  },
  {
    id: 15,
    text: "When you chant, try to hear every single syllable clearly: Hare, Krishna, Rama.",
    source: "Srila Prabhupada",
    reference: "Letter to Hansadutta, 1972",
    category: "Japa & Chanting"
  }
];

// Helper to get day of year (0 to 364/365)
export function getDayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start + (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

export function getQuoteOfDay(date = new Date()) {
  const dayIndex = getDayOfYear(date);
  return QUOTES[dayIndex % QUOTES.length];
}

export function getQuoteById(id) {
  return QUOTES.find(q => q.id === id) || QUOTES[0];
}
