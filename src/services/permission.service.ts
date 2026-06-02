import type { Permission } from '../config/permissions';
import { ALL_PERMISSIONS } from '../config/permissions';
import type { IAdminDocument } from '../models/Admin';
import type { IDashboardRoleDocument } from '../models/DashboardRole';

export function isSuperAdmin(admin: Pick<IAdminDocument, 'role'>): boolean {
  return admin.role === 'super_admin';
}

export function resolvePermissions(
  admin: IAdminDocument,
  populatedRoles?: IDashboardRoleDocument[]
): Permission[] {
  if (isSuperAdmin(admin)) {
    return [...ALL_PERMISSIONS];
  }

  const roles =
    populatedRoles ??
    (admin.assignedRoles as unknown as IDashboardRoleDocument[] | undefined) ??
    [];

  const set = new Set<Permission>();
  for (const role of roles) {
    if (!role?.permissions) continue;
    for (const p of role.permissions) {
      set.add(p as Permission);
    }
  }
  return [...set];
}

export function hasPermission(admin: IAdminDocument, permission: Permission, permissions?: Permission[]): boolean {
  if (isSuperAdmin(admin)) return true;
  const resolved = permissions ?? resolvePermissions(admin);
  return resolved.includes(permission);
}

export function hasAnyPermission(
  admin: IAdminDocument,
  required: Permission[],
  permissions?: Permission[]
): boolean {
  if (isSuperAdmin(admin)) return true;
  const resolved = permissions ?? resolvePermissions(admin);
  return required.some((p) => resolved.includes(p));
}

export function toAdminProfile(
  admin: IAdminDocument,
  populatedRoles?: IDashboardRoleDocument[]
): Record<string, unknown> {
  const { password: _password, ...rest } = admin.toObject();
  const rolesData =
    populatedRoles ??
    (admin.assignedRoles?.length &&
    typeof admin.assignedRoles[0] === 'object' &&
    'permissions' in (admin.assignedRoles[0] as object)
      ? (admin.assignedRoles as unknown as IDashboardRoleDocument[])
      : undefined);
  const permissions = resolvePermissions(admin, rolesData);
  const roles = rolesData?.map((r) => ({
    _id: r._id,
    name: r.name,
    description: r.description,
    permissions: r.permissions,
  }));
  return { ...rest, permissions, roles };
}
