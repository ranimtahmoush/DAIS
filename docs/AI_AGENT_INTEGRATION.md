# AI Agent Integration Guide

This UI expects the upload/AI pipeline to create database source file versions and variable values, then return source version ids to the browser session.

## Frontend Event

When a user attaches a file, `app.js` dispatches:

```js
window.addEventListener("dais:upload-created", async (event) => {
  const {
    uploadId,
    file,
    fileName,
    extension,
    entityName,
    period,
    targets
  } = event.detail;
});
```

`file` is the browser `File` object. `targets` contains the selected dashboard sector/category assignments.

## Required AI Pipeline Work

For each upload:

1. Store or process the file outside the static frontend.
2. Create a row in `source_file_versions`.
3. Extract indicator variables from the file.
4. Insert extracted values into `variable_values` with the returned `source_file_versions.version_id`.
5. Call the UI integration API with that version id.

The UI derives visible indicators from the existing DB relationship:

```text
source_file_versions.version_id
-> variable_values.version_id
-> variable_values.variable_id
-> indicator_variables.variable_id
-> indicator_variables.indicator_id
-> indicators.indicator_id
```

## Frontend Callback

After database writes are complete, call:

```js
await window.daisUploadIntegration.setSourceVersionIds(
  uploadId,
  [versionId],
  `source version: ${versionId}`
);
```

For multiple source versions:

```js
await window.daisUploadIntegration.setSourceVersionIds(
  uploadId,
  [versionIdA, versionIdB],
  "source versions linked"
);
```

This updates the upload row, reloads backend outcomes, and filters Outcome cards to indicators whose variables came from those source versions.

## Inspect Uploads

The pipeline can inspect current session uploads:

```js
const uploads = window.daisUploadIntegration.getUploads();
```

Each upload object includes:

```js
{
  id,
  name,
  entityName,
  period,
  targets,
  sourceVersionIds,
  integrationStatus,
  integrationMessage
}
```

## Security

Do not write production DB rows directly from the browser. Use a backend or Supabase Edge Function with protected credentials and validation. The frontend publishable key should remain read-oriented.
