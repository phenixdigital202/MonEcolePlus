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
    { name: "Comptabilité ERP", href: "/dashboard/admin/compta", icon: CreditCard },
    { name: "Gestion Examens", href: "/dashboard/admin/examens", icon: Trophy },
    { name: "Bibliothèque", href: "/dashboard/bibliotheque", icon: BookOpen },
    { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
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
    <aside className="fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-slate-900 border-r border-slate-800 text-slate-300 h-full shadow-2xl">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-6 border-b border-slate-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-600 shadow-lg shadow-primary/20">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-black tracking-tight text-white">
          MonÉcole<span className="text-primary font-black">+</span>
        </span>
      </div>

      {/* User Info */}
      <div className="px-4 py-5 border-b border-slate-800 bg-slate-950/20">
        <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-slate-800/40 border border-slate-800/50 hover:bg-slate-800/80 transition-all duration-300">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-indigo-500/20 border border-primary/30 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary">
              {userName?.split(" ").map(n => n[0]).join("")}
            </span>
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-bold text-white truncate">{userName}</p>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-slate-400 truncate">{schoolName}</p>
              {userRole === 'student' && (
                <div className="flex items-center gap-1 bg-gradient-to-r from-primary to-indigo-500 px-1.5 py-0.5 rounded-md text-white text-[8px] font-black uppercase tracking-tighter">
                   <Zap className="h-2 w-2" />
                   Niv. {userLevel}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
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
                        "w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200 text-slate-400 hover:bg-slate-800/50 hover:text-white group"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4.5 w-4.5 group-hover:scale-110 transition-transform duration-200" />
                        {item.name}
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 ml-9">
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className={cn(
                          "block px-3.5 py-2 text-xs rounded-lg transition-all duration-200",
                          pathname === sub.href
                            ? "bg-primary text-white font-bold shadow-md shadow-primary/20"
                            : "text-slate-400 hover:bg-slate-800/30 hover:text-white"
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
                    ? "bg-gradient-to-r from-primary to-indigo-600 text-white font-bold shadow-lg shadow-primary/10" 
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white group"
                )}
              >
                <item.icon className={cn("h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* AI Section - Only for Staff/Admin */}
        {(userRole === 'admin' || userRole === 'teacher') && (
          <div className="space-y-2">
            <p className="px-3.5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
              Intelligence Artificielle
            </p>
            <Link
              href="/dashboard/ai-insights"
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200",
                pathname === "/dashboard/ai-insights"
                  ? "bg-gradient-to-r from-primary to-indigo-600 text-white font-bold shadow-lg shadow-primary/10" 
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-white group"
              )}
            >
              <Sparkles className={cn("h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-110", pathname === "/dashboard/ai-insights" ? "text-white" : "text-slate-400 group-hover:text-white")} />
              Insights IA
            </Link>
          </div>
        )}

        {/* Secondary Navigation */}
        <div className="space-y-2">
          <p className="px-3.5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
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
                        "w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200 text-slate-400 hover:bg-slate-800/50 hover:text-white group"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4.5 w-4.5 group-hover:scale-110 transition-transform duration-200" />
                        {item.name}
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 ml-9">
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className={cn(
                          "block px-3.5 py-2 text-xs rounded-lg transition-all duration-200",
                          pathname === sub.href
                            ? "bg-primary text-white font-bold shadow-md shadow-primary/20"
                            : "text-slate-400 hover:bg-slate-800/30 hover:text-white"
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
                    ? "bg-gradient-to-r from-primary to-indigo-600 text-white font-bold shadow-lg shadow-primary/10" 
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white group"
                )}
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-slate-800">
        <form action={logoutUser}>
          <Button variant="ghost" className="w-full justify-start text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl" type="submit">
            <LogOut className="h-4.5 w-4.5 mr-3 transition-transform duration-200" />
            Déconnexion
          </Button>
        </form>
      </div>
    </aside>
  )
}
