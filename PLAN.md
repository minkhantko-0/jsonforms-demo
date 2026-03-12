# Plan: Forms CRUD + New FormWorkflowMapping (jsonforms-demo server)

## Goal

Implement **Forms CRUD** and a **new mapping model** for `dynamic-workflow` without changing existing legacy `form_mappings` behavior.

Workflow CRUD remains out of scope (workflow list comes from `poc-workflow-engine`).

---

## Confirmed Decisions

- Keep existing `form_mappings` table/routes as-is (legacy compatibility).
- Add a new table: `form_workflow_mappings` for `dynamic-workflow`.
- IDs can follow current style (auto-increment int).
- No auth for now.
- No seed data required.

---

## Compatibility Summary

### Workflow source (`poc-workflow-engine`)

`GET /api/v1/workflows` returns summary list with:

- `key: string`
- `name: string`

This matches `dynamic-workflow` mapping page workflow dropdown.

### `dynamic-workflow` contract to support

- Forms API:
  - `GET /api/forms`
  - `GET /api/forms/:id`
  - `POST /api/forms`
  - `PUT /api/forms/:id`
  - `DELETE /api/forms/:id`
- Mapping API expected by UI services:
  - `GET /api/form-mappings`
  - `GET /api/form-mappings/:id`
  - `POST /api/form-mappings`
  - `PUT /api/form-mappings/:id`
  - `DELETE /api/form-mappings/:id`
- Mapping payload/shape:
  - `{ id, formKey, workflowKey, status? }`

---

## Revised Implementation Plan

### Phase 1 — Data model updates (server)

1. Add `forms` table

- `id`, `name`, `key` (unique), `schema`, `uiSchema`, `createdAt`, `updatedAt`

2. Add **new** `form_workflow_mappings` table

- `id`
- `formKey` (required)
- `workflowKey` (required)
- `status` (`active|inactive`, default `active`)
- `createdAt`, `updatedAt`
- unique composite index: (`formKey`, `workflowKey`)

3. Keep existing `form_mappings` table untouched.

### Phase 2 — API routes and handlers

1. Create forms handlers in `routes/forms.ts`

- List, detail, create, update, delete
- Validation: required `name`, `key`, `schema`
- Duplicate `key` rejection

2. Introduce new handlers for the new table (recommended file: `routes/formWorkflowMappings.ts`)

- Implement the same route contract used by `dynamic-workflow`:
  - `/api/form-mappings` and `/api/form-mappings/:id`
- Internally read/write from `form_workflow_mappings`
- Keep legacy handlers/file for old `form_mappings` available under a separate route namespace if needed (e.g. `/api/legacy/form-mappings`)

3. Response shape

- List/detail/create/update: `{ success: true, data: ... }`
- Delete: `{ success: true, message: ... }`
- Errors: clear `400/404/409/500` with message

### Phase 3 — Route wiring in server entrypoint

1. Register forms routes in server index.
2. Point `/api/form-mappings*` routes to new `form_workflow_mappings` handlers.
3. Preserve legacy mapping routes under a non-conflicting path.

### Phase 4 — Dynamic-workflow integration check

1. Form Builder should save/load via `/api/forms`.
2. Mappings page should create/list/delete via `/api/form-mappings`.
3. Workflow dropdown remains from `poc-workflow-engine` (`key`, `name`).

### Phase 5 — Verification checklist

1. Forms

- Create form
- Update form
- List forms
- Delete form

2. FormWorkflowMappings

- Create `{ formKey, workflowKey, status }`
- List mappings
- Update status
- Delete mapping
- Duplicate mapping rejected

3. Backward compatibility

- Existing legacy `form_mappings` path/behavior still functional.

---

## Deliverables

- New db schema/migration for `forms` and `form_workflow_mappings`.
- New/updated handlers and route registration.
- `dynamic-workflow` compatible APIs without breaking existing `form_mappings`.
- E2E verified flow from UI: create form → map to workflow key.
