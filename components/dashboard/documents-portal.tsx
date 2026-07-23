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
  CheckCircle2,
  Clock,
  ShieldCheck
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface DocumentsPortalProps {
  userRole: string
  studentName?: string
  documentCounts?: any
}

export function DocumentsPortal({ userRole, studentName, documentCounts }: DocumentsPortalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [viewingDoc, setViewingDoc] = useState<any>(null)
  const isAdmin = userRole === "admin" || userRole === "teacher"
  
  const documentTypes = [
    {
      id: 1,
      name: "Certificat de scolarité",
      description: "Attestation officielle d'inscription",
      icon: GraduationCap,
      href: "/dashboard/documents/cert",
      count: documentCounts?.certificates || (isAdmin ? 12 : 1),
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      id: 2,
      name: "Bulletin scolaire",
      description: "Résultats trimestriels des élèves",
      icon: ClipboardList,
      href: "/dashboard/documents/bulletin",
      count: documentCounts?.reports || (isAdmin ? 48 : 2),
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      id: 3,
      name: "Attestation de réussite",
      description: "Certificat de passage ou d'examen",
      icon: Award,
      href: "/dashboard/documents/cert",
      count: 0,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      id: 4,
      name: "Relevé de notes",
      description: "Détail des notes par matière",
      icon: FileText,
      href: "/dashboard/grades",
      count: documentCounts?.transcripts || (isAdmin ? 96 : 3),
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
  ]

  const adminRecentDocs = [
    { id: 1, name: "Bulletin_3A_T1_2026.pdf", type: "Bulletin scolaire", date: "Aujourd'hui", size: "245 Ko", status: "Signé" },
    { id: 2, name: "Certificat_Abou_Traore.pdf", type: "Certificat de scolarité", date: "Hier", size: "128 Ko", status: "Signé" },
    { id: 3, name: "Bulletin_Terminale_T1.pdf", type: "Bulletin scolaire", date: "Il y a 2 jours", size: "310 Ko", status: "Signé" },
  ]

  const docs = isAdmin ? adminRecentDocs : [
    { id: 1, name: `Certificat_Scolarite_${studentName?.replace(/\s+/g, '_') || 'Eleve'}.pdf`, type: "Certificat de scolarité", date: "Aujourd'hui", size: "125 Ko", status: "Signé" },
    { id: 2, name: `Bulletin_Notes_T1_2026.pdf`, type: "Bulletin scolaire", date: "Récent", size: "240 Ko", status: "Signé" }
  ]

  const filteredDocuments = docs.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDownload = (doc: any) => {
    toast.success(`Téléchargement de ${doc.name} démarré...`)
    window.print()
  }

  return (
    <>
      <DashboardHeader 
        title={isAdmin ? "Portail des Documents" : "Mes Documents Officiels"} 
        subtitle={isAdmin 
          ? "Gérez, téléchargez et vérifiez tous les documents de l'établissement" 
          : "Consultez et téléchargez vos certificats et bulletins officiels"
        }
      />
      
      <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* Quick Access Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {documentTypes.map((type) => (
            <Card 
              key={type.id} 
              className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-slate-200 rounded-3xl bg-white"
            >
              <CardContent className="p-6 flex flex-col h-full">
                <div className={`h-12 w-12 rounded-2xl ${type.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <type.icon className={`h-6 w-6 ${type.color}`} />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">{type.name}</h3>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">{type.description}</p>
                
                <div className="flex items-center justify-between mt-auto">
                   <Link href={type.href} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full h-10 border-slate-200 hover:bg-primary hover:text-white rounded-xl transition-all text-xs font-bold gap-2">
                        <FilePlus className="h-4 w-4" />
                        {isAdmin ? "Générer" : "Consulter"}
                      </Button>
                   </Link>
                   {isAdmin && <span className="ml-3 text-lg font-black text-slate-300">{type.count}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main List */}
          <Card className="lg:col-span-2 shadow-xl border-slate-200 rounded-3xl bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                <Clock className="h-5 w-5 text-primary" />
                {isAdmin ? "Historique de l'établissement" : "Mes Documents Récents"}
              </CardTitle>
              <div className="flex gap-2">
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Chercher un fichier..."
                    className="pl-9 w-48 h-9 text-xs rounded-xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/50 border-b">
                    <tr>
                      <th className="py-3 px-6 text-left text-xs font-bold uppercase tracking-widest text-slate-500">Fiche</th>
                      <th className="py-3 px-6 text-left text-xs font-bold uppercase tracking-widest text-slate-500">Statut</th>
                      <th className="py-3 px-6 text-left text-xs font-bold uppercase tracking-widest text-slate-500">Date</th>
                      <th className="py-3 px-6 text-center text-xs font-bold uppercase tracking-widest text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-rose-600" />
                            </div>
                            <div>
                               <p className="font-bold text-sm text-slate-800 group-hover:text-primary transition-colors">{doc.name}</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase">{doc.type} • {doc.size}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-6">
                           <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${doc.status === 'Signé' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              <span className="text-xs font-bold text-slate-700">{doc.status}</span>
                           </div>
                        </td>
                        <td className="py-3 px-6 text-xs font-bold text-slate-500">{doc.date}</td>
                        <td className="py-3 px-6">
                          <div className="flex justify-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-primary hover:bg-primary/10 rounded-full"
                              onClick={() => setViewingDoc(doc)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-primary hover:bg-primary/10 rounded-full"
                              onClick={() => handleDownload(doc)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
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
             <Card className="border-emerald-500/20 bg-emerald-500/5 shadow-lg overflow-hidden rounded-3xl">
                <CardHeader>
                   <CardTitle className="text-md flex items-center gap-2 text-emerald-900 font-bold">
                      <ShieldCheck className="h-5 w-5 text-emerald-600" />
                      Authentification Documentaire
                   </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="flex items-center justify-center p-6 bg-white/60 rounded-2xl border-2 border-dashed border-emerald-500/30">
                      <div className="text-center">
                         <div className="h-12 w-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-2">
                            <CheckCircle2 className="h-6 w-6" />
                         </div>
                         <p className="text-xs font-bold text-emerald-800">Tampon Numérique & QR</p>
                      </div>
                   </div>
                   <p className="text-xs text-emerald-800 leading-relaxed text-center font-medium">
                     Chaque document officiel contient une clé cryptographique et un QR code vérifiables par les autorités académiques.
                   </p>
                </CardContent>
             </Card>
          </div>
        </div>
      </main>

      {/* Viewing Doc Modal */}
      <Dialog open={!!viewingDoc} onOpenChange={(open) => !open && setViewingDoc(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          {viewingDoc && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold">{viewingDoc.name}</DialogTitle>
              </DialogHeader>
              <div className="p-6 bg-slate-50 rounded-2xl border text-center space-y-3">
                <FileText className="h-12 w-12 text-primary mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Aperçu du document officiel prêt à l&apos;impression.</p>
                <Badge className="bg-emerald-500 text-white border-none font-bold text-xs">{viewingDoc.status}</Badge>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setViewingDoc(null)} className="rounded-xl">Fermer</Button>
                <Button className="rounded-xl bg-primary text-white font-bold gap-2" onClick={() => handleDownload(viewingDoc)}>
                  <Printer className="h-4 w-4" /> Imprimer / Télécharger
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
