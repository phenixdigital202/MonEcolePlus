"use client"

import { useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  ChevronRight,
  TrendingUp,
  AlertTriangle
} from "lucide-react"
import Link from "next/link"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog"
import { deleteClass } from "@/lib/classes-actions"
import { toast } from "sonner"
import { EditClassModal } from "./edit-class-modal"

interface ClassesListProps {
  initialClasses: {
    id: number
    name: string
    level: string
    students: number
    teacher: string
    subjects: number
    average: number
  }[]
  userRole?: string
}

export function ClassesList({ initialClasses, userRole = "admin" }: ClassesListProps) {
  const [isPending, startTransition] = useTransition()
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editClass, setEditClass] = useState<any | null>(null)

  const handleDelete = () => {
    if (!deleteId) return
    startTransition(async () => {
      const result = await deleteClass(deleteId)
      if (result.success) {
        toast.success("Classe supprimée")
      } else {
        toast.error(result.error)
      }
      setDeleteId(null)
    })
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {initialClasses.map((item) => (
        <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all border-primary/10 group bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4 md:p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-primary group-hover:text-primary/80 transition-colors">
                  {item.name}
                </h3>
                <p className="text-sm font-medium text-muted-foreground">{item.level}</p>
              </div>
              
              {userRole === "admin" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => setEditClass(item)} className="cursor-pointer">
                      <Edit3 className="h-4 w-4 mr-2 text-blue-500" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleteId(item.id)} className="text-destructive cursor-pointer hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Professeur principal</span>
                <span className="font-bold text-foreground">{item.teacher}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Élèves</span>
                <span className="font-bold text-foreground">{item.students}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Matières</span>
                <span className="font-bold text-foreground">{item.subjects}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Moyenne</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span className="font-bold text-emerald-500">{item.average > 0 ? `${item.average}/20` : "N/A"}</span>
                </div>
              </div>
            </div>

            <Link href={`/dashboard/classes/${item.id}`}>
              <Button className="w-full h-11 bg-primary hover:bg-primary/90 shadow-md group/btn transition-all">
                Voir les détails
                <ChevronRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}

      {initialClasses.length === 0 && (
        <div className="col-span-full py-20 text-center border-2 border-dashed rounded-2xl border-muted-foreground/20">
          <div className="h-16 w-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="text-muted-foreground font-medium">Aucune classe enregistrée pour le moment.</p>
        </div>
      )}

      {/* Confirmation Dialog for Deletion */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="border-destructive/20 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirmation de suppression
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette classe ? Cette action supprimera également toutes les inscriptions, notes et horaires associés. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Suppression..." : "Supprimer définitivement"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Modal */}
      <EditClassModal 
        isOpen={!!editClass} 
        onClose={() => setEditClass(null)} 
        classData={editClass} 
      />
    </div>
  )
}
