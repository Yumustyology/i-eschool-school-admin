"use client"

import { useState } from "react"
import { MessageSquare, Send, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { sendTeamsMessage } from "@/hooks/useApi"

export default function TeamsIntegrationPage() {
  const [webhookUrl, setWebhookUrl] = useState("")
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSendMessage = async () => {
    if (!webhookUrl || !message) {
      toast({
        title: "Error",
        description: "Please fill in both webhook URL and message",
        variant: "destructive",
      })
      return
    }

    setError(null)
    setSuccess(null)
    setIsSending(true)

    const result = await sendTeamsMessage(webhookUrl, message)

    if (result.success) {
      setSuccess("Message sent to Microsoft Teams successfully!")
      setMessage("")
      toast({
        title: "Success",
        description: "Message sent to Microsoft Teams",
      })
    } else {
      setError(result.error || "Failed to send message")
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    }

    setIsSending(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Teams Integration</h2>
        <p className="mt-2 text-muted-foreground">Send notifications to Microsoft Teams</p>
      </div>

      {error && (
        <Alert className="border-destructive/50 bg-destructive/5">
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500/50 bg-green-500/5">
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Send Test Message</CardTitle>
          <CardDescription>Configure Teams webhook and send a test notification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Teams Webhook URL</Label>
            <Input
              id="webhook-url"
              type="url"
              placeholder="https://outlook.office.com/webhook/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Get this URL from Microsoft Teams connector settings</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your message to send to Teams..."
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">This message will be sent as a Teams notification</p>
          </div>

          <Button
            onClick={handleSendMessage}
            disabled={isSending || !webhookUrl || !message}
            className="gap-2"
            size="lg"
          >
            {isSending && <Loader2 className="h-4 w-4 animate-spin" />}
            <Send className="h-4 w-4" />
            {isSending ? "Sending..." : "Send Test Message to Teams"}
          </Button>

          <Alert className="border-muted">
            <MessageSquare className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              <strong className="font-semibold text-foreground">How to use:</strong>
              <div className="mt-2 space-y-2 text-muted-foreground">
                <ol className="ml-4 list-decimal space-y-1">
                  <li>Open Microsoft Teams</li>
                  <li>Go to a channel and click "..." (More options)</li>
                  <li>Select "Connectors" → "Incoming Webhook"</li>
                  <li>Create a new webhook and copy the URL</li>
                  <li>Paste it above and send a test message</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Example Teams Message Format</CardTitle>
          <CardDescription>Reference for the Teams API message structure</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="rounded-lg bg-muted p-4 text-xs overflow-x-auto">
            <code>{`{
  "@type": "MessageCard",
  "@context": "https://schema.org/extensions",
  "summary": "i-eSchool Notification",
  "themeColor": "5B7FFF",
  "title": "i-eSchool Admin Panel",
  "sections": [
    {
      "activityTitle": "New Notification",
      "text": "Your message content here..."
    }
  ]
}`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
