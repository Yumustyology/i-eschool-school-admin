import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
}

export function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
            {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
          </div>
          <div className="rounded-full bg-primary/10 p-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
