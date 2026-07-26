"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  Calendar, 
  Users, 
  MapPin, 
  Printer, 
  Trash2, 
  Loader2, 
  Award, 
  FileText, 
  CheckCircle2, 
  RefreshCw 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { getExamensNationaux, createExamenNational, deleteExamenNational } from "@/lib/examen-actions"

export default function ExamensAdminPage() {
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Form State
  const [nom, setNom] = useState("BAC 2026")
  const [dateExamen, setDateExamen] = useState("")
  const [type, setType] = useState("national")
  const [jurys, setJurys] = useState("Jury A & B")
  const [salles, setSalles] = useState("Salle 101, 102")

  // Documents simulation state
  const [selectedStudentForDoc, setSelectedStudentForDoc] = useState("")
  const [docStudentName, setDocStudentName] = useState("Judith Konan")
  const [docDeskNumber, setDocDeskNumber] = useState("BAC-26-8893")
  const [docExamNom, setDocExamNom] = useState("BAC")
  const [docMention, setDocMention] = useState("Bien")
  const [docType, setDocType] = useState<"convocation" | "diplome">("convocation")
  const [generatedDoc, setGeneratedDoc] = useState<any>(null)

  const fetchData = async () => {
    setLoading(true)
    const res = await getExamensNationaux()
    if (res.success) {
      setExams(res.data || [])
    } else {
      toast.error(res.error || "Erreur de chargement des examens")
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nom || !dateExamen) {
      return toast.error("Veuillez saisir le nom de l'examen et la date")
    }

    setActionLoading(true)
    const res = await createExamenNational({
      nom,
      dateExamen: new Date(dateExamen),
      type,
      jurys,
      salles
    })

    if (res.success) {
      toast.success("Session d'examen planifiée !")
      setIsAddOpen(false)
      setDateExamen("")
      fetchData()
    } else {
      toast.error(res.error || "Erreur lors de la planification")
    }
    setActionLoading(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Voulez-vous supprimer cette session d'examen ?")) return
    const res = await deleteExamenNational(id)
    if (res.success) {
      toast.success("Session d'examen supprimée")
      fetchData()
    } else {
      toast.error(res.error)
    }
  }

  const handleGenerateDoc = (e: React.FormEvent) => {
    e.preventDefault()
    setGeneratedDoc({
      studentName: docStudentName,
      deskNumber: docDeskNumber,
      examNom: docExamNom,
      mention: docMention,
      date: new Date().toLocaleDateString('fr-FR')
    })
    toast.success("Document généré avec succès ! Prêt pour impression.")
  }

  return (
    <div className="space-y-6 p-4 md:p-8 animate-in fade-in duration-700 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des Examens</h1>
          <p className="text-sm text-slate-500">Planification des sessions BAC/BEPC, convocations, jurys et résultats</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2 rounded-2xl border-slate-200 font-bold hover:bg-slate-50">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-2xl shadow-lg font-bold bg-primary text-white hover:bg-primary/90 border-none">
                <Plus className="h-4 w-4" />
                Planifier un examen
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-3xl p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Planifier une session</DialogTitle>
                  <DialogDescription>
                    Configurez un examen national, blanc ou interne
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label>Nom de la session</Label>
                    <Input
                      placeholder="Ex: BAC Blanc 2026"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Type d&apos;examen</Label>
                      <Select value={type} onValueChange={setType}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="national">Examen National</SelectItem>
                          <SelectItem value="blanc">Examen Blanc</SelectItem>
                          <SelectItem value="interne">Examen Interne</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Date de début</Label>
                      <Input
                        type="date"
                        value={dateExamen}
                        onChange={(e) => setDateExamen(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Jurys assignés</Label>
                    <Input
                      placeholder="Jury A, B, C..."
                      value={jurys}
                      onChange={(e) => setJurys(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Salles réservées</Label>
                    <Input
                      placeholder="Salles 101, 102, Amphithéâtre..."
                      value={salles}
                      onChange={(e) => setSalles(e.target.value)}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl">
                    Annuler
                  </Button>
                  <Button type="submit" disabled={actionLoading} className="rounded-xl bg-primary text-white font-bold border-none">
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Planifier"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 w-full">
        {/* Left: Exam list */}
        <Card className="lg:col-span-2 border-slate-200 rounded-3xl shadow-sm bg-white overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Sessions Planifiées</CardTitle>
            <CardDescription>Liste complète des examens en cours et futurs</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-10 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold text-xs">Examen</TableHead>
                    <TableHead className="font-bold text-xs">Type</TableHead>
                    <TableHead className="font-bold text-xs">Date</TableHead>
                    <TableHead className="font-bold text-xs">Jurys & Salles</TableHead>
                    <TableHead className="text-right font-bold text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.map(ex => (
                    <TableRow key={ex.id}>
                      <TableCell className="font-bold text-slate-900">{ex.nom}</TableCell>
                      <TableCell>
                        <Badge className="bg-primary/10 text-primary border-none uppercase text-[9px] font-bold">
                          {ex.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 font-semibold">
                        {new Date(ex.dateExamen).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        <div className="space-y-0.5">
                          <p className="font-medium"><Users className="inline h-3 w-3 mr-1 text-slate-400" /> {ex.jurys || "-"}</p>
                          <p className="font-medium"><MapPin className="inline h-3 w-3 mr-1 text-slate-400" /> {ex.salles || "-"}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600 rounded-full hover:bg-rose-50" onClick={() => handleDelete(ex.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {exams.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-slate-400 italic">
                        Aucun examen planifié.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Right: Convocations & Attestations generator */}
        <Card className="border-slate-200 rounded-3xl shadow-sm bg-white overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Générateur Officiel</CardTitle>
            <CardDescription>Générez convocations, relevés et diplômes certifiés</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleGenerateDoc} className="space-y-4">
              <div className="space-y-2">
                <Label>Type de Document</Label>
                <Select value={docType} onValueChange={(val: any) => setDocType(val)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="convocation">Convocation Officielle</SelectItem>
                    <SelectItem value="diplome">Attestation de Réussite / Diplôme</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Nom du Candidat</Label>
                <Input
                  value={docStudentName}
                  onChange={(e) => setDocStudentName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>N° Table / Identifiant</Label>
                  <Input
                    value={docDeskNumber}
                    onChange={(e) => setDocDeskNumber(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Examen Cible</Label>
                  <Input
                    value={docExamNom}
                    onChange={(e) => setDocExamNom(e.target.value)}
                    required
                  />
                </div>
              </div>

              {docType === "diplome" && (
                <div className="space-y-2">
                  <Label>Mention obtenue</Label>
                  <Select value={docMention} onValueChange={setDocMention}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Tres Bien">Très Bien</SelectItem>
                      <SelectItem value="Bien">Bien</SelectItem>
                      <SelectItem value="Assez Bien">Assez Bien</SelectItem>
                      <SelectItem value="Passable">Passable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button type="submit" className="w-full rounded-xl bg-primary text-white font-bold border-none">
                Générer le document
              </Button>
            </form>

            {generatedDoc && (
              <div className="mt-6 border border-slate-100 p-5 rounded-2xl bg-slate-50 space-y-4">
                <div className="text-center space-y-1 pb-3 border-b">
                  {docType === "convocation" ? (
                    <>
                      <FileText className="h-8 w-8 mx-auto text-primary" />
                      <h4 className="font-bold text-sm text-slate-800">CONVOCATION INDIVIDUELLE</h4>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">{generatedDoc.examNom}</p>
                    </>
                  ) : (
                    <>
                      <Award className="h-8 w-8 mx-auto text-amber-500" />
                      <h4 className="font-bold text-sm text-slate-800">ATTESTATION DE RÉUSSITE</h4>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Mention {generatedDoc.mention}</p>
                    </>
                  )}
                </div>

                <div className="text-xs space-y-2 text-slate-600 font-medium">
                  <p>Candidat : <span className="font-bold text-slate-900">{generatedDoc.studentName}</span></p>
                  <p>Numéro de table : <span className="font-mono font-bold text-slate-900">{generatedDoc.deskNumber}</span></p>
                  <p>Date d&apos;impression : <span>{generatedDoc.date}</span></p>
                </div>

                <Button variant="outline" className="w-full gap-2 rounded-xl font-bold border-slate-200 hover:bg-slate-100" onClick={() => window.print()}>
                  <Printer className="h-4 w-4" />
                  Imprimer / PDF
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
