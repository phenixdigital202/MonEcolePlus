"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  FileText, 
  Download,
  Search,
  Eye,
  Printer,
  FilePlus,
  GraduationCap,
  Award,
  ClipboardList,
  Filter,
  CheckCircle2,
  Clock,
  ShieldCheck
} from "lucide-react"
import Link from "next/link"

interface DocumentsPortalProps {
  userRole: string
  studentName?: string
}

const documentTypes = [
  {
    id: 1,
    name: "Certificat de scolarité",
    description: "Attestation officielle d'inscription",
    icon: GraduationCap,
    href: "/dashboard/documents/cert",
    count: 1, // Simulated for student
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: 2,
    name: "Bulletin scolaire",
    description: "Résultats trimestriels des élèves",
    icon: ClipboardList,
    href: "/dashboard/documents/bulletin",
    count: 2, // Simulated for student
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    id: 3,
    name: "Attestation de réussite",
    description: "Certificat de passage ou d'examen",
    icon: Award,
    href: "#",
    count: 0,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    id: 4,
    name: "Relevé de notes",
    description: "Détail des notes par matière",
    icon: FileText,
    href: "/dashboard/grades", // Students see their gradebook here
    count: 1,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
]

const adminRecentDocs = [
  { id: 1, name: "Bulletin_3A_T1_2026.pdf", type: "Bulletin scolaire", date: "Aujourd'hui", size: "245 Ko", status: "Signé" },
  { id: 2, name: "Certificat_Abou_Traore.pdf", type: "Certificat de scolarité", date: "Hier", size: "128 Ko", status: "Signé" },
]

const studentRecentDocs = [
  { id: 1, name: "Bulletin_T1_Abou_Traore.pdf", type: "Bulletin scolaire", date: "Hier", size: "240 Ko", status: "Signé" },
  { id: 2, name: "Certificat_Scolarite_2026.pdf", type: "Certificat de scolarité", date: "12 Avril", size: "120 Ko", status: "Signé" },
]

export function DocumentsPortal({ userRole, studentName, documentCounts }: DocumentsPortalProps & { documentCounts?: any }) {
  const [searchTerm, setSearchTerm] = useState("")
  const isAdmin = userRole === "admin" || userRole === "teacher"
  
  const documentTypes = [
    {
      id: 1,
      name: "Certificat de scolarité",
      description: "Attestation officielle d'inscription",
      icon: GraduationCap,
      href: "/dashboard/documents/cert",
      count: documentCounts?.certificates || (isAdmin ? 0 : 0),
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      id: 2,
      name: "Bulletin scolaire",
      description: "Résultats trimestriels des élèves",
      icon: ClipboardList,
      href: "/dashboard/documents/bulletin",
      count: documentCounts?.reports || (isAdmin ? 0 : 0),
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      id: 3,
      name: "Attestation de réussite",
      description: "Certificat de passage ou d'examen",
      icon: Award,
      href: "#",
      count: 0,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      id: 4,
      name: "Relevé de notes",
      description: "Détail des notes par matière",
      icon: FileText,
      href: "/dashboard/grades", // Students see their gradebook here
      count: documentCounts?.transcripts || (isAdmin ? 0 : 0),
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
  ]

  const docs = isAdmin ? adminRecentDocs : [
    { id: 1, name: `Certificat_Scolarite_${studentName?.replace(' ', '_')}.pdf`, type: "Certificat de scolarité", date: "Aujourd'hui", size: "125 Ko", status: "Signé" },
    ...(documentCounts?.reports ? [{ id: 2, name: `Bulletin_Notes_2026.pdf`, type: "Bulletin scolaire", date: "Récent", size: "240 Ko", status: "Disponible" }] : [])
  ]

  const filteredDocuments = docs.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <DashboardHeader 
        title={isAdmin ? "Portail des Documents" : "Mes Documents Officiels"} 
        subtitle={isAdmin 
          ? "Gérez, téléchargez et vérifiez tous les documents de l'établissement" 
          : "Consultez et téléchargez vos certificats et bulletins officiels"
        }
      />
      
      <main className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Quick Access Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {documentTypes.map((type) => (
            <Card 
              key={type.id} 
              className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-primary/10"
            >
              <CardContent className="p-6">
                <div className={`h-12 w-12 rounded-xl ${type.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <type.icon className={`h-6 w-6 ${type.color}`} />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-1">{type.name}</h3>
                <p className="text-xs text-muted-foreground mb-4 leading-tight">{type.description}</p>
                
                <div className="flex items-center justify-between mt-auto">
                   {isAdmin ? (
                     <Link href={type.href} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full h-9 border-primary/20 hover:bg-primary hover:text-white transition-all text-xs font-bold">
                          <FilePlus className="h-3.5 w-3.5 mr-2" />
                          Générer
                        </Button>
                     </Link>
                   ) : (
                     <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        {type.count} disponible{type.count > 1 ? 's' : ''}
                     </div>
                   )}
                   {isAdmin && <span className="ml-3 text-xl font-black opacity-20">{type.count}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main List */}
          <Card className="lg:col-span-2 shadow-xl border-primary/5">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                {isAdmin ? "Historique de l'établissement" : "Mes Documents Récents"}
              </CardTitle>
              <div className="flex gap-2">
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Chercher un fichier..."
                    className="pl-9 w-48 h-9 text-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="py-3 px-6 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Fiche</th>
                      <th className="py-3 px-6 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Statut</th>
                      <th className="py-3 px-6 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground">Date</th>
                      <th className="py-3 px-6 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-primary/5 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded bg-red-500/10 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                               <p className="font-bold text-sm group-hover:text-primary transition-colors">{doc.name}</p>
                               <p className="text-[10px] text-muted-foreground uppercase">{doc.type} • {doc.size}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-6">
                           <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${doc.status === 'Signé' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              <span className="text-xs font-medium">{doc.status}</span>
                           </div>
                        </td>
                        <td className="py-3 px-6 text-xs font-medium text-muted-foreground">{doc.date}</td>
                        <td className="py-3 px-6">
                          <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                              <Download className="h-4 w-4" />
                            </Button>
                            {isAdmin && (
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Printer className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Verification (Unified) */}
          <div className="space-y-6">
             <Card className="border-emerald-500/20 bg-emerald-500/5 shadow-lg overflow-hidden">
                <CardHeader>
                   <CardTitle className="text-md flex items-center gap-2 text-emerald-900">
                      <ShieldCheck className="h-4 w-4" />
                      Authenticité
                   </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="flex items-center justify-center p-6 bg-white/50 rounded-2xl border-2 border-dashed border-emerald-500/20">
                      <div className="text-center">
                         <div className="h-12 w-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-2">
                            <CheckCircle2 className="h-6 w-6" />
                         </div>
                         <p className="text-xs font-bold text-emerald-800">Sécurisé par QR</p>
                      </div>
                   </div>
                   <p className="text-xs text-emerald-700 leading-relaxed text-center">
                     Chaque document possède un code unique permettant aux autorités de vérifier son authenticité instantanément.
                   </p>
                </CardContent>
             </Card>

             {isAdmin && (
               <Card className="shadow-lg border-primary/10">
                  <CardHeader>
                     <CardTitle className="text-md">Stockage & Quotas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                           <span>Espace Utilisé</span>
                           <span>75%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                           <div className="h-full bg-primary w-[75%]" />
                        </div>
                     </div>
                     <p className="text-[10px] text-muted-foreground italic">
                       * Votre plan actuel permet de générer jusqu'à 1000 certificats par mois.
                     </p>
                  </CardContent>
               </Card>
             )}
          </div>
        </div>
      </main>
    </>
  )
}
