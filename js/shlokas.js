/* ==========================================================================
   🪷 SADHANA MONITOR — SHLOKA LIBRARY (js/shlokas.js)
   ========================================================================== */

import { getUserShlokas, saveUserShlokas } from './storage.js';

export const PRELOADED_SHLOKAS = [
  {
    id: "pancha_tattva",
    verse: "Pancha Tattva Mantra",
    sanskrit: "jaya śrī-kṛṣṇa-caitanya prabhu-nityānanda śrī-advaita gadādhara śrīvāsādi-gaura-bhakta-vṛnda",
    translation: "I offer my respectful obeisances unto Sri Krishna Caitanya, Prabhu Nityananda, Sri Advaita, Gadadhara, Srivasa and all the devotees of Lord Caitanya.",
    status: "memorized",
    isPreloaded: true
  },
  {
    id: "maha_mantra",
    verse: "Hare Krishna Maha Mantra",
    sanskrit: "hare kṛṣṇa hare kṛṣṇa kṛṣṇa kṛṣṇa hare hare / hare rāma hare rāma rāma rāma hare hare",
    translation: "O Supreme Lord Krishna, O Energy of the Lord (Hare), please engage me in Your devotional service.",
    status: "memorized",
    isPreloaded: true
  },
  {
    id: "sik_1",
    verse: "Śikṣāṣṭakam 1",
    sanskrit: "ceto-darpaṇa-mārjanaṁ bhava-mahā-dāvāgni-nirvāpaṇaṁ...",
    translation: "Glory to the Sri Krishna Sankirtana, which cleanses the heart of all the dust accumulated for years...",
    status: "memorized",
    isPreloaded: true
  },
  {
    id: "bg_2_13",
    verse: "Bhagavad Gita 2.13",
    sanskrit: "dehino 'smin yathā dehe kaumāraṁ yauvanaṁ jarā...",
    translation: "As the embodied soul continuously passes, in this body, from boyhood to youth to old age, the soul similarly passes into another body at death.",
    status: "memorized",
    isPreloaded: true
  },
  {
    id: "bg_2_20",
    verse: "Bhagavad Gita 2.20",
    sanskrit: "na jāyate mriyate vā kadācin nāyaṁ bhūtvā bhavitā vā na bhūyaḥ...",
    translation: "For the soul there is neither birth nor death at any time. He has not come into being, does not come into being, and will not come into being.",
    status: "learning",
    isPreloaded: true
  },
  {
    id: "bg_9_22",
    verse: "Bhagavad Gita 9.22",
    sanskrit: "ananyāś cintayanto māṁ ye janāḥ paryupāsate...",
    translation: "To those who always worship Me with exclusive devotion, meditating on My transcendental form, I carry what they lack and preserve what they have.",
    status: "to-learn",
    isPreloaded: true
  },
  {
    id: "bg_18_66",
    verse: "Bhagavad Gita 18.66",
    sanskrit: "sarva-dharmān parityajya mām ekaṁ śaraṇaṁ vraja...",
    translation: "Abandon all varieties of religion and just surrender unto Me. I shall deliver you from all sinful reactions. Do not fear.",
    status: "memorized",
    isPreloaded: true
  },
  {
    id: "bs_5_1",
    verse: "Brahma-saṁhitā 5.1",
    sanskrit: "īśvaraḥ paramaḥ kṛṣṇaḥ sac-cid-ānanda-vigrahaḥ / anādir ādir govindaḥ sarva-kāraṇa-kāraṇam",
    translation: "Krishna who is known as Govinda is the Supreme Godhead. He has an eternal blissful spiritual body. He is the origin of all. He has no other origin and He is the prime cause of all causes.",
    status: "learning",
    isPreloaded: true
  }
];

export function getCombinedShlokas(profileId) {
  const userShlokas = getUserShlokas(profileId);
  return [...PRELOADED_SHLOKAS, ...userShlokas];
}

export function addCustomShloka(profileId, shlokaData) {
  const userShlokas = getUserShlokas(profileId);
  const newShloka = {
    id: `custom_shloka_${Date.now()}`,
    verse: shlokaData.verse,
    sanskrit: shlokaData.sanskrit || '',
    translation: shlokaData.translation || '',
    status: shlokaData.status || 'to-learn',
    isPreloaded: false
  };
  userShlokas.push(newShloka);
  saveUserShlokas(profileId, userShlokas);
  return newShloka;
}

export function updateShlokaStatus(profileId, shlokaId, newStatus) {
  const userShlokas = getUserShlokas(profileId);
  const userItem = userShlokas.find(s => s.id === shlokaId);
  if (userItem) {
    userItem.status = newStatus;
    saveUserShlokas(profileId, userShlokas);
    return true;
  }
  return false; // preloaded ones status can be overridden in user profile if desired
}
