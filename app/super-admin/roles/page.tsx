"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Key, Eye, Lock } from "lucide-react"

export default function RolesPage() {
  const roles = [
    { name: "Super Admin", desc: "Contrôle global, gestion des établissements et configuration de la plateforme SaaS.", permissions: ["toutes les permissions"] },
    { name: "Admin Établissement", desc: "Gestion des élèves, enseignants, comptabilité et paramètres de son école.", permissions: ["lire", "écrire", "modifier", "supprimer les ressources de l'école"] },
    { name: "Enseignant", desc: "Saisie des notes, appel des élèves et gestion du cahier de textes.", permissions: ["lire les élèves", "saisir les notes", "remplir l'appel"] },
    { name: "Parent", desc: "Consultation des résultats scolaires, suivi de l'assiduité et paiement de la scolarité.", permissions: ["consulter les notes", "consulter les absences", "payer les frais"] },
    { name: "Élève", desc: "Consultation de l'emploi du temps, téléchargement des cours et consultation des devoirs.", permissions: ["consulter l'emploi du temps", "télécharger les cours"] }
  ]

  return (
    <div className="p-8 space-y-8 bg-[#09090b] text-white min-h-screen">
      <div className="flex flex-col gap-1.5 border-b border-[#27272a] pb-6">
        <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
          Sécurité & Rôles
        </h1>
        <p className="text-[#a1a1aa] text-sm">Définissez et configurez les droits d&apos;accès et les rôles utilisateurs.</p>
      </div>

      <div className="space-y-4">
        {roles.map((r, i) => (
          <Card key={i} className="border-[#27272a] bg-[#18181b] text-white p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold">{r.name}</h3>
                <p className="text-sm text-[#a1a1aa]">{r.desc}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {r.permissions.map((p, j) => (
                    <span key={j} className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-[#27272a]">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
