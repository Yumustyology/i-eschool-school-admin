import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { webhookUrl, message } = await request.json()

    // Validate inputs
    if (!webhookUrl || !message) {
      return NextResponse.json(
        { error: "Webhook URL and message are required" },
        { status: 400 }
      )
    }

    // Validate webhook URL format
    if (!webhookUrl.includes("webhook.office.com")) {
      return NextResponse.json(
        { error: "Invalid Microsoft Teams webhook URL" },
        { status: 400 }
      )
    }

    // Prepare Teams message card (adaptive card format)
    const teamsMessage = {
      "@type": "MessageCard",
      "@context": "https://schema.org/extensions",
      summary: "i-eSchool Notification",
      themeColor: "5B7FFF",
      title: "i-eSchool Admin Panel",
      sections: [
        {
          activityTitle: "New Notification",
          activitySubtitle: new Date().toLocaleString(),
          text: message,
        },
      ],
    }

    // Send to Teams
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(teamsMessage),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Teams API error:", errorText)
      throw new Error("Failed to send message to Teams")
    }

    return NextResponse.json({
      success: true,
      message: "Message sent to Microsoft Teams successfully",
    })
  } catch (error) {
    console.error("Error sending to Teams:", error)
    return NextResponse.json(
      {
        error: "Failed to send message to Teams",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
