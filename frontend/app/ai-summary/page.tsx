"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { mockClasses } from "@/lib/mock-data"

export default function AISummaryPage() {
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [summary, setSummary] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateSummary = async () => {
    if (!selectedClass) return

    setIsGenerating(true)

    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const mockSummary = `Attendance summary for ${selectedClass} on ${selectedDate}:

• Overall attendance: 87% (26 out of 30 students present)
• Students absent: Amina Hassan, Yusuf Ahmed, Fatima Ali, Omar Ibrahim
• Attendance trend: +5% compared to last week
• Notable: This is the highest attendance rate this month

Recommendations:
- Follow up with absent students
- Consider rewarding the class for improved attendance
- Continue current engagement strategies`

    setSummary(mockSummary)
    setIsGenerating(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">AI Summary</h2>
        <p className="mt-2 text-muted-foreground">Generate AI-powered attendance insights</p>
      </div>

      <Alert className="border-accent/50 bg-accent/10">
        <Sparkles className="h-4 w-4 text-accent" />
        <AlertDescription>
          <span className="font-semibold text-foreground">Note:</span>
          <span className="text-muted-foreground">
            {" "}
            In the real system, this will call an AI backend (e.g., Azure OpenAI or OpenAI API) to generate personalized
            summaries based on actual attendance data, student performance, and historical trends.
          </span>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Generate Summary</CardTitle>
          <CardDescription>Select class and date to generate AI-powered insights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ai-class-select">Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger id="ai-class-select">
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {mockClasses.map((classItem) => (
                    <SelectItem key={classItem.id} value={classItem.name}>
                      {classItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ai-date-select">Date</Label>
              <input
                id="ai-date-select"
                type="date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleGenerateSummary} disabled={!selectedClass || isGenerating} className="gap-2" size="lg">
            <Sparkles className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate AI Summary"}
          </Button>

          {summary && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI-Generated Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm text-foreground">{summary}</div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
