"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { logoutUser } from "@/lib/auth-actions"
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  Clock, 
  MessageSquare, 
  Folder, 
  BarChart3, 
  Settings,
  GraduationCap,
  Sparkles,
  LogOut,
  ChevronDown,
  Trophy,
  Zap,
  BookOpen,
  UserCheck,
  Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const navigationConfig = {
  admin: [
    { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
    { name: "Classes", href: "/dashboard/classes", icon: Users },
    { name: "Élèves", href: "/dashboard/admin/students", icon: GraduationCap },
    { name: "Enseignants", href: "/dashboard/admin/teachers", icon: BookOpen },
    { name: "Parents", href: "/dashboard/admin/parents", icon: UserCheck },
    { name: "Paiements", href: "/dashboard/admin/payments", icon: CreditCard },
    { 
      name: "Emplois du temps", 
      icon: Calendar,
      subItems: [
        { name: "Vue calendrier", href: "/dashboard/schedule" },
        { name: "Génération IA", href: "/dashboard/schedule/ai" },
        { name: "Drag & Drop", href: "/dashboard/schedule/edit" },
      ]
    },
    { 
      name: "Notes", 
      icon: FileText,
      subItems: [
        { name: "Saisie classique", href: "/dashboard/grades" },
        { name: "Evaluations & Devoirs", href: "/dashboard/grades/evaluations" },
        { name: "Saisie vocale 🎤", href: "/dashboard/grades/voice" },
        { name: "Tableau des notes", href: "/dashboard/grades/list" },
        { name: "Générer bulletin PDF", href: "/dashboard/grades/pdf" },
      ]
    },
    { 
      name: "Absences", 
      icon: Clock,
      subItems: [
        { name: "Marquer absence", href: "/dashboard/absences" },
        { name: "Statuts", href: "/dashboard/absences/status" },
        { name: "Alertes auto", href: "/dashboard/absences/alerts" },
      ]
    },
    { 
      name: "Documents", 
      icon: Folder,
      subItems: [
        { name: "Certificat", href: "/dashboard/documents/cert" },
        { name: "Bulletin", href: "/dashboard/documents/bulletin" },
        { name: "Téléchargement", href: "/dashboard/documents" },
      ]
    },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Gestion Utilisateurs", href: "/dashboard/admin/users", icon: Shield },
    { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  ],
  teacher: [
    { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
    { name: "Mes Classes", href: "/dashboard/classes", icon: Users },
    { name: "Emplois du temps", href: "/dashboard/schedule", icon: Calendar },
    { name: "Saisir Notes", href: "/dashboard/grades", icon: FileText },
    { name: "Appel / Absences", href: "/dashboard/absences", icon: Clock },
    { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  ],
  student: [
    { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
    { name: "Mes Notes", href: "/dashboard/grades", icon: FileText },
    { name: "Mon Emploi du temps", href: "/dashboard/schedule", icon: Calendar },
    { name: "Absences", href: "/dashboard/absences", icon: Clock },
    { name: "Documents", href: "/dashboard/documents", icon: Folder },
    { name: "Performance", href: "/dashboard/performance", icon: Trophy },
  ],
  parent: [
    { name: "Tableau de bord", href: "/dashboard/parent", icon: LayoutDashboard },
    { name: "Suivi Enfants", href: "/dashboard/parent", icon: Users },
    { name: "Notes & Bulletins", href: "/dashboard/grades", icon: FileText },
    { name: "Absences", href: "/dashboard/absences", icon: Clock },
    { name: "Messages École", href: "/dashboard/messages", icon: MessageSquare },
  ],
}

const secondaryNavigation = [
  { 
    name: "Paramètres", 
    icon: Settings,
    subItems: [
      { name: "Mon Profil", href: "/dashboard/settings" },
      { name: "Mon Établissement", href: "/dashboard/settings/school" },
    ]
  },
]

interface DashboardSidebarProps {
  userRole?: "admin" | "teacher" | "parent" | "student"
  userName?: string
  schoolName?: string
  userPoints?: number
  userLevel?: number
}

export function DashboardSidebar({ 
  userRole = "admin", 
  userName = "Utilisateur",
  schoolName = "Mon École",
  userPoints = 0,
  userLevel = 1
}: DashboardSidebarProps) {
  const pathname = usePathname()
  const navigation = navigationConfig[userRole] || navigationConfig.admin

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-sidebar border-r border-sidebar-border h-full">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
          <GraduationCap className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        <span className="text-lg font-semibold text-sidebar-foreground">
          MonÉcole<span className="text-sidebar-primary">+</span>
        </span>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        <button className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-accent transition-colors">
          <div className="h-9 w-9 rounded-full bg-sidebar-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-sidebar-primary">
              {userName?.split(" ").map(n => n[0]).join("")}
            </span>
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{userName}</p>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-muted-foreground truncate">{schoolName}</p>
              {userRole === 'student' && (
                <div className="flex items-center gap-1 bg-primary/10 px-1.5 py-0.5 rounded text-primary text-[8px] font-black uppercase tracking-tighter">
                   <Zap className="h-2 w-2" />
                   Niv. {userLevel}
                </div>
              )}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            
            if (item.subItems) {
              const isSubItemActive = item.subItems.some(sub => pathname === sub.href)
              return (
                <Collapsible key={item.name} defaultOpen={isSubItemActive} className="space-y-1">
                  <CollapsibleTrigger asChild>
                    <button
                      className={cn(
                        "w-full flex items-center justify-between gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </div>
                      <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 ml-9">
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className={cn(
                          "block px-3 py-1.5 text-sm rounded-md transition-colors",
                          pathname === sub.href
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "text-sidebar-primary")} />
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* AI Section - Only for Staff/Admin */}
        {(userRole === 'admin' || userRole === 'teacher') && (
          <div className="mt-6">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Intelligence Artificielle
            </p>
            <Link
              href="/dashboard/ai-insights"
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                pathname === "/dashboard/ai-insights"
                  ? "bg-sidebar-primary/10 text-sidebar-primary" 
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Sparkles className={cn("h-5 w-5", pathname === "/dashboard/ai-insights" && "text-sidebar-primary")} />
              Insights IA
            </Link>
          </div>
        )}

        {/* Secondary Navigation */}
        <div className="mt-6">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Compte
          </p>
          {secondaryNavigation.map((item) => {
            const isActive = pathname === item.href
            
            if (item.subItems) {
              const isSubItemActive = item.subItems.some(sub => pathname === sub.href)
              return (
                <Collapsible key={item.name} defaultOpen={isSubItemActive} className="space-y-1">
                  <CollapsibleTrigger asChild>
                    <button
                      className={cn(
                        "w-full flex items-center justify-between gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </div>
                      <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 ml-9">
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className={cn(
                          "block px-3 py-1.5 text-sm rounded-md transition-colors",
                          pathname === sub.href
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-sidebar-border">
        <form action={logoutUser}>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" type="submit">
            <LogOut className="h-5 w-5 mr-3" />
            Déconnexion
          </Button>
        </form>
      </div>
    </aside>
  )
}
