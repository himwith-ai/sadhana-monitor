# 🪷 Sadhana Monitor App — Detailed Implementation Plan

---

## 1. Overview

A premium, offline-first spiritual practice tracker for ISKCON devotees. Built with vanilla HTML/CSS/JS. Stores all data in `localStorage`. Supports multiple devotee profiles on the same device, with a special Counsellor role that can monitor mentees.

**Core Philosophy of the App**: Not just a habit tracker — a *spiritual companion* that understands the language of bhakti (sravanam, kirtanam, japa, seva) and gives meaningful, Prabhupada-flavored guidance.

---

## 2. Tech Stack

| Layer | Technology | CDN / Source |
|---|---|---|
| Structure | HTML5 (semantic) | — |
| Styling | Vanilla CSS3 (custom properties) | — |
| Logic | Vanilla JavaScript ES6+ (modules via `type="module"`) | — |
| Charts | Chart.js v4 | `cdn.jsdelivr.net/npm/chart.js` |
| Icons | Lucide Icons | `unpkg.com/lucide@latest` |
| Fonts | Playfair Display + Inter | Google Fonts CDN |
| PDF Export | jsPDF + html2canvas | CDN |
| Storage | `localStorage` (browser-native) | — |

No build tools. No npm. No frameworks. Open `index.html` directly in browser. ✅

---

## 3. File Structure

```
e:\PSI AI\Experiment\Sadhana\
│
├── index.html                  ← App shell — all screens as <section> elements
│
├── css/
│   ├── style.css               ← Design tokens + all component styles
│   └── animations.css          ← Keyframes, transitions, micro-animations
│
└── js/
    ├── storage.js              ← All localStorage read/write helpers
    ├── quotes.js               ← 365 Prabhupada quotes array + getQuoteOfDay()
    ├── shlokas.js              ← Pre-loaded shloka library (30+ shlokas)
    ├── calendar.js             ← Ekadashi + Vaishnava festival dates (2025–2030)
    ├── recommendations.js      ← Score calculator + recommendation engine
    ├── profiles.js             ← Profile select screen + onboarding wizard
    ├── home.js                 ← Home dashboard renderer
    ├── entry.js                ← Daily entry form
    ├── analytics.js            ← Charts, heatmap, stats
    ├── counsellor.js           ← Counsellor dashboard
    ├── settings.js             ← Settings + goals + export
    └── app.js                  ← Main init, router, global state
```

---

## 4. Design System

### 4.1 Color Tokens (`css/style.css`)

```
--bg-primary:       #FDFAF5   ← Warm cream (main background)
--bg-secondary:     #F5F0E8   ← Slightly darker cream (page sections)
--card-bg:          #FFFFFF   ← Pure white cards
--card-hover:       #FEFCF8   ← Card hover state

--saffron:          #E8730A   ← Primary accent (CTAs, highlights)
--saffron-light:    #FFF3E8   ← Saffron widget bg
--saffron-border:   #F5C49A   ← Saffron card border

--gold:             #D4A017   ← Secondary accent (streak, score)
--gold-light:       #FFFBE8   ← Gold widget bg

--lavender:         #9B7FD4   ← Hearing widget
--lavender-light:   #F0EBFF   ← Lavender widget bg

--mint:             #4CAF82   ← Reading / success states
--mint-light:       #E8F5F0   ← Mint widget bg

--rose:             #E8708A   ← Seva / mood widget
--rose-light:       #FFF0F3   ← Rose widget bg

--text-primary:     #2C1810   ← Warm dark brown (headings)
--text-secondary:   #6B5344   ← Body text
--text-muted:       #9E8A7A   ← Placeholders, labels
--text-on-accent:   #FFFFFF   ← Text on colored buttons

--border:           #E8DDD0   ← Card borders
--shadow-sm:        0 2px 8px rgba(44,24,16,0.06)
--shadow-md:        0 4px 20px rgba(44,24,16,0.10)
--shadow-lg:        0 8px 32px rgba(44,24,16,0.14)

--radius-sm:        10px
--radius-md:        16px
--radius-lg:        24px
--radius-xl:        32px
```

### 4.2 Typography

```
--font-heading:  'Playfair Display', Georgia, serif
--font-body:     'Inter', -apple-system, sans-serif

Heading 1: Playfair Display, 28px, 700, color: --text-primary
Heading 2: Playfair Display, 22px, 600
Heading 3: Inter, 16px, 600, letter-spacing: -0.2px
Body:       Inter, 14px, 400, line-height: 1.6
Caption:    Inter, 12px, 400, color: --text-muted
```

### 4.3 Key Reusable Components

| Component | CSS Class | Description |
|---|---|---|
| Card | `.card` | White bg, shadow-md, border-radius lg |
| Widget card | `.widget-card` | Colored gradient bg, progress ring |
| Streak banner | `.streak-banner` | Full-width saffron gradient |
| Quote card | `.quote-card` | Parchment texture, serif text |
| Rec card | `.recommendation-card` | Soft teal, lightbulb icon |
| Form section | `.form-section` | White card with icon header |
| Round counter | `.round-counter` | ± buttons, large number display |
| Time picker | `.time-picker` | HH:MM with up/down steppers |
| Progress ring | `.progress-ring` | SVG circle, stroke-dasharray animation |
| Heatmap | `.heatmap-grid` | CSS grid, colored cells |
| Bottom nav | `.bottom-nav` | Fixed bar, 4-5 tabs, icon + label |
| Profile card | `.profile-card` | Avatar circle, name, role badge |
| Mentee card | `.mentee-card` | Status badge, mini progress bars |
| Onboarding step | `.onboarding-step` | Full-screen step with progress dots |
| Modal | `.modal` | Overlay with centered content |

---

## 5. Screen-by-Screen Detailed Design

---

### 5.1 Profile Select Screen

**Shown on app launch (if profiles exist)**

```
┌────────────────────────────────────┐
│  🪷  Sadhana Monitor               │
│   "Hare Krishna"                   │  ← Greeting subtitle
│                                    │
│   Who is practicing today?         │  ← Section heading
│                                    │
│  ┌──────────┐  ┌──────────┐        │
│  │  H       │  │  P       │        │  ← Profile avatar circles
│  │ Himanshu │  │  Priya   │        │     with initial letter
│  │ Devotee  │  │ Devotee  │        │     and role badge below
│  └──────────┘  └──────────┘        │
│                                    │
│  ┌──────────┐  ┌──────────┐        │
│  │  C       │  │   +      │        │
│  │ Counsell │  │ Add New  │        │
│  │ Counselr │  │          │        │
│  └──────────┘  └──────────┘        │
│                                    │
└────────────────────────────────────┘
```

**Interactions:**
- Tap any profile card → switch active profile → navigate to Home
- Tap Counsellor profile → navigate to Counsellor Dashboard (not Home)
- Tap "+ Add New" → launch Onboarding Wizard

---

### 5.2 Onboarding Wizard (3 Steps)

**Step 1 — Who are you?**
```
Progress: ● ○ ○

🌸 Welcome to Sadhana Monitor

Your Name:    [________________]
Initiated?    [ ] Yes  → show "Initiated Name" field
              [✓] No

Your Guru:    [________________]  (optional)

              [Continue →]
```

**Step 2 — Set Your Goals**
```
Progress: ● ● ○

🎯 Set Your Daily Sadhana Goals

Japa Rounds:    [16] ← stepper input
Hearing:        [60] mins
Reading:        [30] mins
Shlokas/week:   [1]

These can be changed anytime in Settings.

[← Back]  [Continue →]
```

**Step 3 — Role Selection**
```
Progress: ● ● ●

👤 What is your role?

┌─────────────────────────────┐
│  🧘 Devotee                 │
│  I track my own sadhana     │
└─────────────────────────────┘

┌─────────────────────────────┐
│  📋 Counsellor              │
│  I monitor mentees too      │
│  (+ Devotee features)       │
└─────────────────────────────┘

[← Back]  [Start My Sadhana 🙏]
```

---

### 5.3 Home Screen

**Full layout:**

```
─────────────────────────────────────
 HEADER
 🙏 Hare Krishna, Himanshu          [👤]
 Wednesday, 6 August 2026
─────────────────────────────────────
 STREAK BANNER (saffron gradient)
 🔥 21 Day Streak
 Progress bar: ━━━━━━━━━━━━━━ 87%
 "Personal best: 25 days"
─────────────────────────────────────
 WIDGET GRID (2x2)

 [Chanting Widget]  [Hearing Widget]
   🔮 Chanting       🎧 Hearing
   ◎ 12/16 rds       ◗ 45/60 min
   Circular ring     Arc ring
   75% complete      75% complete

 [Reading Widget]   [Shloka Widget]
   📖 Reading         🕉️ Shloka
   ▬ 20/30 min       BG 2.20 ✓
   Progress bar       ⭐ 2 memorized
─────────────────────────────────────
 DAILY ROUTINE CARD
 ⏰ Daily Routine
 🌅 Wake Up: 4:30 AM   🌙 Sleep: 10:00 PM
 Sleep: 6.5 hrs  🟡  [Edit]
─────────────────────────────────────
 MORNING PROGRAM + PRINCIPLES (summary)
 🌸 Mangala ✓  Guru Puja ✓  Tulasi ✗
 ✅ All 4 Principles Observed
─────────────────────────────────────
 SADHANA SCORE
 Your Score Today
 ━━━━━━━━━━━━━ 78 / 100
 [Chant 29pts] [Hear 19pts] [Read 11pts]
─────────────────────────────────────
 RECOMMENDATION CARD
 💡 Today's Guidance
 ★ You completed 4 rounds less than
   your goal. Finishing japa before
   8 AM dramatically improves focus.
 ★ Sleep earlier — aim for 9:30 PM.
─────────────────────────────────────
 PRABHUPADA QUOTE
 📿 Quote of the Day  (Day 219 / 365)
 ❝ One who is not envious but is a
   kind friend to all living entities...❞
     — Srila Prabhupada, BG 12.13-14
─────────────────────────────────────
 UPCOMING EVENT
 📅 Ekadashi in 3 days (Aug 9)
─────────────────────────────────────
 [✏️ Log Today's Sadhana]  ← sticky CTA
─────────────────────────────────────
  BOTTOM NAV: 🏠 | ✏️ | 📊 | 👥 | ⚙️
─────────────────────────────────────
```

**Widget Card Internals:**
Each widget card has:
- Icon (top-left)
- Label (top-left below icon)
- Large value (center)
- Progress ring or bar (right side or center)
- Tap → jumps to Entry screen at that field

**Progress Ring:**
- SVG `<circle>` element
- `stroke-dasharray: circumference`
- `stroke-dashoffset: circumference * (1 - percentage)`
- Animated with CSS `transition: stroke-dashoffset 1s ease`

---

### 5.4 Daily Entry Screen

**Full layout:**

```
─────────────────────────────────────
 HEADER
 ← Today's Sadhana     📅 Aug 6 ▾
   (tap date to change day)
─────────────────────────────────────
 ⏰ DAILY ROUTINE
 ┌─────────────┬─────────────────┐
 │ 🌅 Wake Up  │ 🌙 Sleep Time   │
 │ [04] : [30] │ [22] : [00]    │
 │  ▲      ▲  │  ▲       ▲    │
 │  ▼      ▼  │  ▼       ▼    │
 └─────────────┴─────────────────┘
 Sleep duration: 6.5 hrs  🟡 Fair
─────────────────────────────────────
 🌸 MORNING PROGRAM
 [✓] Mangala Arati    [✓] Guru Puja
 [ ] Tulasi Puja      [ ] Deity Darshan
─────────────────────────────────────
 ✅ 4 REGULATIVE PRINCIPLES
 [✓] No Meat/Fish/Eggs
 [✓] No Intoxication
 [✓] No Gambling
 [✓] No Illicit Sex
─────────────────────────────────────
 🔮 JAPA / CHANTING
 Target: 16 rounds [✏️ Edit]
 ┌─────────────────────────────────┐
 │    [  −  ]    12    [  +  ]   │  ← tap +/- or type
 │    ━━━━━━━━━━━━━ 75%           │  ← progress bar
 └─────────────────────────────────┘
─────────────────────────────────────
 🎧 HEARING (Srila Prabhupada)
 Target: 60 min [✏️ Edit]
 ●━━━━━━━━━━━━━━━━━━━━○  45 min
 (draggable slider, 0-120 min)
─────────────────────────────────────
 📖 SHASTRA READING
 Target: 30 min [✏️ Edit]
 ┌─────────────────────────────────┐
 │    [  −  ]    20    [  +  ]   │
 │    ━━━━━━━━━━━━━ 67%           │
 └─────────────────────────────────┘
─────────────────────────────────────
 🕉️ SHLOKA RECITATION
 Recited today:  [BG 2.20 ▾] select
 + Add new shloka to library
 
 My Shloka Library:
 ● BG 18.66 ✅ Memorized
 ● Siksastaka 1 🔄 Learning
 ● BG 2.13 📋 To Learn
─────────────────────────────────────
 🙌 SEVA / SERVICE
 ┌─────────────────────────────────┐
 │ What service did you render     │
 │ today?                          │
 │                                 │
 └─────────────────────────────────┘
─────────────────────────────────────
 📓 RUCHI / SPIRITUAL TASTE
 How was your taste in sadhana?
 ☆ ☆ ☆ ☆ ☆  (tap star to rate 1-5)
 ┌─────────────────────────────────┐
 │ Any reflection or realization?  │
 └─────────────────────────────────┘
─────────────────────────────────────
 ➕ CUSTOM ACTIVITIES
 (shows any user-defined activities)
 [+ Add Custom Activity]
─────────────────────────────────────
 [ 🙏 Save Today's Sadhana ]  ← button
─────────────────────────────────────
```

**Date Picker:**
- Tap the date header → small dropdown showing last 7 days + "Pick date" option
- Cannot log future dates
- Past entries load existing data when selected

**Round Counter Behavior:**
- Tap `−` decrements (min 0)
- Tap `+` increments (max 108)
- Long-press `+` → fast increment
- Tap the number → open numeric keyboard input

**Hearing Slider:**
- Range: 0 to 180 minutes
- Step: 5 minutes
- Shows formatted value: "1h 30m" for 90 mins
- Live preview updates as dragged

---

### 5.5 Analytics Screen

```
─────────────────────────────────────
 HEADER
 📊 Sadhana Analytics
─────────────────────────────────────
 TIME FILTER
 [Week] [Month] [Year] [Custom]
           ↑ selected = saffron pill
─────────────────────────────────────
 STREAK HEATMAP
 "Your Streak Calendar — August 2026"
 
 Mo Tu We Th Fr Sa Su
 ■  ■  ■  □  ■  ■  ■   ← Week 1
 ■  ■  ■  ■  ■  □  ■   ← Week 2
 ...
 
 Color intensity = sadhana score %
 Legend: □ 0%  ░ 1-40%  ▒ 41-70%  ■ 71-100%
─────────────────────────────────────
 PERIOD SUMMARY STATS (4 cards row)
 ┌────┐ ┌────┐ ┌────┐ ┌────┐
 │ 21 │ │ 78 │ │ 87%│ │ 4.2│
 │Days│ │Score│ │Chnt│ │Mood│
 │strk│ │avg │ │avg │ │avg │
 └────┘ └────┘ └────┘ └────┘
─────────────────────────────────────
 PROGRESS RINGS (period averages)
 "How did you do this month?"
 
   [🔮 87%]   [🎧 72%]   [📖 65%]
   Chanting    Hearing    Reading
   
   (3 circular progress rings side by side)
─────────────────────────────────────
 WAKE/SLEEP CHART
 "Sleep Consistency"
 Area chart: wake time (top line)
             sleep time (bottom line)
 Shaded region between = sleep window
─────────────────────────────────────
 SADHANA SCORE TREND
 "Your Score Over Time"
 Line chart: score per day
 Gradient fill below line (saffron→transparent)
─────────────────────────────────────
 ACTIVITY BREAKDOWN
 "Rounds Completed"
 Bar chart: daily rounds, goal line overlay
 
 "Hearing Minutes"
 Bar chart: daily hearing mins
─────────────────────────────────────
 MOOD / RUCHI TREND
 "Spiritual Taste"
 Bar chart: daily 1-5 mood rating
 Color: green (4-5), amber (3), red (1-2)
─────────────────────────────────────
 PERSONAL BESTS
 🏆 Personal Bests
 ┌─────────────────────────────────┐
 │ 🔥 Best Streak:      21 days   │
 │ 🔮 Most Rounds/day:  32        │
 │ 🎧 Most Hearing/day: 120 min   │
 │ 📖 Most Reading/day: 90 min    │
 │ 🌅 Earliest Wake-up: 4:00 AM   │
 │ ⭐ Best Score:       98/100    │
 └─────────────────────────────────┘
─────────────────────────────────────
 EXPORT REPORT
 [📄 Export Monthly Report as PDF]
─────────────────────────────────────
```

**Charts (Chart.js v4):**

| Chart | Type | X-axis | Y-axis | Colors |
|---|---|---|---|---|
| Score Trend | Line + fill | Dates | 0-100 | Saffron gradient |
| Chanting | Bar | Dates | Rounds | Saffron bars, gold goal line |
| Hearing | Bar | Dates | Minutes | Lavender bars |
| Sleep window | Line (two) | Dates | Time (HH) | Mint area fill |
| Mood | Bar | Dates | 1-5 | Green/amber/red |

---

### 5.6 Counsellor Dashboard

```
─────────────────────────────────────
 HEADER
 📋 Counsellor Dashboard
 Prabhu Radheshyam Das  [Counsellor]
─────────────────────────────────────
 ⚠️ ATTENTION NEEDED
 (red alert cards for inactive mentees)
 Rohit Das — 3 days without sadhana
 [Send Encouragement]
─────────────────────────────────────
 MY MENTEES
 (horizontal scroll or vertical list)
 
 ┌──────────────────────────────────┐
 │ [H] Himanshu Das          🟢    │
 │     Streak: 21 days 🔥          │
 │     Chanting ━━━━━━━━ 75%       │
 │     Hearing  ━━━━━ 60%          │
 │     Score: 78  [View Details →] │
 └──────────────────────────────────┘
 
 ┌──────────────────────────────────┐
 │ [P] Priya Devi            🟡    │
 │     Streak: 5 days              │
 │     Chanting ━━━ 50%            │
 │     Hearing  ━━ 40%             │
 │     Score: 52  [View Details →] │
 └──────────────────────────────────┘
 
 ┌──────────────────────────────────┐
 │ [R] Rohit Das             🔴    │
 │     Streak: 0 days ❌           │
 │     Last active: 3 days ago     │
 │     Score: --  [View Details →] │
 └──────────────────────────────────┘
 
 [+ Add Mentee]
─────────────────────────────────────
```

**Mentee Detail View (drill-down):**
```
 ← Himanshu Das                  🟢
─────────────────────────────────────
 This Month: Score 78  Streak 21d
─────────────────────────────────────
 7-day heatmap mini calendar
─────────────────────────────────────
 Mini line chart: score trend
─────────────────────────────────────
 📝 Counsellor Notes
 [Private notes only you can see...]
 [Save Note]
─────────────────────────────────────
 📤 Send Encouragement
 (generates WhatsApp-ready message)
─────────────────────────────────────
```

**Status Badge Logic:**
- 🟢 Active: logged sadhana today or yesterday
- 🟡 Needs Attention: missed 2 days
- 🔴 Inactive: missed 3+ days

---

### 5.7 Settings Screen

```
─────────────────────────────────────
 ⚙️ Settings
─────────────────────────────────────
 PROFILE
 [H] Himanshu Das  (Devotee)  [Edit]
─────────────────────────────────────
 DAILY GOALS
 Japa Rounds:    [16  ▲▼]
 Hearing:        [60  ▲▼] mins
 Reading:        [30  ▲▼] mins
 Shlokas/week:   [1   ▲▼]
─────────────────────────────────────
 MORNING PROGRAM
 (toggle which items to track)
 [✓] Mangala Arati
 [✓] Guru Puja
 [✓] Tulasi Puja
 [✓] Deity Darshan
 [+ Add item]
─────────────────────────────────────
 CUSTOM ACTIVITIES
 [+ Add Custom Activity]
 (each has: name, unit, daily goal, icon)
─────────────────────────────────────
 SHLOKA LIBRARY
 [Manage My Shlokas →]
─────────────────────────────────────
 DATA
 [📤 Export Profile as JSON]
 [📥 Import Profile from JSON]
 [🗑️ Clear All My Data]  (danger zone)
─────────────────────────────────────
 PROFILES
 [👤 Switch Profile]
 [+ Add Another Profile]
─────────────────────────────────────
 APP INFO
 Sadhana Monitor v1.0
 "Jai Srila Prabhupada 🙏"
─────────────────────────────────────
```

---

## 6. Data Model (Complete)

### 6.1 localStorage Keys

| Key | Type | Description |
|---|---|---|
| `sadhana_profiles` | `Profile[]` | All profiles |
| `sadhana_active_profile` | `string` | Active profile ID |
| `entry_{profileId}_{YYYY-MM-DD}` | `Entry` | One per day per profile |
| `goals_{profileId}` | `Goals` | User's targets |
| `custom_activities_{profileId}` | `Activity[]` | User-defined activities |
| `shlokas_{profileId}` | `Shloka[]` | Personal shloka library |
| `morning_items_{profileId}` | `string[]` | Customized morning checklist |
| `counsellor_notes_{cId}_{mId}` | `Note[]` | Counsellor notes per mentee |

### 6.2 Profile Object

```javascript
{
  id: "profile_1722923600000",         // timestamp-based ID
  name: "Himanshu",                    // display name
  initiatedName: "Himanshu Das",       // optional
  guruName: "HH Jayapataka Swami",    // optional
  role: "devotee",                     // "devotee" | "counsellor"
  menteeIds: [],                       // only for counsellor
  avatarColor: "#E8730A",              // random from palette
  createdAt: "2026-08-06T07:00:00Z"
}
```

### 6.3 Daily Entry Object

```javascript
{
  date: "2026-08-06",
  profileId: "profile_1722923600000",
  routine: {
    wakeUp: "04:30",           // "HH:MM" 24-hr
    sleep: "22:00",            // "HH:MM" 24-hr
    sleepDuration: 6.5         // auto-calculated in hours
  },
  morningProgram: {
    mangalaArati: true,
    guruPuja: true,
    tulasiPuja: false,
    deityDarshan: false
    // + any custom items
  },
  principles: {
    noMeat: true,
    noIntoxication: true,
    noGambling: true,
    noIllicitSex: true
  },
  chanting: {
    rounds: 12,
    target: 16                 // copied from goals at time of entry
  },
  hearing: {
    mins: 45,
    target: 60
  },
  reading: {
    mins: 20,
    target: 30
  },
  shloka: {
    recitedId: "bg_2_20",     // ID from shloka library
    recitedText: "BG 2.20"    // display label
  },
  seva: "Temple flower decoration",
  mood: {
    rating: 4,                // 1-5
    note: "Felt very focused during japa today"
  },
  customActivities: [
    { activityId: "act_001", name: "Deity Service", value: 30, unit: "mins" }
  ],
  score: 78,                  // auto-computed (0-100)
  savedAt: "2026-08-06T08:45:00Z"
}
```

### 6.4 Goals Object

```javascript
{
  profileId: "profile_1722923600000",
  chanting: 16,       // rounds
  hearing: 60,        // mins
  reading: 30,        // mins
  shlokaPerWeek: 1
}
```

### 6.5 Shloka Object

```javascript
{
  id: "bg_18_66",
  verse: "BG 18.66",
  sanskrit: "sarva-dharmān parityajya...",
  translation: "Abandon all varieties of religion...",
  status: "memorized",    // "memorized" | "learning" | "to-learn"
  dateAdded: "2026-07-01",
  isPreloaded: true       // false = user added
}
```

---

## 7. Sadhana Score Algorithm (0–100)

```
Score = Sum of weighted components:

  Chanting:           min(rounds / target, 1.0)  × 30 pts
  Hearing:            min(mins / target, 1.0)    × 20 pts
  Reading:            min(mins / target, 1.0)    × 15 pts
  Morning Program:    (items_done / total_items) × 10 pts
  4 Principles:       (principles_kept / 4)      × 10 pts
  Wake-up time:       before 4:30 → 5 pts
                      before 5:30 → 3 pts
                      before 6:30 → 1 pt
                      else → 0 pts
  Shloka recited:     recited today? → 5 pts
  Seva logged:        non-empty text? → 5 pts
                                       ────────
  MAXIMUM:                             100 pts

Score Label:
  90-100: "Exceptional 🌟"
  75-89:  "Very Good 🙏"
  60-74:  "Good ✨"
  40-59:  "Moderate 📿"
  0-39:   "Needs Attention ⚠️"
```

---

## 8. Recommendation Engine

Generates **2–3 personalized tips** based on the last 7 days of data.

### 8.1 Rule Priority Order

Rules are evaluated in order; top 3 matching rules are shown:

```
RULE 1 — Chanting shortfall (HIGH priority)
  IF: average rounds < 80% of target for last 3 days
  SHOW: "You are averaging {N} rounds, {M} short of your {T}-round goal.
         Finishing japa before breakfast greatly helps consistency."

RULE 2 — Late wake-up
  IF: average wake time > 06:00 for last 5 days
  SHOW: "Brahma-muhurta (4:24–5:12 AM) is the most powerful time for japa.
         Even waking at 5 AM will transform your morning."

RULE 3 — No hearing (HIGH)
  IF: hearing = 0 for 2+ consecutive days
  SHOW: "Sravanam is the first limb of bhakti. Even 15 mins of Prabhupada
         lecture daily can completely change the heart."

RULE 4 — Streak broken
  IF: yesterday = no entry OR score < 20
  SHOW: "Every saint has a past, every sinner has a future. Today is a
         fresh start — even one round of japa is a great offering."

RULE 5 — Late sleep
  IF: average sleep time > 23:00 for last 5 days
  SHOW: "To rise early, we must sleep early. Aim to rest by 9:30 PM — this
         is the Vaishnava standard for Brahma-muhurta attendance."

RULE 6 — No shloka in a week
  IF: no shloka recited in last 7 days
  SHOW: "A shloka a week = 52 shlokas memorized in a year. Which verse
         will you add to your heart today?"

RULE 7 — All principles observed 30 days
  IF: all 4 principles = true for 30 consecutive days
  SHOW: "30 days of clean principles! Srila Prabhupada says this is the
         real foundation of spiritual life. Keep going!"

RULE 8 — High score encouragement
  IF: score ≥ 90 for 3+ days
  SHOW: "Excellent sadhana! You are setting a wonderful example. 
         Srila Prabhupada is surely pleased. 🙏"

RULE 9 — No reading
  IF: reading = 0 for 3+ days
  SHOW: "Shastra is the torchlight in the dark. Even 10 minutes of
         Bhagavad-gita or Srimad-Bhagavatam daily lights the way."

RULE 10 — Mood declining
  IF: average mood < 2.5 for last 5 days
  SHOW: "Spiritual dryness is natural. Prabhupada says: chant even if
         you don't feel like it — the holy name always acts."

RULE 11 — Improving trend (encouragement)
  IF: score trend is consistently rising over 7 days
  SHOW: "Your sadhana is growing every day! This upward trend is the
         real sign of advancement. Maintain this momentum!"

RULE 12 — Default (always shown if no other rules)
  SHOW: "Every day of sincere sadhana is a step closer to Goloka.
         Be consistent, be sincere — Krishna notices everything."
```

---

## 9. Prabhupada Quotes (365-Entry Library)

**File**: `js/quotes.js`

Structure:
```javascript
export const QUOTES = [
  {
    id: 1,
    text: "Chant Hare Krishna and be happy.",
    source: "Srila Prabhupada",
    reference: "Morning Walk, 1973"
  },
  // ... 365 entries
];

export function getQuoteOfDay() {
  const dayOfYear = getDayOfYear(new Date());
  return QUOTES[dayOfYear % QUOTES.length];
}
```

**Categories (thematic distribution across 365):**
| Category | Count |
|---|---|
| Japa & Chanting | 70 |
| Hearing & Association | 40 |
| Shastra & Knowledge | 40 |
| Surrender & Devotion | 60 |
| Regulative Principles | 40 |
| Encouragement & Progress | 55 |
| Love of Godhead | 60 |
| Guru & Disciplic Succession | 30 |
| **Total** | **395** (rotates) |

---

## 10. Pre-loaded Shloka Library

**File**: `js/shlokas.js`

```javascript
export const PRELOADED_SHLOKAS = [
  // Siksastakam (8 verses)
  { id: "sik_1", verse: "Siksastakam 1", sanskrit: "ceto-darpaṇa-mārjanam...", ... },
  // Brahma-samhita
  { id: "bs_5_1", verse: "Brahma-samhita 5.1", sanskrit: "īśvaraḥ paramaḥ kṛṣṇaḥ...", ... },
  // Bhagavad Gita key verses
  { id: "bg_2_20", verse: "BG 2.20", ... },
  { id: "bg_9_22", verse: "BG 9.22", ... },
  { id: "bg_18_65", verse: "BG 18.65", ... },
  { id: "bg_18_66", verse: "BG 18.66", ... },
  // Pancha Tattva Maha Mantra
  { id: "pancha_tattva", verse: "Pancha Tattva Mantra", ... },
  // Hare Krishna Maha Mantra
  { id: "maha_mantra", verse: "Maha Mantra", ... },
  // Guru Vandana
  { id: "guru_vandana", verse: "Guru Vandana", ... },
  // Srimad Bhagavatam 1.2.6
  { id: "sb_1_2_6", verse: "SB 1.2.6", ... },
  // + 20 more key verses
];
```

---

## 11. Ekadashi & Festival Calendar

**File**: `js/calendar.js`

```javascript
export const EKADASHI_DATES_2026 = [
  { date: "2026-01-10", name: "Putrada Ekadashi" },
  { date: "2026-01-25", name: "Shattila Ekadashi" },
  // ... all 24 Ekadashis for 2026
];

export const VAISHNAVA_FESTIVALS_2026 = [
  { date: "2026-02-11", name: "Nityananda Trayodashi" },
  { date: "2026-03-03", name: "Gaura Purnima" },
  { date: "2026-08-15", name: "Janmashtami" },
  { date: "2026-08-16", name: "Vyasa Puja" },
  // ... all major festivals
];

export function getNextEvent(fromDate) { ... }
export function getEventsInMonth(year, month) { ... }
```

---

## 12. JavaScript Module Interfaces

### 12.1 `storage.js`

```javascript
// Profiles
getProfiles() → Profile[]
saveProfiles(profiles) → void
getActiveProfileId() → string
setActiveProfileId(id) → void
getProfile(id) → Profile

// Entries
getEntry(profileId, dateStr) → Entry | null
saveEntry(entry) → void
getAllEntries(profileId) → Entry[]
getEntriesInRange(profileId, startDate, endDate) → Entry[]

// Goals
getGoals(profileId) → Goals
saveGoals(profileId, goals) → void

// Custom Activities
getCustomActivities(profileId) → Activity[]
saveCustomActivities(profileId, activities) → void

// Shlokas
getShlokas(profileId) → Shloka[]
saveShlokas(profileId, shlokas) → void

// Counsellor Notes
getCounsellorNotes(counsellorId, menteeId) → Note[]
saveCounsellorNote(counsellorId, menteeId, note) → void

// Import / Export
exportProfile(profileId) → JSON string
importProfile(jsonString) → Profile
```

### 12.2 `recommendations.js`

```javascript
calculateScore(entry, goals) → number (0-100)
getScoreLabel(score) → string
getRecommendations(profileId, entries, goals) → Recommendation[]
// Returns array of { icon, text, priority } — top 2-3 shown
```

### 12.3 `app.js`

```javascript
// Global state
App.state = {
  activeProfile: Profile,
  currentScreen: string,    // "home"|"entry"|"analytics"|"counsellor"|"settings"
  currentDate: string       // "YYYY-MM-DD"
}

// Navigation
App.navigateTo(screenName) → void
App.showProfileSelect() → void

// Init
App.init() → void   // called on DOMContentLoaded
```

---

## 13. CSS Animations

**File**: `css/animations.css`

| Animation | Usage | Effect |
|---|---|---|
| `fadeInUp` | Screen transitions | Slide up + fade in (300ms) |
| `progressRingFill` | Widget rings | Stroke draws from 0 to value |
| `scoreCountUp` | Score number | Number counts up to value |
| `pulseGlow` | Streak banner | Soft pulsing glow |
| `shimmer` | Loading skeleton | Shimmer left-to-right |
| `bounceIn` | Onboarding steps | Slight bounce on appear |
| `ripple` | Button tap | Material ripple effect |
| `slideInRight` | Mentee drill-down | Slide from right |
| `toastSlideUp` | Save confirmation | Toast notification |

---

## 14. Responsive Design

The app is designed **mobile-first** (375px base width). It also works on tablets and desktop but the layout stays centered and narrow (max-width: 480px) like a mobile app, with a soft app-chrome border on larger screens.

```css
.app-shell {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  background: var(--bg-primary);
}
```

---

## 15. PDF Export (Monthly Report)

Generated via `jsPDF` + `html2canvas`:

**Report contents:**
- Profile name + month
- Summary stats: total days logged, average score, streak
- Activity averages: rounds, hearing, reading
- Streak calendar (heatmap image)
- Top 3 personal bests
- Prabhupada quote for the month
- Counsellor signature field (if applicable)

---

## 16. Build Order (Sequential)

```
1.  css/style.css          ← Design system (tokens + all components)
2.  css/animations.css     ← Keyframes + transitions
3.  js/storage.js          ← Data layer (everything depends on this)
4.  js/quotes.js           ← 365 quotes data
5.  js/shlokas.js          ← Shloka library data
6.  js/calendar.js         ← Ekadashi + festival data
7.  js/recommendations.js  ← Score + recommendation logic
8.  js/profiles.js         ← Profile select + onboarding wizard
9.  js/home.js             ← Home dashboard
10. js/entry.js            ← Daily entry form
11. js/analytics.js        ← Charts + heatmap
12. js/counsellor.js       ← Counsellor dashboard
13. js/settings.js         ← Settings page
14. js/app.js              ← Router + init (loads everything)
15. index.html             ← HTML shell (loaded last, ties it all)
```

---

## 17. What's NOT in v1 (Future Roadmap)

| Feature | Why deferred |
|---|---|
| Cloud sync / Firebase | Requires backend; v1 is offline-first |
| Push notifications | Service workers; can add in v2 |
| Social sharing of sadhana | Privacy consideration |
| Audio player for lectures | Out of scope; link to apps |
| Multi-language (Hindi/Bengali) | v2 |

---

## ✅ Approval Checklist

> [!IMPORTANT]
> Please confirm the following before I begin coding:

- [ ] The 5-screen structure (Home, Entry, Analytics, Counsellor, Settings) is correct
- [ ] The scoring formula (Chanting 30pts, Hearing 20pts, Reading 15pts, etc.) looks right
- [ ] Same-device localStorage sharing for Counsellor–Mentee is acceptable
- [ ] Pre-loaded shlokas list is good (Siksastakam, Brahma-samhita, key BG verses)
- [ ] Recommendation rules make sense for your use case
- [ ] 365 Prabhupada quotes hardcoded in JS file is fine
- [ ] No backend / no login required ✅
- [ ] Open directly in browser (no build step) ✅

**Once you reply "Approved" or make any final tweaks → I will start building immediately.**
