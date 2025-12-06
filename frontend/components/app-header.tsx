'use client';

import { User, LogOut } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext"

export function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="fixed left-64 right-0 top-0 z-30 h-16 border-b border-border bg-card">
      <div className="flex h-full items-center justify-between px-8">
        <h1 className="text-xl font-semibold text-foreground">i-eSchool Admin Panel</h1>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{user?.name || 'Admin'}</span>
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  <p className="text-xs leading-none text-muted-foreground capitalize">Role: {user?.role}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
