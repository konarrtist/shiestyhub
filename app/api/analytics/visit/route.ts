import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const webhookUrl = process.env.DISCORD_VISIT_WEBHOOK_URL

    if (!webhookUrl) {
      return NextResponse.json({ success: false, error: "Webhook not configured" }, { status: 200 })
    }

    const body = await request.json()
    const headersList = await headers()

    // Get visitor information
    const userAgent = headersList.get("user-agent") || "Unknown"
    const referer = headersList.get("referer") || "Direct"
    const ip = headersList.get("x-forwarded-for")?.split(",")[0] || headersList.get("x-real-ip") || "Unknown"

    // Parse user agent for browser/device info
    const browserInfo = parseUserAgent(userAgent)

    // Get location from IP (using a free API)
    let location = "Unknown"
    try {
      if (ip !== "Unknown" && ip !== "127.0.0.1" && ip !== "::1") {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=country,city,regionName`, {
          signal: AbortSignal.timeout(2000),
        })
        if (geoRes.ok) {
          const geo = await geoRes.json()
          if (geo.city && geo.country) {
            location = `${geo.city}, ${geo.regionName}, ${geo.country}`
          }
        }
      }
    } catch {
      // Ignore geo lookup errors
    }

    // Create Discord embed
    const embed = {
      embeds: [
        {
          title: "🌐 New Website Visit",
          color: 0x00d4ff, // Cyan color
          fields: [
            {
              name: "📍 Page",
              value: body.page || "/",
              inline: true,
            },
            {
              name: "🔗 Referrer",
              value: referer === "Direct" ? "Direct Visit" : referer.substring(0, 100),
              inline: true,
            },
            {
              name: "🌍 Location",
              value: location,
              inline: true,
            },
            {
              name: "💻 Browser",
              value: browserInfo.browser,
              inline: true,
            },
            {
              name: "📱 Device",
              value: browserInfo.device,
              inline: true,
            },
            {
              name: "🖥️ OS",
              value: browserInfo.os,
              inline: true,
            },
            {
              name: "👤 User",
              value: body.userId ? `<@${body.userId}>` : "Anonymous",
              inline: true,
            },
            {
              name: "🆔 Session",
              value: body.sessionId?.substring(0, 8) || "N/A",
              inline: true,
            },
          ],
          footer: {
            text: "shiesty Analytics",
            icon_url: "https://shiesty.top/icon-dark-32x32.png",
          },
          timestamp: new Date().toISOString(),
        },
      ],
    }

    // Send to Discord webhook
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(embed),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Visit tracking error:", error)
    return NextResponse.json({ success: false }, { status: 200 })
  }
}

function parseUserAgent(ua: string) {
  let browser = "Unknown"
  let device = "Desktop"
  let os = "Unknown"

  // Browser detection
  if (ua.includes("Firefox")) browser = "Firefox"
  else if (ua.includes("Edg")) browser = "Edge"
  else if (ua.includes("Chrome")) browser = "Chrome"
  else if (ua.includes("Safari")) browser = "Safari"
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera"

  // Device detection
  if (ua.includes("Mobile")) device = "Mobile"
  else if (ua.includes("Tablet") || ua.includes("iPad")) device = "Tablet"

  // OS detection
  if (ua.includes("Windows")) os = "Windows"
  else if (ua.includes("Mac")) os = "macOS"
  else if (ua.includes("Linux")) os = "Linux"
  else if (ua.includes("Android")) os = "Android"
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS"

  return { browser, device, os }
}
