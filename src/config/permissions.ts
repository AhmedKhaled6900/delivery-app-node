export const ALL_PERMISSIONS = [
  'dashboard.view_stats',
  'clients.view',
  'deliveries.view',
  'deliveries.manage',
  'orders.view',
  'orders.assign',
  'orders.cancel',
  'roles.view',
  'roles.manage',
  'staff.view',
  'staff.manage',
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];

export interface PermissionMeta {
  key: Permission;
  label: string;
  labelAr: string;
  group: string;
}

export const PERMISSION_META: PermissionMeta[] = [
  { key: 'dashboard.view_stats', label: 'View dashboard stats', labelAr: 'عرض إحصائيات الداشبورد', group: 'dashboard' },
  { key: 'clients.view', label: 'View clients', labelAr: 'عرض العملاء', group: 'clients' },
  { key: 'deliveries.view', label: 'View delivery drivers', labelAr: 'عرض مندوبي التوصيل', group: 'deliveries' },
  { key: 'deliveries.manage', label: 'Manage delivery drivers', labelAr: 'إدارة مندوبي التوصيل', group: 'deliveries' },
  { key: 'orders.view', label: 'View orders', labelAr: 'عرض الطلبات', group: 'orders' },
  { key: 'orders.assign', label: 'Assign orders', labelAr: 'تعيين الطلبات', group: 'orders' },
  { key: 'orders.cancel', label: 'Cancel orders', labelAr: 'إلغاء الطلبات', group: 'orders' },
  { key: 'roles.view', label: 'View roles', labelAr: 'عرض الأدوار', group: 'roles' },
  { key: 'roles.manage', label: 'Manage roles', labelAr: 'إدارة الأدوار', group: 'roles' },
  { key: 'staff.view', label: 'View staff', labelAr: 'عرض الموظفين', group: 'staff' },
  { key: 'staff.manage', label: 'Manage staff', labelAr: 'إدارة الموظفين', group: 'staff' },
];

const permissionSet = new Set<string>(ALL_PERMISSIONS);

export function isValidPermission(value: string): value is Permission {
  return permissionSet.has(value);
}

export function assertPermissions(values: string[]): Permission[] {
  const invalid = values.filter((p) => !isValidPermission(p));
  if (invalid.length > 0) {
    throw new Error(`Invalid permissions: ${invalid.join(', ')}`);
  }
  return values as Permission[];
}
