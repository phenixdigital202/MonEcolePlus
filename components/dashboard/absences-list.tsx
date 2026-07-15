"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Plus,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react"
import { AddAbsenceModal } from "./add-absence-modal"
import { useRouter } from "next/navigation"

type Absence = {
  id: number
  student: string
  class: string
  date: string
  reason: string
  status: string
  duration: string
}

const statusConfig: Record<string, { label: string, color: string, bg: string, icon: any }> = {
  justified: { label: "Justifiée", color: "text-chart-3", bg: "bg-chart-3/10", icon: CheckCircle },
  non_justifie: { label: "Non justifiée", color: "text-destructive", bg: "bg-destructive/10", icon: XCircle },
  en_attente: { label: "En attente", color: "text-chart-4", bg: "bg-chart-4/10", icon: Clock },
}

export function AbsencesList({ initialAbsences, isReadOnly = false }: { initialAbsences: Absence[], isReadOnly?: boolean }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const router = useRouter()

  const filteredAbsences = initialAbsences.filter(a => {
    const matchesSearch = a.student.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || a.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <>
      {/* Actions Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {!isReadOnly && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un élève..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
        <div className={`flex gap-2 flex-wrap ${isReadOnly ? 'w-full justify-between' : ''}`}>
          <select 
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="justified">Justifiées</option>
            <option value="non_justifie">Non justifiées</option>
            <option value="en_attente">En attente</option>
          </select>
          {!isReadOnly && (
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Marquer absence
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Absences récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">Élève</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">Classe</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">Date</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">Durée</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">Motif</th>
                  <th className="py-3 px-4 text-center text-sm font-semibold text-foreground">Statut</th>
                  <th className="py-3 px-4 text-center text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAbsences.map((absence, idx) => {
                  const status = statusConfig[absence.status] || statusConfig.en_attente
                  const StatusIcon = status.icon
                  return (
                    <tr key={absence.id} className={idx % 2 === 0 ? "bg-muted/30" : ""}>
                      <td className="py-3 px-4 text-sm font-medium">{absence.student}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{absence.class}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{absence.date}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{absence.duration}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{absence.reason}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                            <StatusIcon className="h-3.5 w-3.5" />
                            {status.label}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button variant="ghost" size="sm">Détails</Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AddAbsenceModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        onSuccess={() => router.refresh()}
      />
    </>
  )
}
