import { apiClient } from '@/shared/api/client';
import type { VendorCategoryDto } from '../types';

export function listVendorCategories() {
  return apiClient<VendorCategoryDto[]>({ method: 'GET', url: '/VendorCategory' });
}

export function getVendorCategoryById(id: string) {
  return apiClient<VendorCategoryDto>({ method: 'GET', url: `/VendorCategory/${id}` });
}

// Exact, case-sensitive match against CategoryName on the backend - "cafe"
// will not match "Cafe". encodeURIComponent guards names with spaces or other
// characters that aren't valid unescaped in a URL path segment.
export function getVendorCategoryByName(name: string) {
  return apiClient<VendorCategoryDto>({ method: 'GET', url: `/VendorCategory/name/${encodeURIComponent(name)}` });
}

// The backend binds this as [FromBody] string CategoryName, so the request
// body must be a raw JSON string literal (e.g. "Restaurant"), not an object
// like { categoryName: "Restaurant" } - the latter 400s. JSON.stringify and an
// explicit Content-Type avoid relying on axios's default body-serialization
// heuristics for a plain string value.
export function createVendorCategory(categoryName: string) {
  return apiClient<VendorCategoryDto>({
    method: 'POST',
    url: '/VendorCategory',
    data: JSON.stringify(categoryName),
    headers: { 'Content-Type': 'application/json' },
  });
}

// Same raw-JSON-string-body requirement as create. NOTE: as of this backend
// build, the controller action binds the route id into a parameter named
// `CategoryId`, but the route template is `{id}` - those names don't match,
// so ASP.NET Core never binds the id and this always fails with
// errorCode "AlreadyExists" regardless of which category/id is targeted.
// Verified directly against the live backend; not fixable from the frontend.
export function updateVendorCategory(id: string, categoryName: string) {
  return apiClient<string>({
    method: 'PUT',
    url: `/VendorCategory/${id}`,
    data: JSON.stringify(categoryName),
    headers: { 'Content-Type': 'application/json' },
  });
}

export function deleteVendorCategory(id: string) {
  return apiClient<string>({ method: 'DELETE', url: `/VendorCategory/${id}` });
}
