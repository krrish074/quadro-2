# Grand Line Ledger (React + Vite)
> *"Manage Your Crew. Split Your Beli. Settle Your Debts."*

A state-of-the-art One Piece pirate-themed expense splitting and debt settlement application rebuilt entirely with **React JS**, **Vite**, **React Router**, **React Context API**, and **Vanilla CSS**.

---

## 🏴‍☠️ Project Overview

**Grand Line Ledger** is a pirate-grade expense tracking and bilateral settlement command center designed for crews adventuring across the Grand Line. Built to be clean, modular, and easily understandable for a college Computer Science & Engineering student, the application strictly decouples financial mathematics from UI rendering and eliminates external dependencies like Redux, TypeScript, and Firebase in favor of clean React architecture.

---

## 📂 Project Structure

```
grand-line-ledger/
│
├── public/
│   └── assets/
│
├── src/
│   │
│   ├── components/
│   │   ├── Sidebar.jsx              # Main desktop navigation & active voyage switcher
│   │   ├── MobileNav.jsx            # Mobile fixed bottom navigation bar
│   │   ├── Header.jsx               # Voyage header with pirate flag and metadata
│   │   ├── PageHeader.jsx           # Reusable page banner and action triggers
│   │   ├── StatCard.jsx             # KPI statistic card with pirate color variants
│   │   ├── CrewMemberCard.jsx       # Pirate roster card with avatar, role, balance, Haki
│   │   ├── ExpenseCard.jsx          # Logged expense item with collapsible breakdown
│   │   ├── DebtCard.jsx             # Bilateral debt card with quick settle action
│   │   ├── SettlementCard.jsx       # Transaction record with Wanted Poster invoice toggle
│   │   ├── Modal.jsx                # Reusable accessible modal dialog
│   │   └── EmptyState.jsx           # Immersive onboarding state & deck placeholder
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx            # Financial Command Center centerpiece
│   │   ├── Crew.jsx                 # Crew management, enlisting & member ledgers
│   │   ├── Expenses.jsx             # Shared expense entry with live split preview
│   │   ├── ExpenseHistory.jsx       # Search, filter, sorting, inline edit & delete
│   │   ├── Debts.jsx                # Pairwise debt matrix & traceable source audit
│   │   ├── Settlements.jsx          # Greedy bilateral settlement engine & Wanted invoices
│   │   ├── Haki.jsx                 # Financial discipline leaderboard & honor log
│   │   ├── WantedBoard.jsx          # Dynamic One Piece Wanted Bounties for debtors
│   │   ├── NamiReminders.jsx        # Navigator Nami's overdue debt notices & interest
│   │   └── Settings.jsx             # Currency toggle, Web Audio synthesis & benchmark reset
│   │
│   ├── context/
│   │   └── AppContext.jsx           # Global state provider via React Context & hooks
│   │
│   ├── utils/
│   │   ├── calculations.js          # Pure financial calculation engine (Zero DOM)
│   │   ├── storage.js               # LocalStorage persistence & benchmark defaults
│   │   └── helpers.js               # Web Audio synth, Beli formatter & coin physics
│   │
│   ├── data/
│   │   └── characters.js            # Straw Hat presets, currencies, categories & Haki ranks
│   │
│   ├── styles/
│   │   ├── global.css               # Reset, typography, utility flex/grid classes
│   │   ├── theme.css                # Design tokens (Navy, Parchment, Gold, Red debt, Green credit)
│   │   ├── dashboard.css            # Command center layout, KPI grid, spending bars
│   │   ├── components.css           # Parchment cards, buttons, badges, modals, toasts
│   │   ├── forms.css                # Form controls, checkbox chips, split tables
│   │   ├── animations.css           # Keyframe transitions, pulses, coin drops
│   │   └── responsive.css           # Breakpoints (desktop, tablet, mobile bottom nav)
│   │
│   ├── App.jsx                      # React Router root & layout shell
│   └── main.jsx                     # Vite React mounting point
│
├── index.html                       # HTML5 entry with Google Fonts (Pirata One & Alegreya)
├── package.json                     # Vite, React 19, React Router 7 dependencies
├── test_verification.mjs            # Automated verification test suite
└── README.md                        # Documentation and architecture guide
```

---

## 🏛 React Architecture

The application is structured into four distinct, loosely coupled layers:

```
App.jsx (Router & Layout Shell)
    ↓
React Context (AppContext.jsx)
    ↓
React Router Pages (Dashboard, Crew, Expenses, Debts, Settlements, etc.)
    ↓
Reusable Presentation Components (StatCard, CrewMemberCard, ExpenseCard, Modal, etc.)
```

1. **State Independence**: Components never manipulate the DOM directly (`document.querySelector` and `innerHTML` are strictly banned). All visual changes flow declaratively from React state.
2. **Pure Mathematical Engine**: All financial math resides in `src/utils/calculations.js` as pure, deterministic functions that accept state snapshots and return immutable results.
3. **Transparent Global State**: Global state is encapsulated in `AppContext.jsx` using `React.createContext` and the `useApp()` custom hook.

---

## 🌐 Global State (AppContext.jsx)

State is managed centrally in `AppContext.jsx` and persisted to `localStorage` automatically:

- **State Model**:
  - `crews`: Array of voyages/crews with members, expenses, settlements, and logs.
  - `currentCrewId`: Active selected voyage ID.
  - `settings`: Currency symbol (`฿`, `₹`, `$`, `€`, `£`), Web Audio volume, sound toggle.
  - `toastMessage`: Notification queue.
- **Context Methods**:
  - `createCrew()`, `deleteCrew()`, `renameCrew()`, `toggleArchiveCrew()`, `setCurrentCrewId()`
  - `addMember()`, `removeMember()`
  - `addExpense()`, `editExpense()`, `deleteExpense()`
  - `recordSettlement()`, `settleEntireCrew()`
  - `updateSettings()`, `dismissNamiReminder()`, `resetAllData()`

---

## 💰 Pure Financial Calculation Engine (calculations.js)

### 1. Fundamental Balance Formula
For every crew member:
$$\text{Net Balance} = (\text{Amount Paid} - \text{Amount Owed}) + (\text{Settlements Paid} - \text{Settlements Received})$$

- **Positive ($> 0$)**: The pirate is a **creditor** and receives Beli.
- **Negative ($< 0$)**: The pirate is a **debtor** and owes Beli.
- **Zero ($= 0$)**: The pirate is completely balanced.

### 2. Conservation Invariant
In every valid ledger, total wealth is conserved:
$$\sum_{i=1}^{N} \text{Balance}_i \equiv 0$$

### 3. Greedy Bilateral Netting (Debt Minimization)
`generateSettlementPlan(balances)` eliminates circular and redundant debts by sorting creditors and debtors in descending magnitude, matching the largest debtor with the largest creditor until all balances reach ฿0. This solves multi-party settlements in the theoretical minimum number of transactions ($O(N \log N)$).

---

## 💾 LocalStorage Persistence (storage.js)

- `loadState()`: Reads and deserializes `grand_line_ledger_react_state`. If empty, automatically seeds the application with the canonical **Straw Hat Crew Benchmark**.
- `saveState(state)`: Automatically executed by `AppContext` via `useEffect` whenever state mutates.
- `clearState()`: Wipes local cache for testing and development resets.

---

## 📋 Core Requirements Verification (11 / 11 PASS)

| # | Requirement | Status | Verification Detail |
|---|---|---|---|
| **1** | Create and manage groups (crews) | **PASS** | Create, rename, archive, switch voyages, and disband crews in `Crew.jsx` & `Sidebar.jsx`. |
| **2** | Add and remove members | **PASS** | Enlist pirates with presets (Luffy, Zoro, Nami, Sanji, etc.) or custom roles; remove with plank check. |
| **3** | Add shared expenses | **PASS** | Record descriptions, amounts, dates, categories, and adventure notes in `Expenses.jsx`. |
| **4** | Select members involved | **PASS** | Interactive participant chips to select exact attendees per expense. |
| **5** | Equal and custom expense split | **PASS** | Toggle between equal fractional split and custom share allocation with live sum validation. |
| **6** | Record amount paid by each member | **PASS** | Single-payer dropdown or multi-payer table with custom payment distribution. |
| **7** | Calculate individual balances | **PASS** | $\text{Balance} = \text{Paid} - \text{Owed}$. Conserves $\sum \text{Balances} = 0$. Tested via unit tests. |
| **8** | Show who owes / receives | **PASS** | Bilateral debt cards displaying $\text{Debtor} \rightarrow \text{Creditor}$ with traceable source expenses. |
| **9** | Generate settlement plan | **PASS** | Greedy bilateral matching algorithm generates minimal payment transfers in `Settlements.jsx`. |
| **10** | Expense and settlement history | **PASS** | Searchable, category/member filtered history with inline edit & delete and live recalculation. |
| **11** | Overall financial dashboard | **PASS** | Centerpiece `Dashboard.jsx` with 4 KPIs, balance table, spending bars, pending debts, recent expenses, and quick actions. |

---

## ⚡ Official Bonus Requirements (4 / 4 PASS)

### Bonus 1: Graph-Based Debt Simplification Algorithm
- **Location**: `src/utils/calculations.js` (`generateSettlementPlan`) & `src/pages/Settlements.jsx`
- **Algorithm**: **Greedy Bilateral Netting**. Given a directed debt graph $G = (V, E)$, direct pairwise debts can create cycles and up to $O(|V|^2)$ separate bilateral transactions.
- **Simplification Process**:
  1. Computes the divergence (net balance) at each vertex: $\text{Net}(v) = \text{TotalPaid}(v) - \text{TotalOwed}(v)$.
  2. Partitions into Creditors ($\text{Net} > 0$) and Debtors ($\text{Net} < 0$).
  3. Sorts creditors and debtors in descending magnitude order.
  4. Iteratively matches the maximum debtor $D$ with the maximum creditor $C$, executing a transfer of $T = \min(|\text{Net}(D)|, \text{Net}(C))$.
  5. Guaranteed to clear all obligations in at most $|V| - 1$ transactions (spanning forest of transfers), strictly minimizing total transactions while conserving total wealth ($\sum \text{Net} \equiv 0$).

### Bonus 2: One Piece Beli (฿) Currency Toggle with Gold Coins Animation
- **Location**: `src/pages/Settings.jsx`, `src/utils/helpers.js` (`spawnCoins`), `src/context/AppContext.jsx`
- **Features**:
  - Centralized currency setting supporting Beli ($\text{฿}$), Berries ($\$$), Indian Rupee ($\text{₹}$), Euro ($€$), and British Pound ($£$).
  - Toggling currency automatically updates every page (Dashboard, Expenses, History, Debts, Settlements, Wanted Board, Reminders, Haki) seamlessly.
  - Interactive 3D gold coin particle animation triggers on currency selection, logging expenses, and settling debts.

### Bonus 3: Nami "Debt Warning" Stamp for Excessive Debt
- **Location**: `src/components/CrewMemberCard.jsx`, `src/pages/Dashboard.jsx`, `src/pages/Settings.jsx`
- **Threshold**: Documented and configurable under `Settings.jsx` (Default: **฿1,000**).
- **Behavior**:
  - Automatically assesses each crew member's debt against the configurable threshold.
  - When $\text{Debt} \ge \text{Threshold}$, Nami's official red debt warning stamp (`🍊 NAMI'S DEBT WARNING`) displays prominently on the crew roster and the dashboard balance roster.
  - When debts are settled or reduced below the threshold, the warning immediately and automatically disappears.

### Bonus 4: Export Settlement Summary Receipt as Wanted Poster Style Invoice
- **Location**: `src/pages/Settlements.jsx` (Wanted Poster Summary Modal) & `src/components/SettlementCard.jsx`
- **Features**:
  - One-click export button (`📜 Export Wanted Poster Summary`) in the Settlement Command Deck.
  - Outputs an authentic Marine Headquarters Wanted Poster invoice receipt featuring:
    - Crew name, active logo, and ledger date.
    - Total voyage expenditures and total outstanding debt.
    - Itemized list of required settlement transactions with payer, recipient, and amount.
    - Official Marine discharge status stamp (`CLEARED & SETTLED` or `PENDING DISCHARGE`).
    - Print and export capability via `window.print()` using print-specific stylesheets.

---

## 🧪 Benchmark Verification Test

The application has been verified against the official specification benchmark:

- **Crew**: Straw Hat Crew
- **Members**: Luffy, Zoro, Nami, Sanji
- **Expense**: Going Merry Dinner (฿1,200) paid by Luffy
- **Split**: Equal (฿300 each)
- **Calculated Balances**:
  - Luffy: `+฿900`
  - Zoro: `-฿300`
  - Nami: `-฿300`
  - Sanji: `-฿300`
- **Settlement Plan**:
  - Zoro → Luffy: `฿300`
  - Nami → Luffy: `฿300`
  - Sanji → Luffy: `฿300`
- **Post-Settlement**: All balances equal `฿0`.

Run the automated test suite anytime:
```bash
npm test
```
Result: **22 / 22 automated test assertions passing**.

---

## 🚀 How to Run Locally

```bash
# 1. Navigate to the project directory
cd grand-line-ledger

# 2. Install dependencies
npm install

# 3. Run the development server
npm run dev

# 4. Open in browser
# http://localhost:5173/

# 5. Build production bundle
npm run build
```
