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
  Shield,
  CreditCard,
  Mail,
  Database,
  FileSpreadsheet,
  Crown
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
    { name: "Comptabilité ERP", href: "/dashboard/admin/compta", icon: CreditCard },
    { name: "Gestion Examens", href: "/dashboard/admin/examens", icon: Trophy },
    { name: "Bibliothèque", href: "/dashboard/bibliotheque", icon: BookOpen },
    { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
    { name: "Centre de Comm 📣", href: "/dashboard/admin/communication", icon: MessageSquare },
    { name: "Portail Emails", href: "/dashboard/admin/emails", icon: Mail },
    { name: "Portail WhatsApp", href: "/dashboard/admin/whatsapp", icon: MessageSquare },
    { name: "Sauvegardes DB", href: "/dashboard/admin/backups", icon: Database },
    { name: "Import / Export", href: "/dashboard/admin/import-export", icon: FileSpreadsheet },
  ],
  teacher: [
    { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
    { name: "Mes Classes", href: "/dashboard/classes", icon: Users },
    { name: "Emplois du temps", href: "/dashboard/schedule", icon: Calendar },
    { name: "Saisir Notes", href: "/dashboard/grades", icon: FileText },
    { name: "Appel / Absences", href: "/dashboard/absences", icon: Clock },
    { name: "Bibliothèque", href: "/dashboard/bibliotheque", icon: BookOpen },
    { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  ],
  student: [
    { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
    { name: "Mes Notes", href: "/dashboard/grades", icon: FileText },
    { name: "Mon Emploi du temps", href: "/dashboard/schedule", icon: Calendar },
    { name: "Absences", href: "/dashboard/absences", icon: Clock },
    { name: "Documents", href: "/dashboard/documents", icon: Folder },
    { name: "Bibliothèque", href: "/dashboard/bibliotheque", icon: BookOpen },
    { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
    { name: "Performance", href: "/dashboard/performance", icon: Trophy },
  ],
  parent: [
    { name: "Tableau de bord", href: "/dashboard/parent", icon: LayoutDashboard },
    { name: "Suivi Enfants", href: "/dashboard/parent", icon: Users },
    { name: "Notes & Bulletins", href: "/dashboard/grades", icon: FileText },
    { name: "Absences", href: "/dashboard/absences", icon: Clock },
    { name: "Bibliothèque", href: "/dashboard/bibliotheque", icon: BookOpen },
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
    <aside className="fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-white/85 backdrop-blur-xl border-r border-slate-200/80 text-slate-700 h-full shadow-xl shadow-slate-200/40">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-6 border-b border-slate-100/90">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/25 transition-transform duration-300 hover:scale-110 hover:rotate-3">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-black tracking-tight text-slate-900">
          MonÉcole<span className="text-blue-600 font-black">+</span>
        </span>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/60 to-white">
        <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-300">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-200 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-blue-600">
              {userName?.split(" ").map(n => n[0]).join("")}
            </span>
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-medium text-slate-500 truncate">{schoolName}</p>
              {userRole === 'student' && (
                <div className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 px-1.5 py-0.5 rounded-md text-white text-[8px] font-black uppercase tracking-tighter shadow-sm">
                   <Zap className="h-2 w-2" />
                   Niv. {userLevel}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
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
                        "w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200 text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 group"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4.5 w-4.5 group-hover:scale-110 transition-transform duration-200 text-slate-500 group-hover:text-blue-600" />
                        {item.name}
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 ml-9">
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className={cn(
                          "block px-3.5 py-2 text-xs rounded-lg transition-all duration-200 font-medium",
                          pathname === sub.href
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/20"
                            : "text-slate-500 hover:bg-indigo-50/60 hover:text-indigo-700"
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
                  "flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200",
                  isActive 
                    ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/25 scale-[1.02]" 
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 group"
                )}
              >
                <item.icon className={cn("h-4.5 w-4.5 transition-all duration-300 group-hover:scale-110", isActive ? "text-white" : "text-slate-500 group-hover:text-blue-600")} />
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* AI Section - Only for Staff/Admin */}
        {(userRole === 'admin' || userRole === 'teacher') && (
          <div className="space-y-2">
            <p className="px-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Intelligence Artificielle
            </p>
            <Link
              href="/dashboard/ai-insights"
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200",
                pathname === "/dashboard/ai-insights"
                  ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/25 scale-[1.02]" 
                  : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 group"
              )}
            >
              <Sparkles className={cn("h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-110", pathname === "/dashboard/ai-insights" ? "text-white" : "text-amber-500 group-hover:text-amber-600")} />
              Insights IA
            </Link>
          </div>
        )}

        {/* Secondary Navigation */}
        <div className="space-y-2">
          <p className="px-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
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
                        "w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200 text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 group"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4.5 w-4.5 group-hover:scale-110 transition-transform duration-200 text-slate-500 group-hover:text-blue-600" />
                        {item.name}
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 ml-9">
                    {item.subItems.map((sub) => {
                      const targetHref = (sub.href === "/dashboard/settings/school" && userRole === "admin") 
                        ? "/dashboard/admin/school" 
                        : sub.href
                      return (
                        <Link
                          key={sub.name}
                          href={targetHref}
                          className={cn(
                            "block px-3.5 py-2 text-xs rounded-lg transition-all duration-200 font-medium",
                            pathname === targetHref
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/20"
                              : "text-slate-500 hover:bg-indigo-50/60 hover:text-indigo-700"
                          )}
                        >
                          {sub.name}
                        </Link>
                      )
                    })}
                  </CollapsibleContent>
                </Collapsible>
              )
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200",
                  isActive 
                    ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/25 scale-[1.02]" 
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 group"
                )}
              >
                <item.icon className="h-4.5 w-4.5 text-slate-500 group-hover:text-blue-600" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-slate-100">
        <form action={logoutUser}>
          <Button variant="ghost" className="w-full justify-start text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-xl font-semibold text-xs" type="submit">
            <LogOut className="h-4.5 w-4.5 mr-3 transition-transform duration-200" />
            Déconnexion
          </Button>
        </form>
      </div>
    </aside>
  )
}
