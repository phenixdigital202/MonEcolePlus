"use client"

import { useState, useEffect } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, UserPlus, Loader2, CheckCircle2 } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getEligibleStudentsAction, enrollStudentAction } from "@/lib/classes-actions"
import { toast } from "sonner"

interface EnrollmentModalProps {
  isOpen: boolean
  onClose: () => void
  classId: number
}

export function EnrollmentModal({ isOpen, onClose, classId }: EnrollmentModalProps) {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [processingId, setProcessingId] = useState<number | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadStudents()
    }
  }, [isOpen])

  const loadStudents = async () => {
    setLoading(true)
    const res = await getEligibleStudentsAction(classId)
    if (res.success) setStudents(res.data)
    setLoading(false)
  }

  const handleEnroll = async (studentId: number) => {
    setProcessingId(studentId)
    const res = await enrollStudentAction(studentId, classId)
    if (res.success) {
      toast.success("Élève inscrit avec succès")
      setStudents(prev => prev.filter(s => s.id !== studentId))
    } else {
      toast.error(res.error)
    }
    setProcessingId(null)
  }

  const filteredStudents = students.filter(s => 
    s.nom.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Gérer les inscriptions</DialogTitle>
          <DialogDescription>
            Sélectionnez les élèves à ajouter à cette classe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher un élève..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="py-10 text-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Chargement des élèves...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground italic">
                {search ? "Aucun élève ne correspond à votre recherche." : "Aucun élève éligible trouvé."}
              </div>
            ) : (
              filteredStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {student.nom.split(" ").map((n: string) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{student.nom}</p>
                      <p className="text-xs text-slate-500">{student.email}</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary p-0"
                    onClick={() => handleEnroll(student.id)}
                    disabled={processingId === student.id}
                  >
                    {processingId === student.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
