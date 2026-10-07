"use client"

import React, { useRef } from "react"
import { Printer, Download, GraduationCap, Building, UserCheck, Calendar, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DocumentPrintContainer } from "@/components/documents/document-print-container"

interface OfficialFicheInscriptionProps {
  inscriptionData: any
  schoolData?: any
}

export function OfficialFicheInscriptionPdf({ inscriptionData, schoolData }: OfficialFicheInscriptionProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    window.print()
  }

  const user = inscriptionData?.user || {}
  const classe = inscriptionData?.classe || {}
  const ecole = schoolData || user?.ecole || {}
  const matriculeStr = (user.matricule || "12345678A").padEnd(10, " ").slice(0, 10)
  const matriculeChars = matriculeStr.split("")

  const typeInscription = inscriptionData?.type_inscription || "Inscription"
  const isReinscription = typeInscription === "Réinscription"
  const isInscription = !isReinscription

  const levelName = (classe?.niveau || classe?.nom || "").toLowerCase()
  const isMaternelle = levelName.includes("maternelle")
  const isPrimaire = levelName.includes("primaire") || levelName.includes("cp") || levelName.includes("ce") || levelName.includes("cm")
  const isCollege = levelName.includes("6") || levelName.includes("5") || levelName.includes("4") || levelName.includes("3") || levelName.includes("collège")
  const isLycee = levelName.includes("2") || levelName.includes("1") || levelName.includes("t") || levelName.includes("lycée")

  const formSheetContent = (
    <div 
      ref={printRef}
      className="bg-white text-slate-900 p-8 sm:p-12 border border-slate-300 shadow-2xl rounded-xl max-w-[850px] mx-auto text-xs font-sans print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none font-medium"
    >
      {/* Header Block */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-base font-black uppercase tracking-tight text-slate-900">
                  {ecole?.nom || "RÉPUBLIQUE DE CÔTE D'IVOIRE"}
                </h2>
                <p className="text-[10px] font-bold text-slate-600">Ministère de l&apos;Éducation Nationale et de l&apos;Alphabétisation</p>
                <p className="text-[9px] text-slate-500">Année Scolaire : {inscriptionData?.annee_scolaire || "2026-2027"}</p>
              </div>
            </div>

            <div className="text-right border-l-2 border-slate-300 pl-4">
              <span className="inline-block text-[10px] font-black uppercase px-2.5 py-1 bg-slate-100 border border-slate-300 rounded-md">
                SERVICE SCOLARITÉ
              </span>
              <p className="text-[9px] text-slate-500 mt-1">Imprimé le {new Date().toLocaleDateString("fr-FR")}</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <h1 className="text-lg sm:text-xl font-black uppercase tracking-wider text-slate-900 underline decoration-2 underline-offset-4">
              FICHE D&apos;INSCRIPTION OU DE RÉINSCRIPTION
            </h1>
          </div>
        </div>

        {/* Matricule & Operation Grid */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-slate-50 border border-slate-300 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="font-extrabold uppercase text-[11px] text-slate-900">Mle National (COLLÈGE/LYCÉE) :</span>
              <div className="flex items-center gap-1">
                {matriculeChars.map((char, idx) => (
                  <div 
                    key={idx} 
                    className="w-6 h-7 border border-slate-900 bg-white flex items-center justify-center font-mono font-black text-xs uppercase shadow-inner text-slate-900"
                  >
                    {char.trim()}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-bold">
              <span className="uppercase text-slate-600">Opération :</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <span className={`w-4 h-4 border-2 border-slate-900 flex items-center justify-center font-bold text-xs ${isInscription ? "bg-slate-900 text-white" : "bg-white"}`}>
                  {isInscription ? "✓" : ""}
                </span>
                <span>INSCRIPTION</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <span className={`w-4 h-4 border-2 border-slate-900 flex items-center justify-center font-bold text-xs ${isReinscription ? "bg-slate-900 text-white" : "bg-white"}`}>
                  {isReinscription ? "✓" : ""}
                </span>
                <span>RÉINSCRIPTION</span>
              </label>
            </div>
          </div>
        </div>

        {/* SECTION 1: Renseignements Élève */}
        <div className="border border-slate-400 rounded-lg overflow-hidden mb-6">
          <div className="bg-slate-900 text-white px-3 py-1.5 font-black uppercase text-[10px] tracking-wider">
            1. RENSEIGNEMENTS ÉLÈVE
          </div>

          <div className="p-4 space-y-3">
            {/* Cycle Selection Checkboxes */}
            <div className="flex flex-wrap items-center gap-6 pb-2 border-b border-slate-200 text-[10px] font-bold">
              <span className="text-slate-500 uppercase">CYCLE :</span>
              <span className="flex items-center gap-1.5">
                <span className={`w-3.5 h-3.5 border border-slate-900 flex items-center justify-center text-[10px] font-bold ${isMaternelle ? "bg-slate-900 text-white" : ""}`}>{isMaternelle ? "✓" : ""}</span>
                MATERNELLE
              </span>
              <span className="flex items-center gap-1.5">
                <span className={`w-3.5 h-3.5 border border-slate-900 flex items-center justify-center text-[10px] font-bold ${isPrimaire ? "bg-slate-900 text-white" : ""}`}>{isPrimaire ? "✓" : ""}</span>
                PRIMAIRE
              </span>
              <span className="flex items-center gap-1.5">
                <span className={`w-3.5 h-3.5 border border-slate-900 flex items-center justify-center text-[10px] font-bold ${isCollege ? "bg-slate-900 text-white" : ""}`}>{isCollege ? "✓" : ""}</span>
                COLLÈGE (1er CYCLE)
              </span>
              <span className="flex items-center gap-1.5">
                <span className={`w-3.5 h-3.5 border border-slate-900 flex items-center justify-center text-[10px] font-bold ${isLycee ? "bg-slate-900 text-white" : ""}`}>{isLycee ? "✓" : ""}</span>
                LYCÉE (2nd CYCLE)
              </span>
            </div>

            {/* General Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="font-bold text-slate-500 uppercase text-[9px] block">NOM &amp; PRÉNOMS :</span>
                <p className="font-black text-sm text-slate-900 border-b border-dotted border-slate-400 pb-0.5 uppercase">
                  {user.nom || "...................................................."}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-500 uppercase text-[9px] block">CLASSE D&apos;AFFECTATION :</span>
                <p className="font-black text-sm text-blue-700 border-b border-dotted border-slate-400 pb-0.5 uppercase">
                  {classe.nom || "...................................................."}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-500 uppercase text-[9px] block">DATE ET LIEU DE NAISSANCE :</span>
                <p className="font-bold text-slate-900 border-b border-dotted border-slate-400 pb-0.5">
                  {user.date_naissance ? new Date(user.date_naissance).toLocaleDateString("fr-FR") : "..../..../........"} à {user.lieu_naissance || "..................."}
                </p>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <span className="font-bold text-slate-500 uppercase text-[9px] block">NATIONALITÉ :</span>
                  <p className="font-bold text-slate-900 border-b border-dotted border-slate-400 pb-0.5">
                    {user.nationalite || "Ivoirienne"}
                  </p>
                </div>
                <div className="w-24">
                  <span className="font-bold text-slate-500 uppercase text-[9px] block">SEXE :</span>
                  <p className="font-bold text-slate-900 border-b border-dotted border-slate-400 pb-0.5">
                    {user.sexe === "F" ? "Féminin (F)" : "Masculin (M)"}
                  </p>
                </div>
              </div>

              <div className="sm:col-span-2">
                <span className="font-bold text-slate-500 uppercase text-[9px] block">ÉTABLISSEMENT D&apos;ORIGINE :</span>
                <p className="font-bold text-slate-900 border-b border-dotted border-slate-400 pb-0.5">
                  {user.etablissement_origine || "...................................................................................................."}
                </p>
              </div>
            </div>

            {/* Statut Checkboxes */}
            <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
              <div>
                <span className="font-extrabold text-slate-900 uppercase block mb-1">STATUT MINISTÉRIEL :</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className={`w-3.5 h-3.5 border border-slate-900 flex items-center justify-center font-bold text-[9px] ${user.statut_affectation === "Affecté" ? "bg-slate-900 text-white" : ""}`}>{user.statut_affectation === "Affecté" ? "✓" : ""}</span>
                    AFFECTÉ
                  </span>
                  <span className="flex items-center gap-1">
                    <span className={`w-3.5 h-3.5 border border-slate-900 flex items-center justify-center font-bold text-[9px] ${user.statut_affectation !== "Affecté" ? "bg-slate-900 text-white" : ""}`}>{user.statut_affectation !== "Affecté" ? "✓" : ""}</span>
                    NON AFFECTÉ
                  </span>
                </div>
              </div>

              <div>
                <span className="font-extrabold text-slate-900 uppercase block mb-1">REDOUBLEMENT :</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className={`w-3.5 h-3.5 border border-slate-900 flex items-center justify-center font-bold text-[9px] ${user.statut_redoublement === "Redoublant" ? "bg-slate-900 text-white" : ""}`}>{user.statut_redoublement === "Redoublant" ? "✓" : ""}</span>
                    REDOUBLANT
                  </span>
                  <span className="flex items-center gap-1">
                    <span className={`w-3.5 h-3.5 border border-slate-900 flex items-center justify-center font-bold text-[9px] ${user.statut_redoublement !== "Redoublant" ? "bg-slate-900 text-white" : ""}`}>{user.statut_redoublement !== "Redoublant" ? "✓" : ""}</span>
                    NON REDOUBLANT
                  </span>
                </div>
              </div>

              <div>
                <span className="font-extrabold text-slate-900 uppercase block mb-1">SERVICES ANNEXES :</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className={`w-3.5 h-3.5 border border-slate-900 flex items-center justify-center font-bold text-[9px] ${user.cantine ? "bg-slate-900 text-white" : ""}`}>{user.cantine ? "✓" : ""}</span>
                    CANTINE
                  </span>
                  <span className="flex items-center gap-1">
                    <span className={`w-3.5 h-3.5 border border-slate-900 flex items-center justify-center font-bold text-[9px] ${user.transport ? "bg-slate-900 text-white" : ""}`}>{user.transport ? "✓" : ""}</span>
                    TRANSPORT
                  </span>
                </div>
              </div>
            </div>

            {/* Options LV2 */}
            {user.lv2 && (
              <div className="pt-2 border-t border-slate-200 text-[10px]">
                <span className="font-extrabold text-slate-900 uppercase">OPTION OBLIGATOIRE (LV2) : </span>
                <span className="font-bold text-blue-800 ml-1">LV2 {user.lv2}</span>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: Cursus & Historique Scolaire */}
        <div className="border border-slate-400 rounded-lg overflow-hidden mb-6">
          <div className="bg-slate-900 text-white px-3 py-1.5 font-black uppercase text-[10px] tracking-wider">
            2. SCULARITÉ ET CURSUS ANTÉRIEUR
          </div>

          <div className="p-3">
            <table className="w-full border-collapse border border-slate-400 text-[10px] text-center">
              <thead>
                <tr className="bg-slate-100 font-black uppercase text-slate-700">
                  <th className="border border-slate-400 p-1.5 w-1/3 text-left">CLASSE</th>
                  <th className="border border-slate-400 p-1.5 w-1/4">ANNÉE SCOLAIRE</th>
                  <th className="border border-slate-400 p-1.5 text-left">ÉTABLISSEMENT FREQUENTÉ</th>
                </tr>
              </thead>
              <tbody>
                {["Maternelle / Primaire (CP-CM2)", "Collège (6e - 3e)", "Lycée (2nde - Tle)"].map((lvl, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="border border-slate-400 p-1.5 text-left font-bold text-slate-800">{lvl}</td>
                    <td className="border border-slate-400 p-1.5 font-mono">
                      {i === 0 ? "2024-2025" : i === 1 ? inscriptionData?.annee_scolaire || "2026-2027" : "................"}
                    </td>
                    <td className="border border-slate-400 p-1.5 text-left font-medium text-slate-700">
                      {i === 1 ? ecole?.nom || "Établissement Actuel" : user.etablissement_origine || "........................................................"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 3: Renseignements Représentant Légal */}
        <div className="border border-slate-400 rounded-lg overflow-hidden mb-6">
          <div className="bg-slate-900 text-white px-3 py-1.5 font-black uppercase text-[10px] tracking-wider">
            3. RENSEIGNEMENTS : REPRÉSENTANT LÉGAL (PÈRE / MÈRE / TUTEUR)
          </div>

          <div className="p-4 space-y-3 text-[10px]">
            <div className="flex items-center gap-6 pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-500 uppercase text-[9px]">Lien de Parenté :</span>
              <span className="flex items-center gap-1 font-bold">
                <span className={`w-3.5 h-3.5 border border-slate-900 flex items-center justify-center ${user.tuteur_type === "Père" ? "bg-slate-900 text-white" : ""}`}>{user.tuteur_type === "Père" ? "✓" : ""}</span>
                PÈRE
              </span>
              <span className="flex items-center gap-1 font-bold">
                <span className={`w-3.5 h-3.5 border border-slate-900 flex items-center justify-center ${user.tuteur_type === "Mère" ? "bg-slate-900 text-white" : ""}`}>{user.tuteur_type === "Mère" ? "✓" : ""}</span>
                MÈRE
              </span>
              <span className="flex items-center gap-1 font-bold">
                <span className={`w-3.5 h-3.5 border border-slate-900 flex items-center justify-center ${user.tuteur_type === "Tuteur" ? "bg-slate-900 text-white" : ""}`}>{user.tuteur_type === "Tuteur" ? "✓" : ""}</span>
                TUTEUR LÉGAL
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="font-bold text-slate-500 uppercase text-[9px] block">NOM &amp; PRÉNOMS :</span>
                <p className="font-bold text-slate-900 border-b border-dotted border-slate-400 pb-0.5 uppercase">
                  {user.tuteur_nom || "...................................................."}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-500 uppercase text-[9px] block">PROFESSION :</span>
                <p className="font-bold text-slate-900 border-b border-dotted border-slate-400 pb-0.5">
                  {user.tuteur_profession || "...................................................."}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-500 uppercase text-[9px] block">TÉLÉPHONE MOBILE (WHATSAPP) :</span>
                <p className="font-bold text-slate-900 border-b border-dotted border-slate-400 pb-0.5 font-mono">
                  {user.tuteur_tel_mobile || "...................................................."}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-500 uppercase text-[9px] block">ADRESSE COURRIEL (EMAIL) :</span>
                <p className="font-bold text-slate-900 border-b border-dotted border-slate-400 pb-0.5 font-mono">
                  {user.tuteur_email || "...................................................."}
                </p>
              </div>

              <div className="sm:col-span-2">
                <span className="font-bold text-slate-500 uppercase text-[9px] block">ADRESSE POSTALE ET DOMICILE :</span>
                <p className="font-bold text-slate-900 border-b border-dotted border-slate-400 pb-0.5">
                  {user.tuteur_adresse || "...................................................................................................."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Engagement Financier & Signatures */}
        <div className="border border-slate-400 rounded-lg p-4 space-y-4 text-[10px]">
          <div className="text-center font-extrabold uppercase text-slate-900 border-b border-slate-300 pb-2">
            ENGAGEMENT DU REPRÉSENTANT LÉGAL
          </div>

          <p className="leading-relaxed text-slate-700 text-center font-medium">
            Je soussigné(e), M./Mme <span className="font-bold uppercase text-slate-900 underline">{user.tuteur_nom || "................................................"}</span>, 
            m&apos;engage à honorer la totalité des frais de scolarité fixés à la somme de 
            <span className="font-black text-blue-800 text-xs mx-1">
              {inscriptionData?.montant_scolarite ? Number(inscriptionData.montant_scolarite).toLocaleString("fr-FR") + " FCFA" : ".................... FCFA"}
            </span>
            pour l&apos;élève <span className="font-bold uppercase text-slate-900 underline">{user.nom || "................................"}</span> inscrit(e) en classe de <span className="font-bold text-blue-800">{classe.nom || "............"}</span>.
          </p>

          <div className="pt-6 grid grid-cols-2 gap-8 text-center text-[10px]">
            <div>
              <p className="font-bold text-slate-500">Fait à ................................., le ...../...../20....</p>
              <p className="font-extrabold text-slate-900 uppercase mt-2">Signature du Représentant Légal :</p>
              <div className="h-16 border border-dashed border-slate-300 mt-2 rounded flex items-center justify-center text-slate-400 italic text-[9px]">
                Mention manuscrite &quot;Lu et approuvé&quot;
              </div>
            </div>

            <div>
              <p className="font-bold text-slate-500">Service Scolarité — Visa / Cachet :</p>
              <p className="font-extrabold text-slate-900 uppercase mt-2">Enregistré et Validé par :</p>
              <div className="h-16 border border-slate-400 mt-2 rounded flex flex-col items-center justify-center bg-slate-50">
                <span className="font-bold text-slate-800 uppercase text-[9px]">ÉTABLISSEMENT {ecole?.nom || "MONÉCOLE+"}</span>
                <span className="text-[8px] text-emerald-700 font-mono font-bold mt-1">✓ FICHE D&apos;INSCRIPTION VALIDÉE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  )

  return (
    <div className="space-y-6">
      {/* Printable Controls Bar (Hidden on Print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 text-white rounded-2xl shadow-xl no-print print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white">Fiche Officielle d&apos;Inscription ou Réinscription</h3>
            <p className="text-xs text-slate-400">Élève: {user.nom || "N/A"} — Matricule: {user.matricule || "Non attribué"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={handlePrint}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimer / Télécharger PDF
          </Button>
        </div>
      </div>

      {/* Screen View Inside Modal */}
      {formSheetContent}

      {/* Print Portal Container Outside Modal DOM Tree */}
      <DocumentPrintContainer pageSize="a4" orientation="portrait">
        {formSheetContent}
      </DocumentPrintContainer>
    </div>
  )
}
