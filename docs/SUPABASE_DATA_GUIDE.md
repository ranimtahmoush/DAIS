# Supabase Data Guide

The app reads Supabase directly from the browser. Tables used by the frontend must have row-level security policies that permit safe public `select` access. Do not expose service-role credentials in this repository.

Outcome indicators are not hard-coded in the UI. If no formula-ready Supabase rows are available, the outcome page displays an empty state.

## Dashboard Counts

The dashboard reads sector counts from:

```text
indicators
```

The app selects indicator rows in pages and groups them by `sector`. Sector labels are normalized before counting, then matched against `sectorPresentation` in `app.js`.

For best results:

- Keep `indicators.sector` values aligned with the labels in `sectorPresentation`.
- Add any new sector label to `sectorPresentation`.
- Add a matching icon file in `assets/icons/`.

## Outcome Tables

Formula-driven outcome indicators read from:

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

## Required Indicator Fields

Each backend-loaded outcome indicator needs:

```text
indicators.indicator_id
indicators.uid
indicators.name
indicators.unit
indicators.formula_python_expr
```

Recommended fields:

```text
indicators.definition
indicators.theme
indicators.sector
indicators.frequency
indicators.formula_description
```

`formula_python_expr` must be non-empty and must compile in the browser formula parser. `uid` is used as the stable UI id when present.

## Required Variable Setup

For each indicator:

1. Create rows in `variables`.
2. Link the variables to the indicator in `indicator_variables`.
3. Add values in `variable_values` for every geography and period that should calculate.

The UI considers a geography/period context complete only when all linked variables have at least one value for that same geography and period.

## Variable Keys And Formulas

Formula variable names must match `variables.variable_key`.

Example:

```text
variables.variable_key = total_students
variables.variable_key = public_schools
variables.variable_key = average_capacity
indicators.formula_python_expr = total_students / (public_schools * average_capacity) * 100
```

Supported operators:

```text
+ - * / ( ) ,
```

Supported functions:

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

The parser also accepts formulas with an assignment prefix and uses the expression after the first `=`.

Example:

```text
school_capacity_pressure = total_students / (public_schools * average_capacity) * 100
```

## Geography And Period Contexts

`variable_values` and `indicator_values` are joined to:

```text
geographies.geography_id
periods.period_id
```

The UI displays geography names from `geographies.geography_name` and comparison levels from `geographies.geography_level`.

Period labels are formatted from:

```text
periods.frequency_code
periods.period_year
periods.period_quarter
periods.period_month
```

Keep period rows consistent so filter labels remain readable.

## Source File Versions

Each variable value may point to a source file version:

```text
variable_values.version_id -> source_file_versions.version_id
```

When several rows exist for the same `variable_id`, `geography_id`, and `period_id`, the UI chooses the row whose source version has:

```text
source_file_versions.is_current = true
```

Other rows for the same variable/context are shown as alternate sources under the primary value.

Readable source metadata comes from:

```text
source_file_versions.version_no
source_file_versions.file_uri
source_file_versions.reference_period
```

If `file_uri` starts with `http`, `https`, `blob:`, `data:`, or `/`, it becomes a link. Plain filenames are shown as text.

## Stored Indicator Values

`indicator_values` is optional for display. When a stored indicator value exists for the same indicator/geography/period, the app keeps it as `storedValue`, but the visible result is still calculated from linked variables.

Use `indicator_values` for comparison, auditing, or future validation flows. Do not rely on it as the only source of a formula-driven frontend result.

## Troubleshooting

Indicator does not appear:

- Confirm `formula_python_expr` is not null or empty.
- Confirm `indicator_variables` has at least one linked variable.
- Confirm every linked `variable_id` exists in `variables`.
- Confirm at least one complete geography/period context exists in `variable_values`.

Result shows `Pending`:

- Confirm every formula token matches a `variables.variable_key`.
- Confirm every required variable value is numeric.
- Confirm the formula only uses supported operators and functions.
- Confirm there is no division by an empty, missing, or non-numeric value.

Source link does not open:

- Confirm `source_file_versions.file_uri` is a full URL or app-root path.
- Use a signed URL or backend endpoint for private files.
- Do not expose Supabase service-role credentials in the browser.

Sector count looks wrong:

- Confirm `indicators.sector` is populated.
- Confirm the sector label matches `sectorPresentation`.
- Check whether a new sector is falling into the `Other` group.
