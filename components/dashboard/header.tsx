"use client"

import { useState } from "react"
import { Bell, Search, Menu, X, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSidebar } from "@/hooks/use-sidebar"
import Link from "next/link"

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  onMenuToggle?: () => void
  children?: React.ReactNode
}

export function DashboardHeader({ title, subtitle, onMenuToggle, children }: DashboardHeaderProps) {
  const { setOpen } = useSidebar()
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Nouveau message de M. Diallo", time: "Il y a 5 min", read: false },
    { id: 2, message: "3 absences à justifier", time: "Il y a 1h", read: false },
    { id: 3, message: "Bulletin de Classe 3A prêt", time: "Il y a 2h", read: false },
  ])
  const [showNotifications, setShowNotifications] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-6">
      {/* Mobile menu button */}
      <button
        className="lg:hidden -ml-2 p-2 rounded-md hover:bg-muted text-foreground"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Ouvrir le menu</span>
      </button>

      {/* Mobile Logo (visible only on very small screens) */}
      <div className="flex md:hidden lg:hidden">
         <GraduationCap className="h-6 w-6 text-primary" />
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-sm md:text-lg font-bold text-foreground truncate">{title}</h1>
        {subtitle && (
          <p className="text-[10px] md:text-xs text-muted-foreground truncate hidden sm:block">{subtitle}</p>
        )}
      </div>

      {/* Children Actions */}
      {children && (
        <div className="flex-shrink-0 flex items-center gap-1 md:gap-2 ml-auto">
          {children}
        </div>
      )}

      {/* Search */}
      <div className="hidden md:flex relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher..."
          className="pl-9 w-64"
        />
      </div>

      {/* Notifications */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center animate-in zoom-in duration-300">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>

        {showNotifications && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowNotifications(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-border bg-popover shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                <h3 className="font-bold text-sm text-popover-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-primary h-8 hover:bg-primary/10"
                    onClick={markAllAsRead}
                  >
                    Tout marquer comme lu
                  </Button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`relative px-4 py-3 hover:bg-muted/50 cursor-pointer border-b border-border last:border-0 transition-colors ${!notification.read ? 'bg-primary/5' : ''}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      {!notification.read && (
                        <span className="absolute left-2 top-4 h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                      <p className={`text-sm ${!notification.read ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                        <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                        {notification.time}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-12 text-center">
                    <Bell className="h-8 w-8 text-muted/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Aucune notification</p>
                  </div>
                )}
              </div>
              <div className="px-4 py-2 border-t border-border bg-muted/10">
                <Button variant="ghost" size="sm" className="w-full text-xs font-bold text-primary hover:bg-primary/5">
                  Voir toutes les notifications
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
