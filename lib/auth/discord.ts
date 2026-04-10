export const DISCORD_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || "",
  redirectUri: process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI || "",
  scopes: ["identify", "email"].join(" "),
}

export function getDiscordAuthUrl() {
  const params = new URLSearchParams({
    client_id: DISCORD_CONFIG.clientId,
    redirect_uri: DISCORD_CONFIG.redirectUri,
    response_type: "code",
    scope: DISCORD_CONFIG.scopes,
  })

  return `https://discord.com/api/oauth2/authorize?${params.toString()}`
}
