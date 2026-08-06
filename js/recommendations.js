/* ==========================================================================
   🪷 SADHANA MONITOR — RECOMMENDATIONS & SCORE ENGINE (js/recommendations.js)
   ========================================================================== */

// --------------------------------------------------------------------------
// 1. Refined Sadhana Score Calculation (0 - 100)
// --------------------------------------------------------------------------
export function calculateScore(entry, goals) {
  if (!entry) return 0;
  
  const targetRounds = (goals && goals.chanting) ? goals.chanting : 16;
  const targetHearing = (goals && goals.hearing) ? goals.hearing : 60;
  const targetReading = (goals && goals.reading) ? goals.reading : 30;

  // 1. Chanting (Max 35 pts + up to 10% bonus)
  const actualRounds = entry.chanting?.rounds || 0;
  const chantingScore = Math.min(actualRounds / targetRounds, 1.1) * 35;

  // 2. Hearing (Max 25 pts)
  const actualHearing = entry.hearing?.mins || 0;
  const hearingScore = Math.min(actualHearing / targetHearing, 1.1) * 25;

  // 3. Reading (Max 20 pts)
  const actualReading = entry.reading?.mins || 0;
  const readingScore = Math.min(actualReading / targetReading, 1.1) * 20;

  // 4. Morning Program (Max 10 pts)
  let mpScore = 0;
  if (entry.morningProgram) {
    const keys = Object.keys(entry.morningProgram);
    const completed = keys.filter(k => entry.morningProgram[k] === true).length;
    mpScore = keys.length > 0 ? (completed / keys.length) * 10 : 0;
  }

  // 5. Smooth Wake-Up Score (Max 5 pts)
  let wakeScore = 0;
  if (entry.routine && entry.routine.wakeUp) {
    const [hrs, mins] = entry.routine.wakeUp.split(':').map(Number);
    const wakeMins = hrs * 60 + mins;
    if (wakeMins <= 270) { // 4:30 AM or earlier
      wakeScore = 5;
    } else if (wakeMins >= 390) { // 6:30 AM or later
      wakeScore = 0;
    } else {
      wakeScore = 5 * (1 - (wakeMins - 270) / 120);
    }
  }

  // 6. Seva logged & duration (5 pts)
  const sevaText = entry.seva?.text || (typeof entry.seva === 'string' ? entry.seva : '');
  const sevaMins = entry.seva?.mins || 0;
  const sevaScore = (sevaText.trim().length > 0 || sevaMins > 0) ? 5 : 0;

  // 7. Shloka recited / memorized this week (5 pts)
  const shlokaScore = (entry.shloka && (entry.shloka.recitedId || entry.shloka.memorizedText)) ? 5 : 0;

  const totalScore = Math.round(
    chantingScore + hearingScore + readingScore + mpScore + wakeScore + sevaScore + shlokaScore
  );

  return Math.min(totalScore, 100);
}

export function getScoreLabel(score) {
  if (score >= 90) return { label: "Exceptional 🌟", color: "var(--mint)" };
  if (score >= 75) return { label: "Very Good 🙏", color: "var(--saffron)" };
  if (score >= 60) return { label: "Good ✨", color: "var(--gold)" };
  if (score >= 40) return { label: "Moderate 📿", color: "var(--lavender)" };
  return { label: "Needs Attention ⚠️", color: "var(--rose)" };
}

// --------------------------------------------------------------------------
// 2. Rules Recommendation Engine
// --------------------------------------------------------------------------
export function getRecommendations(recentEntries = [], goals) {
  const recommendations = [];
  const targetRounds = (goals && goals.chanting) ? goals.chanting : 16;

  // Rule 1: Chanting Shortfall
  if (recentEntries.length >= 3) {
    const last3 = recentEntries.slice(-3);
    const avgRounds = last3.reduce((acc, e) => acc + (e.chanting?.rounds || 0), 0) / 3;
    if (avgRounds < targetRounds * 0.8) {
      recommendations.push({
        id: "r1",
        icon: "🔮",
        priority: 1,
        title: "Boost Your Morning Japa",
        text: `You've averaged ${avgRounds.toFixed(1)} rounds recently (short of your ${targetRounds}-round goal). Finishing early before 8 AM dramatically improves focus.`
      });
    }
  }

  // Rule 2: Late Wake-Up
  if (recentEntries.length > 0) {
    const lastEntry = recentEntries[recentEntries.length - 1];
    if (lastEntry.routine && lastEntry.routine.wakeUp) {
      const [hrs] = lastEntry.routine.wakeUp.split(':').map(Number);
      if (hrs >= 6) {
        recommendations.push({
          id: "r2",
          icon: "🌅",
          priority: 2,
          title: "Embrace Brahma-muhurta",
          text: "Brahma-muhurta (4:24–5:12 AM) is the quietest time for japa. Waking even 30 mins earlier brings great mental clarity."
        });
      }
    }
  }

  // Rule 3: No Hearing
  const hearingCount = recentEntries.filter(e => (e.hearing?.mins || 0) > 0).length;
  if (recentEntries.length >= 2 && hearingCount === 0) {
    recommendations.push({
      id: "r3",
      icon: "🎧",
      priority: 1,
      title: "Restore Daily Sravanam",
      text: "Sravanam (hearing) nourishes the soul. Even 15 mins of a Prabhupada lecture daily keeps enthusiasm high."
    });
  }

  // Rule 4: High Score Encouragement
  if (recentEntries.length > 0) {
    const latestScore = recentEntries[recentEntries.length - 1].score || 0;
    if (latestScore >= 90) {
      recommendations.push({
        id: "r4",
        icon: "🌟",
        priority: 3,
        title: "Wonderful Consistency!",
        text: "Your sadhana is shining brightly. Srila Prabhupada is surely pleased with your steady devotion."
      });
    }
  }

  // Rule 5: Default Fallback
  if (recommendations.length === 0) {
    recommendations.push({
      id: "r5",
      icon: "🪷",
      priority: 4,
      title: "Daily Bhakti Encouragement",
      text: "Every single day of sincere sadhana is a step closer to Krishna. Be steady, be sincere — Krishna sees every small effort."
    });
  }

  return recommendations.sort((a, b) => a.priority - b.priority).slice(0, 2);
}
