# App Maintenance Guide

This app is a static HTML/CSS/JS prototype. It has no build step, package install, or local backend. Runtime data comes from the Supabase client in `app.js`, with fallback demo outcome data kept in the same file.

## Runtime Flow

1. `index.html` loads the Supabase browser client from jsDelivr.
2. `index.html` loads `app.js`.
3. `app.js` creates the Supabase client using `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`.
4. Dashboard sector counts load from the `indicators` table.
5. Outcome indicators load from formula-ready rows in Supabase.
6. The UI renders dashboard cards, upload state, outcome cards, filters, and comparison tables from the in-memory `state` object.
7. Dashboard counts refresh every `AUTO_REFRESH_MS`.

If Supabase is unavailable or a query fails, the dashboard falls back to local sector definitions and the outcome page keeps local demo indicators.

## Main Files

`index.html`

- Owns the page structure, dialogs, tab panels, side panel, and Supabase/app script tags.
- Also contains the inline styling currently used by the browser page.

`styles.css`

- External copy of the styling.
- Keep this file in sync with the inline styles in `index.html` when changing visual design.

`app.js`

- Owns app state, Supabase reads, sector grouping, formula calculation, upload previews, modal behavior, and rendering.
- Contains fallback outcome data under `outcomeModel`.

`assets/icons/`

- Active sector icons.
- Icon names must match the sector icon slugs in `sectorPresentation`.

`assets/MPDA_Survey_Logo.png`

- Header logo used by the dashboard toolbar.

## UI State

The central `state` object in `app.js` tracks:

- selected dashboard targets
- active view and active outcome indicator
- Supabase sector counts
- local upload objects
- pending upload metadata
- panel collapse state
- outcome filter and comparison modes
- backend outcome load status

Rendering is intentionally direct. Most event handlers update `state`, then call `render()`.

## Upload Behavior

Uploads are local browser-session objects only.

- Accepted extensions: `pdf`, `xls`, `xlsx`, `doc`, `docx`, `ppt`, `pptx`.
- Each upload must include an entity/source name.
- Period is optional.
- PDFs can be previewed in the browser through an object URL.
- Office documents are listed with metadata but are not previewed.
- Uploaded files are not parsed and are not written back to Supabase.

When removing files, `revokeUpload()` releases object URLs so the browser does not keep unnecessary blob references.

## Outcome UI

The outcome page supports:

- indicator cards
- detail view for a single indicator
- location and period selection
- comparison by level and period
- variable source listings
- formula and result display

Backend indicators replace or extend fallback indicators when their `uid` matches an existing fallback indicator id. This allows a Supabase-backed version of a demo indicator to take over without changing the UI.

## Formula Calculation

Formula calculation happens in the browser:

1. `createFormulaInputs()` maps indicator variables by `variable_key`.
2. `getFormulaExpression()` strips any left-hand assignment before `=`.
3. `compileFormulaExpression()` accepts only numbers, variable keys, arithmetic operators, parentheses, commas, and whitelisted functions.
4. `calculateIndicatorValue()` evaluates the compiled expression and returns `null` if calculation fails.

Supported formula functions:

```text
abs
ceil
floor
greatest
least
max
min
round
```

Do not add arbitrary JavaScript formula support. Keep formulas constrained to numeric expressions and whitelisted functions.

## Common Edits

Add or rename a sector:

1. Update `sectorPresentation` in `app.js`.
2. Add a matching icon in `assets/icons/`.
3. Confirm Supabase `indicators.sector` values match the display label.

Change the Supabase project:

1. Update `SUPABASE_URL`.
2. Update `SUPABASE_PUBLISHABLE_KEY`.
3. Confirm RLS allows public `select` only on the frontend-read tables.

Change refresh behavior:

1. Update `AUTO_REFRESH_MS`.
2. Keep the interval long enough to avoid unnecessary Supabase traffic.

Change upload file support:

1. Update `allowedFileExtensions`.
2. Update `allowedMimeTypes`.
3. Update both file input `accept` attributes in `index.html`.
4. Update unsupported-file dialog copy if the supported family changes.

## Safety Notes

- Never put a Supabase service-role key in this frontend.
- Treat the publishable key as read-only and rely on RLS policies.
- Use signed URLs or a backend endpoint for private Supabase Storage files.
- Keep fallback data small enough that `app.js` remains easy to review.
