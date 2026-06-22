import { Badge } from '@/shared/components/ui/badge';
import type { VendorProfileDto } from '@/features/vendors/types';

interface VendorSearchTableProps {
  vendors: VendorProfileDto[];
}

export function VendorSearchTable({ vendors }: VendorSearchTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-surface-low text-xs uppercase tracking-[0.14em] text-on-surface-variant">
          <tr>
            <th className="px-4 py-3 font-semibold">Vendor</th>
            <th className="px-4 py-3 font-semibold">Country</th>
            <th className="px-4 py-3 font-semibold">Address</th>
            <th className="px-4 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((vendor) => (
            <tr key={vendor.userId} className="border-t border-outline/40">
              <td className="px-4 py-3 align-middle">
                <p className="font-medium text-on-surface">{vendor.displayName}</p>
                <p className="text-xs text-on-surface-variant">{vendor.userId}</p>
              </td>
              <td className="px-4 py-3 align-middle">{vendor.countryCode}</td>
              <td className="px-4 py-3 align-middle">{vendor.address}</td>
              <td className="px-4 py-3 align-middle">
                <Badge className={vendor.isApproved ? 'bg-green-100 text-green-700' : ''}>
                  {vendor.isApproved ? 'Approved' : 'Pending'}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
