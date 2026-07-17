"use client"

import { useState } from "react"
import { StudentGradebook } from "./student-gradebook"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users } from "lucide-react"

interface ParentGradebookViewProps {
  childrenData: {
    id: number
    name: string
    class: string
    avatar: string
    academic: any
  }[]
}

export function ParentGradebookView({ childrenData }: ParentGradebookViewProps) {
  const [selectedChildId, setSelectedChildId] = useState<number | null>(
    childrenData[0]?.id || null
  )

  const selectedChild = childrenData.find(c => c.id === selectedChildId) || childrenData[0]

  if (childrenData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center border rounded-xl bg-card p-6">
        <Users className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-bold">Aucun enfant trouvé</h2>
        <p className="text-muted-foreground mt-2 max-w-md">
          Aucun élève n&apos;est actuellement rattaché à votre compte. Veuillez contacter l&apos;administration.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Children Selector */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Sélectionner un enfant pour afficher ses notes :</h2>
        <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
          {childrenData.map((child) => (
            <Card 
              key={child.id}
              className={`w-full max-w-[260px] sm:w-[240px] shrink-0 cursor-pointer transition-all hover:shadow-sm ${
                selectedChild.id === child.id 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'border-border/50'
              }`}
              onClick={() => setSelectedChildId(child.id)}
            >
              <CardContent className="flex items-center gap-3 p-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                    {child.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{child.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{child.class}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {selectedChild.academic ? (
        <StudentGradebook data={selectedChild.academic} />
      ) : (
        <div className="p-8 text-center text-muted-foreground border rounded-lg bg-muted/20">
          Aucun résultat académique disponible pour cet enfant.
        </div>
      )}
    </div>
  )
}
