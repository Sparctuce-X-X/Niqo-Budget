# Niqo-Budget

**Video Demo:** https://www.youtube.com/watch?v=9il8a2y-K4M

**Author:** Huang Dominique  
**Usernames:** GitHub `Spartcuce-X-X` · edX `huang_dominique`  
**Location & Date:** Paris , France — 09 Nov 2025

---

## Summary

**Niqo-Budget** is a personal budget management web application built with vanilla JavaScript, HTML, and CSS. It allows users to track their income and expenses, categorize transactions, visualize their financial situation through an interactive dashboard with charts, and customize categories. The application runs entirely client-side and stores all data locally in the browser via `localStorage`, ensuring complete privacy without requiring a backend server.

The project solves a concrete problem: many people struggle to track their finances daily without resorting to complex or paid applications. Niqo-Budget offers a simple, free solution accessible from any modern browser, requiring no internet connection after initial loading. The target audience includes students, young professionals, and anyone seeking a lightweight and private budgeting tool.

---

## Features

The application implements the following features, all present in the source code:

- **Local authentication**: Registration and login with SHA-256 password hashing (`auth.js`). Guest mode available for testing without creating an account.
- **Full transaction CRUD**: Add, display, and delete transactions (income/expenses) with amount, date, category, and optional note (`transactions.js`).
- **Category management**: Default categories (Housing, Food, Transport, Salary, etc.) with ability to add/delete custom categories (`categories.js`).
- **Dynamic dashboard**: Display of current month's balance, income and expenses, list of 5 most recent transactions, and doughnut chart showing expense distribution by category via Chart.js (`dashboard.js`).
- **User settings**: Modify name and currency (EUR, USD, GBP), complete local data reset (`settings.js`).
- **Multi-currency**: Automatic amount formatting based on selected currency via `Intl.NumberFormat`.
- **Responsive interface**: Modern design with color gradients, fixed sidebar, rounded cards and drop shadows (`style.css`).
- **Logout**: Session removal and redirect to login screen (`logout.js`).

### User Stories

1. **As a student**, I want to record my daily expenses (rent, food, transport) to know how much I have left until the end of the month.
2. **As a freelancer**, I want to categorize my income (salary, freelance, investments) and expenses to prepare my tax return.
3. **As a privacy-conscious user**, I want my financial data to remain only on my device, without being sent to a third-party server.

---

## Architecture

### Technical Stack

- **Frontend**: HTML5, CSS3 (custom properties, flexbox, grid), JavaScript ES6+ (IIFE modules, async/await, Web Crypto API).
- **External library**: Chart.js (CDN) for circular charts.
- **Storage**: Browser `localStorage` (no backend, no server database).

### Folder Structure

```
/views/          → HTML pages (index.html, dashboard.html, transactions.html, categories.html, settings.html)
/js/             → JavaScript scripts (auth.js, dashboard.js, transactions.js, categories.js, settings.js, logout.js)
/css/            → Single stylesheet (style.css)
/assets/         → Resources (icons/, images/)
```

### Data Flow

1. **UI → Controller**: User submits a form (e.g., add transaction).
2. **Controller → Model**: JS script (`transactions.js`) creates a transaction object `{type, amount, date, category, note}`.
3. **Model → Storage**: Object is added to `transactions` array and serialized to JSON in `localStorage` under key `transactions_<username>`.
4. **Storage → UI**: Script reloads data from `localStorage`, filters/sorts if necessary, and updates the DOM (table, chart, KPIs).

This flow repeats for each CRUD operation (create, read, delete) and also applies to users (`niqo.users`), categories (`niqo.categories`), and session (`niqo.session`).

---

## Data Model

All data is stored in `localStorage` as JSON. Here are the main structures observed in the code:

### Session (`niqo.session`)
```json
{
  "username": "john_doe",
  "currency": "EUR",
  "guest": false
}
```

### Utilisateur (`niqo.users`)
```json
[
  {
    "username": "john_doe",
    "passwordHash": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
    "currency": "EUR",
    "createdAt": 1699564800000
  }
]
```

### Transaction (`transactions_<username>`)
```json
[
  {
    "type": "expense",
    "amount": "45.50",
    "date": "2024-11-09",
    "category": "Food",
    "note": "Groceries"
  },
  {
    "type": "income",
    "amount": "2500.00",
    "date": "2024-11-01",
    "category": "Salary",
    "note": ""
  }
]
```

### Catégorie personnalisée (`niqo.categories`)
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Streaming",
    "type": "expense"
  }
]
```

The `localStorage` keys use a `niqo.` prefix to avoid collisions with other applications. Transactions are isolated per user (`transactions_<username>` or `transactions_guest`).

---

## Algorithms & Data Structures

### Sorting and Filtering

- **Month filtering** (`dashboard.js` line 30-34): Uses `Array.prototype.filter()` to extract current month transactions by comparing `getMonth()` and `getFullYear()`. Complexity: **O(n)** where n = total number of transactions.
- **Reverse chronological sort** (`dashboard.js` line 52): `[...monthlyTx].reverse().slice(0, 5)` to display the 5 most recent transactions. Complexity: **O(n)** for copy and reverse, **O(1)** for slice.

### Aggregations

- **Sum by type** (`dashboard.js` line 36-38): `Array.prototype.reduce()` to calculate total income and expenses. Complexity: **O(n)**.
- **Grouping by category** (`dashboard.js` line 82-87): `forEach` loop to aggregate expenses by category into an `expenseData` object. Complexity: **O(n)**.

### Deduplication

- **Unique categories** (`transactions.js` line 22-31, `categories.js` line 63-72): Uses a `Set` to avoid duplicates when merging default and custom categories. Normalization with `.normalize('NFKC').trim().toLowerCase()`. Complexity: **O(m)** where m = number of categories.

### Cryptographic Hashing

- **SHA-256** (`auth.js` line 33-38): Uses `crypto.subtle.digest()` to hash passwords before storage. Asynchronous, returns a promise. Complexity: **O(k)** where k = password length (negligible).

### UUID Generation

- **UUID v4** (`categories.js` line 14): `crypto.randomUUID()` if available, otherwise fallback to `Date.now() + Math.random()`. Complexity: **O(1)**.

---

## Security & Privacy

### Implemented Measures

- **Password hashing**: Passwords are never stored in plain text. Uses SHA-256 via Web Crypto API (`auth.js` line 33-38, 103, 151).
- **Input validation**: Verification of minimum username length (≥3 characters) and password (≥6 characters) client-side (`auth.js` line 135-142).
- **No backend**: All data remains in the user's browser. No HTTP requests to third-party servers (except Chart.js CDN).
- **ARIA attributes**: `role="alert"` and `aria-live="polite"` for error messages (`index.html` line 29, 65), `aria-current="page"` for navigation (`transactions.html` line 45).

### Limitations

- **No advanced XSS protection**: Code uses `innerHTML` to inject dynamic content (`dashboard.js` line 65-73, `transactions.js` line 59-66). Data comes from user-controlled `localStorage`, but explicit HTML validation/escaping would be more robust.
- **SHA-256 only**: No salting or key derivation function (PBKDF2, bcrypt). An attacker with access to `localStorage` could attempt dictionary attacks.
- **No HTTPS required**: Application can be served over local HTTP. For public deployment, HTTPS is essential.
- **No data encryption**: Transactions are stored in plain text in `localStorage`. Physical device access allows reading the data.

---

## Accessibility & Internationalization

### Accessibility

- **Semantic labels**: All form fields use `<label>` with `<span class="form-label">` (`transactions.html` line 62, 70, 75, 80, 85).
- **Keyboard navigation**: Buttons and links are keyboard accessible (no negative `tabindex`).
- **ARIA error messages**: `role="alert"` and `aria-live="polite"` to announce errors to screen readers.
- **Contrast**: Colors defined in `:root` (`style.css` line 4-12) with sufficient contrast (text `#1d1e20` on background `#fff`).

### Internationalization (i18n)

- **Multi-currency**: Support for EUR, USD, GBP with automatic formatting via `Intl.NumberFormat` (`dashboard.js` line 11-18, `transactions.js` line 34-37).
- **No multilingual translation**: Interface is in English only (hardcoded texts in HTML). Comments in `logout.js` are in French (line 6, 14, 18, 24), but this doesn't affect the UI.
- **Date formatting**: Uses `toLocaleString('en', ...)` to display months in English (`dashboard.js` line 23-25).

---

## Performance & Error Handling

### Performance

- **Deferred loading**: Scripts loaded with `defer` (`dashboard.html` line 8-10) to avoid blocking HTML rendering.
- **No pagination**: All transactions are loaded in memory. For large volumes (>1000 transactions), this could slow rendering. The transaction list in `transactions.html` uses a scrollable container (`max-height: 480px`, line 15) to limit visible DOM.
- **Chart.js via CDN**: Loaded from `cdn.jsdelivr.net` (`dashboard.html` line 11). Risk of latency if CDN is slow.

### Error Handling

- **Try/catch for JSON.parse**: All `localStorage` reads are protected by `try/catch` with fallback (`auth.js` line 42-46, `dashboard.js` line 6-8, `transactions.js` line 17, `categories.js` line 19-22, `settings.js` line 15).
- **Form validation**: `required` attributes on HTML fields (`index.html` line 20, 25, 47, 52, 57) and JS checks (`auth.js` line 90-93, 131-142).
- **User messages**: Display of error/success messages in the DOM (`auth.js` line 20-31, `settings.js` line 35-39).
- **No server logs**: No logging or monitoring system (normal for client-only app).

---

## Installation & Execution

### Prerequisites

- Modern browser supporting ES6+, Web Crypto API, `localStorage` (Chrome 60+, Firefox 55+, Safari 11+, Edge 79+).
- Internet connection to load Chart.js from CDN (only on first load, then browser cache).

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Spartcuce-X-X/Niqo-Budget.git
   cd Niqo-Budget
   ```

2. **Open the application**:
   - Double-click `views/index.html` to open in default browser.
   - **OR** use a local HTTP server to avoid CORS restrictions (optional but recommended):
     ```bash
     # With Python 3
     python3 -m http.server 8000
     # Then open http://localhost:8000/views/index.html
     ```

3. **Create an account or use guest mode**:
   - Click "Create an account", enter a username (≥3 characters), password (≥6 characters), and currency.
   - **OR** click "Continue as guest" to test without registration.

4. **Navigate the application**:
   - **Dashboard**: Overview of current month.
   - **Transactions**: Add/delete transactions.
   - **Categories**: Manage custom categories.
   - **Settings**: Modify profile or reset data.

### No Build Scripts

The application is vanilla JavaScript, no compilation or bundling required. All files are ready to use.

---

## File Inventory

### HTML (`/views/`)

- **`index.html`**: Authentication page (login/register). Contains two forms (login and register) with JS toggle, and a "Continue as guest" button.
- **`dashboard.html`**: Main dashboard. Displays 3 KPI cards (balance, income, expenses), a Chart.js doughnut chart, and the list of 5 most recent transactions.
- **`transactions.html`**: Transaction management. Add form (type, amount, date, category, note) and scrollable table of all transactions with delete button.
- **`categories.html`**: Category management. Displays default categories (non-editable) and allows adding/deleting custom categories.
- **`settings.html`**: User settings. Form to modify name and currency, button for complete local data reset.

### JavaScript (`/js/`)

- **`auth.js`** (201 lines): Handles registration, login, guest mode, and SHA-256 password hashing. Stores users in `niqo.users` and session in `niqo.session`.
- **`dashboard.js`** (139 lines): Loads current month transactions, calculates KPIs (balance, income, expenses), displays 5 most recent transactions and generates a doughnut chart of expenses by category.
- **`transactions.js`** (130 lines): Transaction CRUD. Loads categories (default + custom), populates `<select>`, adds/deletes transactions, and updates table.
- **`categories.js`** (134 lines): Displays default and custom categories. Allows adding new categories (with deduplication) and deleting custom categories.
- **`settings.js`** (140 lines): Handles profile modification (name, currency), theme (dark/light/auto, though not used in current views), and complete data reset.
- **`logout.js`** (32 lines): Removes session (`niqo.session`) and redirects to `index.html` when "Log out" button is clicked.

### CSS (`/css/`)

- **`style.css`** (424 lines): Single stylesheet. Defines CSS variables (colors, radii, shadows), flex layout with fixed sidebar, components (cards, forms, tables, badges), and responsive styles. Uses radial gradients for background, drop shadows for cards, and modern design with rounded corners.

### Other

- **`NIQO_Budget_Cahier_des_Charges.pages`**: Specifications document (Apple Pages format, not read by code).
- **`/assets/`**: Folder for icons and images (empty or unused in current code).

---

## Design Choices & Trade-offs

### Pure Client-Side

**Choice**: No backend, everything in vanilla JavaScript.  
**Reason**: Deployment simplicity (simple static HTTP server suffices), total privacy (data never sent to server), and learning web fundamentals without frameworks.  
**Trade-off**: Limits multi-device sync and cloud backup. A backend would be needed for these features.

### localStorage vs IndexedDB

**Choice**: `localStorage` for all data.  
**Reason**: Simple synchronous API, sufficient for moderate volumes (<5MB). No need for complex asynchronous queries.  
**Trade-off**: `localStorage` has a ~5-10MB limit depending on browsers. For thousands of transactions, IndexedDB would be more suitable.

### Vanilla JS vs Framework

**Choice**: No React, Vue, or Angular.  
**Reason**: Educational project to master DOM, events, and native APIs. No heavy dependencies.  
**Trade-off**: More verbose code (manual DOM manipulation), no automatic reactivity. A framework would simplify state management.

### SHA-256 Without Salting

**Choice**: Simple SHA-256 password hashing.  
**Reason**: Native Web Crypto API, no external dependency. Sufficient for local app without server.  
**Trade-off**: Vulnerable to dictionary attacks if attacker accesses `localStorage`. A real backend would use bcrypt or Argon2 with salting.

### Chart.js via CDN

**Choice**: Load Chart.js from CDN rather than hosting locally.  
**Reason**: Reduces repository size, benefits from shared browser cache.  
**Trade-off**: Dependency on third-party service (risk of outage or latency). Local version would guarantee offline availability.

---

## Limitations & Future Improvements

### Current Limitations

- **No multi-device sync**: Data is isolated per browser. Cannot share between computer and mobile.
- **No export/import**: No functionality to export transactions to CSV/JSON or import from file.
- **No advanced charts**: Only a doughnut chart of expenses is available. No time evolution curves, no month-to-month comparison.
- **No budget forecasting**: Application doesn't allow setting spending goals per category.
- **No notifications**: No reminders to enter transactions or alerts for budget overruns.
- **No advanced search/filters**: Cannot filter transactions by period, category, or amount in Transactions view.
- **Dark/light theme non-functional**: `settings.js` code contains theme logic (line 41-48, 77-88), but no view currently uses it.

### Improvement Ideas

1. **Optional backend**: Add REST API (Node.js + MongoDB) to sync data between devices, with JWT authentication.
2. **CSV/JSON export**: Button in Settings to download all transactions in CSV or JSON format.
3. **Evolution charts**: Chart.js curves showing balance, income, and expense evolution over 6 or 12 months.
4. **Budgets per category**: Define maximum amount per category and display progress bar.
5. **Search and filters**: Text search fields, filters by date (range), type (income/expense), category.
6. **PWA (Progressive Web App)**: Add `manifest.json` and Service Worker to install app on mobile and work offline.
7. **Unit tests**: Add Jest or Mocha to test calculation, validation, and storage functions.
8. **Internationalization**: JSON translation files (FR, EN, ES) and browser language detection.

---

## What I Applied from CS50

This project mobilizes several concepts taught in CS50:

### Data Structures

- **Arrays**: Storage of users, transactions, and categories in JavaScript arrays (`auth.js` line 43, 95, 144; `transactions.js` line 80, 110; `categories.js` line 22, 91).
- **Objects/Dictionaries**: Representation of entities (user, transaction, category) as JS objects with key/value pairs (`auth.js` line 152, `transactions.js` line 103-109, `categories.js` line 90).
- **Sets**: Category deduplication with `new Set()` (`transactions.js` line 25, `categories.js` implicit in normalization logic).

### Algorithms

- **Linear search**: `Array.prototype.find()` to search user by name (`auth.js` line 96), `Array.prototype.filter()` to filter transactions (`dashboard.js` line 31-34).
- **Sorting**: `Array.prototype.reverse()` to reverse chronological order (`dashboard.js` line 52).
- **Aggregation**: `Array.prototype.reduce()` to calculate sums (`dashboard.js` line 36-38).
- **Complexity**: Awareness of O(n) complexity for loops and filters, O(1) for key access in objects.

### Web (HTML/CSS/JS)

- **Semantic HTML**: Use of `<main>`, `<section>`, `<article>`, `<nav>`, `<label>` to structure content.
- **Modern CSS**: Custom properties (CSS variables), flexbox, grid, transitions, drop shadows.
- **JavaScript DOM**: DOM manipulation with `getElementById`, `createElement`, `appendChild`, `innerHTML`, event handling (`addEventListener`).
- **Forms**: HTML5 validation (`required`, `type="number"`, `type="date"`) and client-side JS validation.

### Local Persistence

- **localStorage API**: Persistent key-value storage in browser, JSON serialization/deserialization.
- **Session management**: Login state management with `niqo.session`, conditional redirection.

### Security

- **Cryptographic hashing**: Web Crypto API for SHA-256, principle of never storing passwords in plain text.
- **Input validation**: Length, format verification, duplicate prevention.

### Modularity

- **IIFE (Immediately Invoked Function Expressions)**: Each JS script is encapsulated in an IIFE to avoid global namespace pollution (`(function() { 'use strict'; ... })();`).
- **Separation of concerns**: One JS file per functionality (auth, dashboard, transactions, categories, settings, logout).

---

## AI Tools Disclosure (CS50 Compliance)

In accordance with CS50's policy on the use of artificial intelligence tools, I declare having used AI assistants (ChatGPT, Windsurf AI) for:

- **Brainstorming and planning**: Generating ideas for features, project structure, design choices.
- **Writing assistance**: Formulating this README, suggesting phrasings for code comments.
- **Occasional debugging**: Identifying bugs in filtering and validation functions.
- **Snippet generation**: Code examples for `Intl.NumberFormat`, `crypto.subtle.digest`, and Chart.js (adapted and integrated manually).

**The essence of the work remains personal**: I wrote all HTML/CSS/JS code, designed the application architecture, implemented sorting/filtering/aggregation algorithms, and tested all features. AI prompts served as guides, but every line of code was understood, modified, and validated by myself. No code was copy-pasted without understanding.

**Reused prompts**: The prompts used to generate this README and certain JS snippets are documented in the conversation history with the AI assistant and can be provided upon request for academic compliance.

---

**Thank you for reading this README. For any questions or suggestions, feel free to open an issue on GitHub.**
