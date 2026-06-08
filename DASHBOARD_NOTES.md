# Rahal Dashboard Notes

## Phase 1 Scope

- Admin and vendor authentication use `/api/admin/login` and `/api/vendor/login`.
- Admin user management targets `/api/explorer`, `/api/vendor`, and `/api/admin`.
- Place management targets `/api/place`, `/api/placecategory`, and `/api/placephoto`.
- Hard-delete UI is intentionally not implemented.

## Backend Follow-Ups

- `SearchController.SearchPlaces` appears to call the user search service instead of the places search service.
- `DELETE /api/{role}/permanent/{id}` currently allows permanent deletion only when the target id equals the current user id.
- User update endpoints include `{id}` in the route, but the dashboard also submits `Id` in multipart form data because the service reads the DTO id.
