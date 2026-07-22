# DAIS UI

Static prototype for the DAIS indicator dashboard and outcome model.

## What This App Does

- Shows dashboard sectors and indicator counts from Supabase.
- Lets users select sectors and attach upload files in the browser session.
- Shows calculated outcome indicators.
- Reads outcome indicator values from Supabase when rows are available.
- Falls back to local demo outcome data in `app.js` when Supabase rows are not available.
- Calculates outcome results from variable values by geography and period.

## Run Locally

Use VS Code Live Server or any static file server.

Typical local URL:

```text
http://127.0.0.1:5500/index.html
```

There is no build step and no package install needed.

## Project Structure

```text
index.html
  Main page markup. Also contains the inline CSS copy currently used by the page.

styles.css
  External copy of the same styling. Keep it in sync with index.html if editing styles.

app.js
  Main application logic, local fallback data, Supabase loading, outcome calculations,
  filters, comparison table rendering, upload preview behavior, and dashboard rendering.

assets/icons/
  Active sector icons used by the dashboard.

assets/icons-original/
  Original icon backup.

assets/icons-before-ai-grid/
  Previous icon backup before the updated icon pass.

scripts/
  Helper PowerShell scripts used for icon extraction and cleanup.
```

## Supabase Tables Used

Dashboard counts read from:

```text
indicators
```

Outcome calculations read from:

```text
indicators
indicator_variables
variables
variable_values
indicator_values
geographies
periods
source_file_versions
```

## Outcome Calculation Flow

1. `app.js` loads the fallback outcome model.
2. The app requests matching indicator rows from Supabase.
3. If Supabase rows are readable, they replace the matching fallback indicator.
4. The UI builds variable inputs by `variable_key`.
5. The result is calculated in the browser from `variable_values`.
6. The selected location/period view shows the variables, formula, assumptions, and result.
7. The comparison view filters by one or more levels and one or more periods.

## Variable Source File Versions

Each variable value points to a file version through:

```text
variable_values.version_id -> source_file_versions.version_id
```

For the same `variable_id`, `geography_id`, and `period_id`, the UI treats the row whose file version has `source_file_versions.is_current = true` as the main displayed value. Other rows for the same variable/geography/period are shown underneath as alternate source file versions with:

```text
source_file_versions.file_uri
variable_values.value
variables.unit
```

If `file_uri` is a URL or app path, the file name becomes a clickable link. If `file_uri` is only a plain filename, it is shown as source text but cannot open the file. For private Supabase Storage files, use a backend endpoint or signed URL flow instead of exposing service-role credentials in the frontend.

## Adding A Backend-Loaded Indicator

1. Add the indicator row in Supabase `indicators`.
2. Add required variables in `variables`.
3. Link them in `indicator_variables`.
4. Add geography and period rows.
5. Add actual numbers in `variable_values`.
6. Add the indicator `uid` to `OUTCOME_INDICATOR_UIDS` in `app.js`.
7. Add calculation logic in `calculateIndicatorValue()` if the formula is new.

## Notes For Collaborators

- The current app is intentionally plain HTML/CSS/JS.
- The upload UI previews files locally, but it does not yet parse uploaded files into Supabase.
- Supabase RLS policies must allow public `select` for the frontend tables used by the outcome page.
- Keep the public Supabase key treated as read-only. Do not add service-role keys to this frontend.
