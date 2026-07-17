"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AddClassModal } from "./add-class-modal"

interface ClassActionsHeaderProps {
  userRole?: string
}

export function ClassActionsHeader({ userRole = "admin" }: ClassActionsHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const isAdmin = userRole === "admin"

  return (
    <>
      <DashboardHeader 
        title={isAdmin ? "Gestion des Classes" : "Mes Classes"} 
        subtitle={isAdmin ? "Gérez vos classes et les élèves associés" : "Visualisez vos classes et les informations associées"}
      >
        {isAdmin && (
          <Button onClick={() => setIsModalOpen(true)} className="shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle classe
          </Button>
        )}
      </DashboardHeader>

      {isAdmin && (
        <AddClassModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  )
}
