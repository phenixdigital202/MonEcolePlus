import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPrisma } from "@/lib/tenant-context"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter, ArrowUpDown } from "lucide-react"

export default async function GradesListPage() {
  const prisma = await getPrisma()
  // Fetch all notes with related data
  const notes = await prisma.note.findMany({
    include: {
      user: true,
      evaluation: {
        include: {
          classe: true
        }
      }
    },
    orderBy: { evaluation: { date_eval: 'desc' } }
  })

  // Predefined subjects for filtering (conceptually)
  const subjects = [
    "Mathématiques", "Français", "Anglais", "Physique-Chimie", "SVT"
  ]

  return (
    <>
      <DashboardHeader 
        title="Tableau des Notes" 
        subtitle="Consultez l'historique complet des résultats de tous les élèves"
      />
      
      <main className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Chercher un élève ou une matière..." />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
            <Button variant="outline" size="sm">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Trier
            </Button>
          </div>
        </div>

        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle>Liste exhaustive des notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-border">
                    <th className="pb-3 font-bold text-sm uppercase text-muted-foreground">Date</th>
                    <th className="pb-3 font-bold text-sm uppercase text-muted-foreground">Élève</th>
                    <th className="pb-3 font-bold text-sm uppercase text-muted-foreground">Classe</th>
                    <th className="pb-3 font-bold text-sm uppercase text-muted-foreground">Matière</th>
                    <th className="pb-3 font-bold text-sm uppercase text-muted-foreground text-center">Note / 20</th>
                    <th className="pb-3 font-bold text-sm uppercase text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {notes.map((note) => {
                    const val = Number(note.valeur)
                    return (
                      <tr key={note.id} className="group hover:bg-primary/5 transition-colors">
                        <td className="py-4 text-sm">
                          {new Date(note.evaluation.date_eval).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                              {note.user.nom.split(" ").map(n => n[0]).join("")}
                            </div>
                            <span className="font-medium text-sm">{note.user.nom}</span>
                          </div>
                        </td>
                        <td className="py-4 text-sm">{note.evaluation.classe.nom}</td>
                        <td className="py-4 text-sm font-medium">{note.evaluation.matiere}</td>
                        <td className="py-4 text-center">
                          <Badge 
                            variant="secondary" 
                            className={`font-bold ${val >= 14 ? 'bg-emerald-500/10 text-emerald-600' : val >= 10 ? 'bg-amber-500/10 text-amber-600' : 'bg-red-500/10 text-red-600'}`}
                          >
                            {val.toFixed(1)}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <span className="text-xs text-muted-foreground italic">Validé</span>
                        </td>
                      </tr>
                    )
                  })}
                  {notes.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-20 text-center text-muted-foreground italic">
                        Aucune note n'a encore été enregistrée dans la base de données.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
