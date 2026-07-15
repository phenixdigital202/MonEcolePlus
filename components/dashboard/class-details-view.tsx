"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  ArrowLeft,
  GraduationCap,
  Calendar,
  BookOpen,
  Award,
  MoreHorizontal,
  Mail,
  UserCheck,
  Loader2,
  CheckCircle2,
  Trash2,
  ExternalLink
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { unenrollStudentAction } from "@/lib/classes-actions"
import { EnrollmentModal } from "./enrollment-modal"

interface ClassDetailsViewProps {
  classe: any
  classId: number
}

export function ClassDetailsView({ classe, classId }: ClassDetailsViewProps) {
  const router = useRouter()
  const [isEnrollOpen, setIsEnrollOpen] = useState(false)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const unenrollStudent = async (studentId: number) => {
    if (!confirm("Voulez-vous vraiment désinscrire cet élève ?")) return
    
    setLoadingAction(`unenroll-${studentId}`)
    const res = await unenrollStudentAction(studentId, classId)
    if (res.success) {
      toast.success("Élève désinscrit")
    } else {
      toast.error(res.error)
    }
    setLoadingAction(null)
  }

  const handleGenerateBulletins = () => {
    setLoadingAction("bulletins")
    setTimeout(() => {
      setLoadingAction(null)
      toast.success("Processus lancé !", {
        description: "Les bulletins pour la classe " + classe.nom + " sont en cours de génération."
      })
    }, 1500)
  }

  const mainTeacher = classe.emplois_du_temps[0]?.users.nom || "Non assigné"

  return (
    <>
      <DashboardHeader 
        title={`Classe : ${classe.nom}`}
        subtitle={`${classe.niveau} • ${classe._count.inscriptions} élèves`}
      >
        <div className="flex gap-1 md:gap-2">
          <Link href="/dashboard/classes">
            <Button variant="outline" size="sm" className="rounded-xl border-slate-200 h-9 px-2 md:px-3">
              <ArrowLeft className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Retour</span>
            </Button>
          </Link>
          <Button size="sm" className="rounded-xl bg-primary shadow-sm hover:shadow-md h-9 px-2 md:px-3" onClick={() => setIsEnrollOpen(true)}>
            <UserCheck className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Gérer les inscriptions</span>
          </Button>
        </div>
      </DashboardHeader>

      <main className="p-6 space-y-6">
        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-4 animate-in fade-in slide-in-from-top-4 duration-500">
          {[
            { label: "Effectif", val: `${classe._count.inscriptions} élèves`, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
            { label: "Moyenne Classe", val: classe.classAverage === "N/A" ? "N/A" : `${classe.classAverage}/20`, icon: GraduationCap, color: "text-emerald-500", bg: "bg-emerald-50" },
            { label: "Présence", val: `${classe.attendanceRate}%`, icon: Calendar, color: "text-amber-500", bg: "bg-amber-50" },
            { label: "Prof. Principal", val: mainTeacher, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50" },
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`h-11 w-11 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                  <p className="text-xl font-black text-slate-800 truncate max-w-[140px]">{stat.val}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Student List */}
          <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50/50">
              <CardTitle className="text-lg font-bold text-slate-800">Liste des élèves</CardTitle>
              <Badge variant="outline" className="rounded-full bg-white border-slate-200">
                {classe._count.inscriptions} inscrits
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-slate-100 bg-slate-50/20">
                      <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Élève</th>
                      <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Moyenne</th>
                      <th className="p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                      <th className="p-4 text-right font-bold text-slate-500 text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {classe.inscriptions.map((ins: any) => (
                      <tr key={ins.eleve.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-100">
                              <AvatarFallback className="bg-primary/5 text-primary text-xs font-black">
                                {ins.eleve.nom.split(" ").map((n: string) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{ins.eleve.nom}</p>
                              <p className="text-xs text-slate-400 font-medium">{ins.eleve.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm font-bold text-slate-700">{ins.average}{ins.average !== "N/A" && "/20"}</span>
                        </td>
                        <td className="p-4">
                          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 rounded-full text-[10px]" variant="secondary">ACTIF</Badge>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Link href={`/dashboard/messages?to=${ins.eleve.id}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                                    <Mail className="h-4 w-4" />
                                </Button>
                            </Link>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-xl border-slate-100">
                                <DropdownMenuLabel>Gestion Éleve</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer gap-2">
                                  <Users className="h-4 w-4" /> Profil complet
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="cursor-pointer gap-2 text-destructive hover:bg-destructive/10"
                                  onClick={() => unenrollStudent(ins.eleve.id)}
                                  disabled={loadingAction === `unenroll-${ins.eleve.id}`}
                                >
                                  {loadingAction === `unenroll-${ins.eleve.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                  Désinscrire
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {classe.inscriptions.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-400 italic font-medium">
                          <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-3">
                             <Users className="h-8 w-8 text-slate-200" />
                          </div>
                          Aucun élève inscrit dans cette classe.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-50/50">
                <CardTitle className="text-lg font-black flex items-center gap-2 text-slate-800">
                  <Award className="h-5 w-5 text-primary" />
                  Corps Enseignant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {classe.emplois_du_temps.map((e: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-primary/20 transition-all group">
                    <div>
                      <p className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">{e.users?.nom || "Inconnu"}</p>
                      <p className="text-xs text-slate-500 font-medium">{e.matiere || "N/A"}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] rounded-lg border-slate-200 bg-slate-50/50 uppercase font-black tracking-tighter">
                        {e.salle || "N/A"}
                    </Badge>
                  </div>
                ))}
                {classe.emplois_du_temps.length === 0 && (
                  <p className="text-sm text-slate-400 italic text-center py-6 font-medium">Aucun enseignant assigné.</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-none shadow-sm rounded-3xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-black text-primary">Actions de classe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/dashboard/schedule?classId=${classId}`} className="block w-full">
                  <Button 
                      variant="ghost" 
                      className="w-full justify-start bg-white/50 backdrop-blur-sm border-white border hover:bg-primary hover:text-white transition-all rounded-2xl h-12 shadow-sm"
                  >
                    <Calendar className="h-4 w-4 mr-3" />
                    Voir l&apos;emploi du temps
                  </Button>
                </Link>
                <Link href="/dashboard/messages" className="block w-full">
                  <Button 
                      variant="ghost" 
                      className="w-full justify-start bg-white/50 backdrop-blur-sm border-white border hover:bg-primary hover:text-white transition-all rounded-2xl h-12 shadow-sm"
                  >
                    <Mail className="h-4 w-4 mr-3" />
                    Contacter tous les parents
                  </Button>
                </Link>
                <Button 
                    variant="ghost" 
                    className="w-full justify-start bg-white/50 backdrop-blur-sm border-white border hover:bg-emerald-500 hover:text-white transition-all rounded-2xl h-12 shadow-sm"
                    onClick={handleGenerateBulletins}
                    disabled={loadingAction === "bulletins"}
                >
                  {loadingAction === "bulletins" ? (
                      <Loader2 className="h-4 w-4 mr-3 animate-spin" />
                  ) : (
                      <BookOpen className="h-4 w-4 mr-3" />
                  )}
                  Générer les bulletins
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <EnrollmentModal 
        isOpen={isEnrollOpen} 
        onClose={() => setIsEnrollOpen(false)} 
        classId={classId}
      />
    </>
  )
}
