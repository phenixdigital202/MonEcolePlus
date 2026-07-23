"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, Search, Menu, GraduationCap, Users, BookOpen, Shield, Loader2, Check, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSidebar } from "@/hooks/use-sidebar"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { searchGlobalAction, getNotificationsAction } from "@/lib/header-actions"
import { Badge } from "@/components/ui/badge"

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  onMenuToggle?: () => void
  children?: React.ReactNode
}

export function DashboardHeader({ title, subtitle, onMenuToggle, children }: DashboardHeaderProps) {
  const { setOpen } = useSidebar()
  const router = useRouter()

  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<{ users: any[], classes: any[] }>({ users: [], classes: [] })
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [loadingNotifications, setLoadingNotifications] = useState(false)

  // Fetch real notifications on mount
  useEffect(() => {
    async function loadNotifications() {
      setLoadingNotifications(true)
      const res = await getNotificationsAction()
      if (res.success && res.data) {
        setNotifications(res.data)
      }
      setLoadingNotifications(false)
    }
    loadNotifications()
  }, [])

  // Live search handler
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults({ users: [], classes: [] })
      setShowSearchResults(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      const res = await searchGlobalAction(searchQuery)
      if (res.success && res.data) {
        setSearchResults(res.data)
        setShowSearchResults(true)
      }
      setIsSearching(false)
    }, 250)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin": return "Admin"
      case "teacher": return "Enseignant"
      case "student": return "Élève"
      case "parent": return "Parent"
      default: return role
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-rose-500/10 text-rose-600 border-rose-200"
      case "teacher": return "bg-purple-500/10 text-purple-600 border-purple-200"
      case "student": return "bg-blue-500/10 text-blue-600 border-blue-200"
      default: return "bg-emerald-500/10 text-emerald-600 border-emerald-200"
    }
  }

  const handleResultClick = (type: "user" | "class", item: any) => {
    setShowSearchResults(false)
    setSearchQuery("")
    if (type === "class") {
      router.push(`/dashboard/classes/${item.id}`)
    } else {
      if (item.role === "student") router.push(`/dashboard/admin/students?q=${encodeURIComponent(item.nom)}`)
      else if (item.role === "teacher") router.push(`/dashboard/admin/teachers?q=${encodeURIComponent(item.nom)}`)
      else if (item.role === "parent") router.push(`/dashboard/admin/parents?q=${encodeURIComponent(item.nom)}`)
      else router.push(`/dashboard/admin/users?q=${encodeURIComponent(item.nom)}`)
    }
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

      {/* Mobile Logo */}
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

      {/* Global Interactive Search */}
      <div ref={searchRef} className="hidden md:flex relative max-w-sm">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher élève, prof, classe..."
            className="pl-9 pr-8 w-full rounded-xl border-slate-200 focus:border-primary text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchResults.users.length > 0 || searchResults.classes.length > 0) {
                setShowSearchResults(true)
              }
            }}
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && (
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-popover shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-3 border-b border-border bg-slate-50/50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Résultats de recherche</span>
              <span className="text-[10px] text-slate-400 font-medium">
                {searchResults.users.length + searchResults.classes.length} résultat(s)
              </span>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 space-y-3">
              {/* Classes matching */}
              {searchResults.classes.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-2 mb-1">Classes</p>
                  {searchResults.classes.map(c => (
                    <div
                      key={c.id}
                      onClick={() => handleResultClick("class", c)}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100/70 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                          <BookOpen className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{c.nom}</p>
                          <p className="text-[10px] text-slate-500">{c.niveau}</p>
                        </div>
                      </div>
                      <ExternalLink className="h-3 w-3 text-slate-400" />
                    </div>
                  ))}
                </div>
              )}

              {/* Users matching */}
              {searchResults.users.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider px-2 mb-1">Utilisateurs</p>
                  {searchResults.users.map(u => (
                    <div
                      key={u.id}
                      onClick={() => handleResultClick("user", u)}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100/70 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                          {u.nom ? u.nom[0].toUpperCase() : "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{u.nom}</p>
                          <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-[9px] px-1.5 py-0 rounded-md font-bold ${getRoleBadgeColor(u.role)}`}>
                        {getRoleLabel(u.role)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.users.length === 0 && searchResults.classes.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400 italic">
                  Aucun résultat correspondant à &quot;{searchQuery}&quot;.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notifications Icon & Popover */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl hover:bg-slate-100"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <Bell className="h-5 w-5 text-slate-700" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-in zoom-in duration-300 shadow-sm">
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
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-popover shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-popover-foreground">Notifications</h3>
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="bg-rose-500/10 text-rose-600 text-[10px] font-bold rounded-full">
                      {unreadCount} nouvelle(s)
                    </Badge>
                  )}
                </div>
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-primary h-7 px-2 hover:bg-primary/10 rounded-lg"
                    onClick={markAllAsRead}
                  >
                    Tout marquer comme lu
                  </Button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {loadingNotifications ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                    Chargement des notifications...
                  </div>
                ) : notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`relative px-4 py-3 hover:bg-muted/50 cursor-pointer border-b border-border last:border-0 transition-colors ${!notification.read ? 'bg-primary/5' : ''}`}
                      onClick={() => {
                        markAsRead(notification.id)
                        if (notification.link) {
                          setShowNotifications(false)
                          router.push(notification.link)
                        }
                      }}
                    >
                      {!notification.read && (
                        <span className="absolute left-2 top-4 h-2 w-2 rounded-full bg-primary" />
                      )}
                      <p className={`text-xs md:text-sm ${!notification.read ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        {notification.time}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-12 text-center">
                    <Bell className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-medium">Aucune notification pour le moment.</p>
                  </div>
                )}
              </div>

              <div className="px-4 py-2.5 border-t border-border bg-slate-50/50 text-center">
                <Link href="/dashboard/messages" onClick={() => setShowNotifications(false)}>
                  <Button variant="ghost" size="sm" className="w-full text-xs font-bold text-primary hover:bg-primary/5 rounded-xl h-8">
                    Voir la messagerie
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
