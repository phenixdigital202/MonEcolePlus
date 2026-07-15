"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AddClassModal } from "./add-class-modal"

export function ClassActionsHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <DashboardHeader 
        title="Gestion des Classes" 
        subtitle="Gérez vos classes et les élèves associés"
      >
        <Button onClick={() => setIsModalOpen(true)} className="shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle classe
        </Button>
      </DashboardHeader>

      <AddClassModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
}
