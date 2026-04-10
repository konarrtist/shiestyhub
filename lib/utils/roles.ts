export type UserRole = "super_admin" | "escrow" | "user"

function getEnvRoles() {
  const superAdminUsernames = (process.env.SUPER_ADMIN_USERNAMES || process.env.NEXT_PUBLIC_SUPER_ADMIN_USERNAMES || "")
    .split(",")
    .map((u) => u.trim().toLowerCase())
    .filter(Boolean)
  const escrowUsernames = (process.env.ESCROW_USERNAMES || process.env.NEXT_PUBLIC_ESCROW_USERNAMES || "")
    .split(",")
    .map((u) => u.trim().toLowerCase())
    .filter(Boolean)

  return { superAdminUsernames, escrowUsernames }
}

export function deriveRole(profile: { role?: string | null; username?: string | null }): UserRole {
  const { superAdminUsernames, escrowUsernames } = getEnvRoles()
  const normalizedUsername = profile.username?.toLowerCase().trim()

  if (profile.role === "super_admin" || (normalizedUsername && superAdminUsernames.includes(normalizedUsername))) {
    return "super_admin"
  }

  if (profile.role === "escrow" || (normalizedUsername && escrowUsernames.includes(normalizedUsername))) {
    return "escrow"
  }

  return "user"
}

export function deriveRoleClient(username: string): UserRole {
  const superAdminUsernames = (process.env.NEXT_PUBLIC_SUPER_ADMIN_USERNAMES || "")
    .split(",")
    .map((u) => u.trim().toLowerCase())
    .filter(Boolean)
  const escrowUsernames = (process.env.NEXT_PUBLIC_ESCROW_USERNAMES || "")
    .split(",")
    .map((u) => u.trim().toLowerCase())
    .filter(Boolean)

  const normalizedUsername = username.toLowerCase().trim()

  if (superAdminUsernames.includes(normalizedUsername)) {
    return "super_admin"
  }

  if (escrowUsernames.includes(normalizedUsername)) {
    return "escrow"
  }

  return "user"
}
