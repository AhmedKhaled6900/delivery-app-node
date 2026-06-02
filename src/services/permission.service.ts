import type { Permission } from '../config/permissions';
import { ALL_PERMISSIONS } from '../config/permissions';
import type { IAdminDocument } from '../models/Admin';
import type { IDashboardRoleDocument } from '../models/DashboardRole';

/** super_admin or legacy admin account before RBAC migration */
export function hasFullAccess(admin: Pick<IAdminDocument, 'role'>): boolean {
  return admin.role === 'super_admin' || admin.role === 'admin';
}

export function isSuperAdmin(admin: Pick<IAdminDocument, 'role'>): boolean {
  return admin.role === 'super_admin';
}

function isPopulatedRole(role: unknown): role is IDashboardRoleDocument {
  return (
    typeof role === 'object' &&
    role !== null &&
    'permissions' in role &&
    Array.isArray((role as IDashboardRoleDocument).permissions)
  );
}

function getPopulatedRoles(admin: IAdminDocument): IDashboardRoleDocument[] {
  if (!admin.assignedRoles?.length) return [];
  return admin.assignedRoles.filter(isPopulatedRole) as unknown as IDashboardRoleDocument[];
}

export function resolvePermissions(
  admin: IAdminDocument,
  populatedRoles?: IDashboardRoleDocument[]
): Permission[] {
  if (hasFullAccess(admin)) {
    return [...ALL_PERMISSIONS];
  }

  const roles = populatedRoles ?? getPopulatedRoles(admin);
  const set = new Set<Permission>();
  for (const role of roles) {
    for (const p of role.permissions) {
      set.add(p as Permission);
    }
  }
  return [...set];
}

export function hasPermission(
  admin: IAdminDocument,
  permission: Permission,
  permissions?: Permission[]
): boolean {
  if (hasFullAccess(admin)) return true;
  const resolved = permissions ?? resolvePermissions(admin);
  return resolved.includes(permission);
}

export function hasAnyPermission(
  admin: IAdminDocument,
  required: Permission[],
  permissions?: Permission[]
): boolean {
  if (hasFullAccess(admin)) return true;
  const resolved = permissions ?? resolvePermissions(admin);
  return required.some((p) => resolved.includes(p));
}

export function toAdminProfile(admin: IAdminDocument): Record<string, unknown> {
  const rolesData = getPopulatedRoles(admin);
  const permissions = resolvePermissions(admin, rolesData);

  return {
    _id: admin._id,
    name: admin.name,
    phone: admin.phone,
    email: admin.email,
    countryCode: admin.countryCode,
    role: admin.role,
    isActive: admin.isActive,
    phoneVerified: admin.phoneVerified,
    emailVerified: admin.emailVerified,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
    permissions,
    roles: rolesData.map((r) => ({
      _id: r._id,
      name: r.name,
      description: r.description,
      permissions: r.permissions,
    })),
  };
}
