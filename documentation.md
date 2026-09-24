# Developer LaunchPad — Architecture & Walkthrough

This document explains how the app is built, what each file does, and how
data flows through it — so anyone on the team can pick it up.

---

## 1. The big picture

Developer LaunchPad is a **single-page Angular app**. There is no backend in
this version — all the repo data lives in one TypeScript file
(`repos.data.ts`) and is held in memory while the page is open. Refreshing
the page resets everything back to that seed data (edits/deletes don't
persist — see §7 for how to change that).

The app is built the modern Angular way:
- **Standalone components** — no `NgModule` files. Each component declares
  its own imports.
- **Signals** — Angular's reactive primitive (`signal()`, `computed()`,
  `input()`, `output()`) instead of older patterns like `@Input`/`@Output`
  decorators or `BehaviorSubject`. A signal is just "a value that the
  template automatically re-renders around when it changes."

### Component tree

```
AppComponent                              (the whole page: header, search, grid)
├─ RepoCardComponent  × N                 (one card per service)
│   └─ LinkActionComponent  × 3           (QA link / Repo link / Website — each is its own copy+open popover)
├─ AppsettingsModalComponent               (the popup — only exists while a settings file is open)
└─ ToastComponent                          (the small "Copied!" bubble)
```

Data flows **down** the tree as inputs (`repo`, `fileType`, etc.) and
**events flow up** as outputs (`copied`, `openAppSettings`, `saved`,
`deleted`). This is standard Angular/React-style one-way data flow: a child
component never reaches up and changes its parent directly — it emits an
event and the parent (usually `AppComponent`) decides what to do.

---

## 2. File-by-file explanation

### Project setup files (you won't usually touch these)

| File | Purpose |
|---|---|
| `package.json` | Lists dependencies (`@angular/core`, `@angular/animations`, etc.) and the `npm start` / `npm run build` scripts. |
| `angular.json` | Tells the Angular CLI how to build/serve the app — entry files, output folder, budgets. |
| `tsconfig.json` / `tsconfig.app.json` | TypeScript compiler settings (strict mode is on, which is why every input/output is explicitly typed). |
| `.gitignore` | Keeps `node_modules/` and build output out of git. |
| `src/index.html` | The one real HTML page the browser loads. Loads Google Fonts (Manrope for UI text, JetBrains Mono for code/links) and contains `<app-root>`, which Angular replaces with the whole app. |
| `src/main.ts` | The entry point — tells Angular "start `AppComponent` here." |
| `src/app/app.config.ts` | App-wide providers (currently empty — this is where you'd register `HttpClient`, routing, etc. later). |
| `src/styles.css` | **Design tokens** — every color, font, radius and shadow used anywhere in the app is defined once here as a CSS variable (e.g. `--color-primary`, `--radius-md`). Change a value here and it updates everywhere. This is how we keep the look consistent without repeating hex codes in every component. |

### Data & types

| File | Purpose |
|---|---|
| `src/app/models/repo.model.ts` | The **shape** of a repo/service: `id`, `name`, `description`, `team`, `qaLink`, `repoLink`, `websiteLink`, `appSettings` (prod file content), `appSettingsDevelopment` (dev file content). Also defines `SettingsFileType = 'production' \| 'development'`, a small type used to tell components which of the two settings files is currently active. |
| `src/app/data/repos.data.ts` | The seed data — one object per service (`InvoiceService`, `PaymentGateway`, etc.), matching the shape above. **This is the file to replace with a real API call** when you're ready (see §7). |

### `AppComponent` — the shell

**Files:** `app.component.ts` / `.html` / `.css`

This is the root of the app and owns all the shared state:

- `repos` — signal holding the array of all repos. Whenever this changes,
  every card and the modal re-render automatically.
- `query` — the text typed into the search box.
- `filteredRepos` — a **computed signal**: automatically recalculates
  (filtering by name/team) whenever `repos` or `query` changes. You never
  manually call a "filter" function — Angular reruns it for you.
- `activeRepoId` / `activeFileType` — which repo's modal is open, and
  whether it's showing `appsettings.json` or `appsettings.development.json`.
  `null` means "no modal open."
- `activeRepo` — computed signal that looks up the actual repo object from
  `activeRepoId`. The modal only renders `@if (activeRepo(); as repo)` —
  i.e. it doesn't exist in the DOM at all until a repo is selected.
- `toastMessage` — text for the small confirmation bubble; auto-clears
  itself after ~2.2 seconds via `setTimeout`.

Key methods:
- `openAppSettings(event)` — called when a card's settings chip is clicked;
  sets which repo + which file to show.
- `saveAppSettings(update)` — called when the modal's Save button is
  clicked; writes the edited text back into the right field
  (`appSettings` or `appSettingsDevelopment`) of the matching repo.
- `deleteRepo(id)` — removes that repo from the `repos` array entirely and
  closes the modal.

### `RepoCardComponent` — one service card

**Files:** `components/repo-card/repo-card.component.ts` / `.html` / `.css`

Receives one `repo` object (`input.required<Repo>()`) and renders:
- A colored badge with the service's initials (auto-derived from capital
  letters in the name — "InvoiceService" → "IS").
- Name, team, description.
- Three `<app-link-action>` chips: **QA link**, **Repo link**, **Website**.
- Two settings buttons: `appsettings.json` and
  `appsettings.development.json`. Clicking either calls
  `onOpenAppSettings('production' | 'development')`, which emits an
  `OpenSettingsEvent` (`{ repo, fileType }`) up to `AppComponent`.

The `index` input drives a small stagger delay so cards animate in one
after another on page load rather than all at once (see the `--stagger`
CSS variable in the card's `.css` file).

### `LinkActionComponent` — the reusable link chip

**Files:** `components/link-action/link-action.component.ts` / `.html` / `.css`

This one small component is reused three times per card (QA / Repo /
Website) — that's the point of pulling it into its own component instead of
copy-pasting the markup three times. It takes:
- `label` — text on the button ("QA link", "Website", …)
- `url` — the link itself
- `variant` — `'primary' | 'teal' | 'amber'`, purely a color choice so QA,
  Repo and Website chips are visually distinct at a glance.

Clicking it toggles a small popover (`open` signal) showing the full URL
plus two buttons:
- **Copy** → `navigator.clipboard.writeText(url)`, then emits `copied` with
  a message the parent shows as a toast.
- **Open in browser** → `window.open(url, '_blank')`, which opens a new tab.

It also closes itself automatically if you click anywhere else on the page
(`@HostListener('document:click', ...)`) or press Escape.

### `AppsettingsModalComponent` — the popup

**Files:** `components/appsettings-modal/appsettings-modal.component.ts` / `.html` / `.css`

Takes two inputs: `repo` and `fileType`. A `computed` signal (`fileName`)
turns `fileType` into the visible file name (`appsettings.json` vs
`appsettings.development.json`), and `currentContent()` picks the matching
field off the repo object. Whenever `repo` or `fileType` changes, an
`effect()` resets the local `draft` text and turns off edit mode — so
switching between the two files, or between repos, always opens a fresh,
correct view.

Buttons:
- **Copy** — copies whatever's currently in `draft` to the clipboard.
- **Edit** — switches the `<pre>` code view into an editable `<textarea>`,
  with Save/Cancel. Save emits `{ id, fileType, content }` so
  `AppComponent` knows exactly which repo *and* which of the two files to
  update.
- **Delete** — shows an inline confirmation panel first (never deletes on
  a single click); confirming emits `deleted` with the repo's `id`, and
  `AppComponent` removes that whole card.

Clicking the dark backdrop, or the × button, closes the modal
(`closed` output).

### `ToastComponent`

**Files:** `components/toast/toast.component.ts`

The smallest component — just renders a floating pill at the bottom of the
screen if `message()` is non-null, with a short fade/slide-in animation.
`AppComponent` is the only thing that sets the message; every "Copied",
"Saved", "Deleted" confirmation flows through `AppComponent.showToast()`.

---

## 3. How a click actually flows through the app (example)

**Scenario: a developer clicks "appsettings.development.json" on the
InvoiceService card, edits a value, and clicks Save.**

1. `RepoCardComponent.onOpenAppSettings('development')` runs → emits
   `openAppSettings` with `{ repo: InvoiceService, fileType: 'development' }`.
2. `AppComponent.openAppSettings(event)` sets `activeRepoId` to
   `'invoice-service'` and `activeFileType` to `'development'`.
3. Because `activeRepo` is a computed signal depending on `activeRepoId`,
   it now resolves to the InvoiceService object, so
   `@if (activeRepo(); as repo)` becomes true and
   `<app-appsettings-modal>` is created in the DOM.
4. The modal's `effect()` fires, setting `draft` to
   `InvoiceService.appSettingsDevelopment`, and computing `fileName()` as
   `"appsettings.development.json"`.
5. The developer clicks **Edit** → `editing` signal flips to `true`, the
   `<pre>` is swapped for a `<textarea>` bound to `draft`.
6. They type; every keystroke updates the `draft` signal.
7. They click **Save** → `saveEdit()` emits
   `{ id: 'invoice-service', fileType: 'development', content: draft() }`.
8. `AppComponent.saveAppSettings(update)` finds that repo in the `repos`
   array and replaces its `appSettingsDevelopment` field with the new text
   — using `fileType` to know it should touch the *development* field, not
   the production one.
9. Because `repos` is a signal and we just produced a new array
   (`list.map(...)`), Angular re-renders anything depending on it — the
   modal's `draft` resets via the `effect()`, and a toast confirms
   "appsettings.development.json saved".

---

## 4. Why two settings buttons and not a dropdown?

Both files are surfaced as separate, always-visible chips
(`appsettings.json` / `appsettings.development.json`) rather than hidden
behind a dropdown, so a developer can see at a glance which environments
have configs, and open either in one click instead of two. If more
environments are added later (staging, production-EU, etc.), the cleanest
next step is to turn `appSettings` / `appSettingsDevelopment` into a small
array (e.g. `configFiles: { fileType: string; fileName: string; content:
string }[]`) so the card can render a chip per entry instead of hardcoding
two fields — worth doing if a third file shows up.

---

## 5. Why signals instead of plain variables or RxJS?

- A plain class property (`repos = [...]`) wouldn't tell Angular when it
  changes, so the screen wouldn't update after an edit/delete without extra
  wiring.
- Signals give the same "auto re-render" behavior as older approaches
  (`Subject`/`BehaviorSubject` + `async` pipe) with much less boilerplate —
  no subscribing/unsubscribing, no memory-leak risk.
- `computed()` values (`filteredRepos`, `activeRepo`, `fileName`, etc.) are
  **derived automatically** — you never manually call a function to
  "refresh" the search results or the modal title; Angular tracks the
  dependency and reruns them for you.

---

## 6. Styling approach

All colors/fonts/spacing constants live in `src/styles.css` as CSS custom
properties (`--color-primary`, `--font-mono`, `--radius-lg`, etc.). Every
component's own `.css` file then just references those variables
(`color: var(--color-primary)`) instead of hardcoding hex values. This
means:
- The whole app can be re-themed by editing one file.
- Each component's CSS stays short and focused on *layout*, not color
  decisions.

Animations are deliberately minimal and purposeful:
- Cards fade/slide in once on page load, staggered slightly per card.
- Cards lift slightly and their shadow deepens on hover.
- Popovers and the modal fade/scale in when opened.
- The toast slides up from the bottom.

---

## 7. Next steps for the team

- **Connect real data:** replace the array in `repos.data.ts` with an
  Angular `HttpClient` call (e.g. to your service catalog / wiki API),
  assigned into `AppComponent.repos` on init, instead of the static import.
- **Persist edits/deletes:** right now `saveAppSettings` and `deleteRepo`
  only change the in-memory signal. Wire them to a real backend call if you
  want changes to survive a page refresh.
- **Auth:** if this becomes an internal tool beyond a demo, put it behind
  your SSO — there's no auth in this version.
- **More environments:** see §4 if a third config file (e.g. staging) is
  needed later.
