"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { logoutUser } from "@/lib/auth-actions"
import { 
  Building2, 
  Users, 
  CreditCard, 
  Settings, 
  Server, 
  Activity, 
  Shield, 
  LogOut,
  Crown,
  Database,
  Mail,
  MessageSquare,
  TicketCheck
} from "lucide-react"

interface SuperAdminLayoutProps {
  children: React.ReactNode
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const pathname = usePathname()

  const navItems = [
    { name: "SaaS Dashboard", href: "/super-admin", icon: Activity },
    { name: "Gestion Écoles", href: "#", icon: Building2 },
    { name: "Abonnements", href: "#", icon: CreditCard },
    { name: "Monitoring Système", href: "#", icon: Server },
    { name: "Sécurité & Rôles", href: "#", icon: Shield },
    { name: "Portail WhatsApp", href: "#", icon: MessageSquare },
    { name: "Portail Email", href: "#", icon: Mail },
    { name: "Tickets Support", href: "#", icon: TicketCheck },
    { name: "Sauvegardes Globales", href: "#", icon: Database },
    { name: "Configuration", href: "#", icon: Settings },
  ]

  const handleLogout = async () => {
    await logoutUser()
    window.location.href = "/login"
  }

  return (
    <div className="flex h-screen bg-[#09090b] text-[#f4f4f5] overflow-hidden">
      {/* Platform Sidebar */}
      <aside className="w-64 border-r border-[#27272a] bg-[#18181b] flex flex-col shrink-0">
        <div className="p-6 border-b border-[#27272a] flex items-center gap-2">
          <Crown className="h-6 w-6 text-[#6366f1]" />
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            MonÉcole+ Platform
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive 
                    ? "bg-[#27272a] text-white font-semibold" 
                    : "text-[#a1a1aa] hover:bg-[#27272a]/50 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-[#27272a]">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-left"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#09090b]">
        <header className="h-16 border-b border-[#27272a] flex items-center justify-between px-8 bg-[#0f0f12]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              Phénix Digital CI
            </span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  )
}
