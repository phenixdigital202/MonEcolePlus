"use client"

import React from "react"
import { numberToFrenchWords } from "@/lib/utils"

interface PaymentReceiptDocumentProps {
  payment: any
  schoolInfo: any
  totalPaidByStudent?: number
  printFormat?: "A5" | "A4"
}

export function PaymentReceiptDocument({
  payment,
  schoolInfo,
  totalPaidByStudent,
  printFormat = "A4"
}: PaymentReceiptDocumentProps) {
  if (!payment) return null

  const isA4 = printFormat === "A4"
  const student = payment.user || {}
  const inscriptions: any[] = student.inscriptions || []

  // 1. Precise academic year tracing for historical or current payment
  const paymentDate = payment.date_paiement ? new Date(payment.date_paiement) : new Date()
  const pYear = paymentDate.getFullYear()
  const pMonth = paymentDate.getMonth() + 1
  const inferredAcademicYear = pMonth >= 9 ? `${pYear}-${pYear + 1}` : `${pYear - 1}-${pYear}`

  const matchingInscription =
    (payment.id_inscription && inscriptions.find((ins) => ins.id === payment.id_inscription)) ||
    inscriptions.find((ins) => ins.annee_scolaire === inferredAcademicYear) ||
    inscriptions.find((ins) => {
      if (!ins.startDate) return false
      const s = new Date(ins.startDate)
      const e = ins.endDate ? new Date(ins.endDate) : new Date()
      return paymentDate >= s && paymentDate <= e
    }) ||
    inscriptions.find((ins) => ins.statut === "active") ||
    inscriptions[0]

  const studentClass = matchingInscription?.classe?.nom || "Non assignée"
  const academicYear = matchingInscription?.annee_scolaire || inferredAcademicYear

  const parent = student.parentEleveAsEleve?.[0]?.parent
  const parentName = parent?.nom || "—"

  // Receipt Number format: REC-000001-2026
  const receiptNumber = `REC-${String(payment.id).padStart(6, '0')}-${paymentDate.getFullYear()}`

  const amountNumber = Number(payment.montant || 0)
  const amountInWords = numberToFrenchWords(amountNumber)
  const paymentDateFormatted = payment.date_paiement
    ? new Date(payment.date_paiement).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      })
    : new Date().toLocaleDateString("fr-FR")

  const generationDateFormatted = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })

  // Format payment mode
  let modePaiement = "ESPÈCES"
  if (payment.provider) {
    const prov = payment.provider.toLowerCase()
    if (prov.includes("orange")) modePaiement = "MOBILE MONEY (Orange Money)"
    else if (prov.includes("mtn")) modePaiement = "MOBILE MONEY (MTN MoMo)"
    else if (prov.includes("wave")) modePaiement = "MOBILE MONEY (Wave)"
    else if (prov.includes("moov")) modePaiement = "MOBILE MONEY (Moov Money)"
    else if (prov.includes("virement")) modePaiement = "VIREMENT BANCAIRE"
    else if (prov.includes("cheque") || prov.includes("chèque")) modePaiement = "CHÈQUE BANCAIRE"
    else modePaiement = payment.provider.toUpperCase().replace("_", " ")
  }

  // Payment status label & colors
  const status = (payment.status || "paye").toLowerCase()
  const isPaid = status === "paye" || status === "payé"
  const isPending = status === "en_attente"

  return (
    <div
      id="printable-document"
      className={`printable-area ${
        isA4 
          ? "print-page-a4 w-full max-w-[210mm] min-h-[280mm] p-8 sm:p-10 text-sm" 
          : "print-page-a5 w-full max-w-[148mm] p-6 text-xs"
      } mx-auto bg-white border border-slate-200 text-slate-900 shadow-sm print:shadow-none print:border-none print:p-0 print:m-0 font-sans leading-relaxed box-border flex flex-col justify-between`}
    >
      <div className={isA4 ? "space-y-6" : "space-y-3"}>
        {/* HEADER SECTION */}
        <div className={`flex items-start justify-between border-b-2 border-slate-900 gap-4 ${isA4 ? "pb-4" : "pb-3"}`}>
          {/* LOGO */}
          <div className="flex-shrink-0">
            {schoolInfo?.logo_url ? (
              <img
                src={schoolInfo.logo_url}
                alt="Logo Établissement"
                className={isA4 ? "h-20 w-auto max-w-[140px] object-contain" : "h-14 w-auto max-w-[110px] object-contain"}
              />
            ) : (
              <div className={`${isA4 ? "h-16 w-16 text-xl" : "h-12 w-12 text-lg"} rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black tracking-tighter`}>
                M+
              </div>
            )}
          </div>

          {/* SCHOOL INFORMATION */}
          <div className="flex-1 text-center space-y-1">
            <h1 className={`${isA4 ? "text-lg sm:text-xl" : "text-sm"} font-black uppercase tracking-tight text-slate-950`}>
              {schoolInfo?.nom || "ÉTABLISSEMENT SCOLAIRE DE CÔTE D'IVOIRE"}
            </h1>
            <p className={`${isA4 ? "text-[10px]" : "text-[8px]"} font-semibold text-slate-500 uppercase tracking-widest`}>
              République de Côte d'Ivoire &bull; Union - Discipline - Travail
            </p>
            <div className={`${isA4 ? "text-xs" : "text-[9px]"} text-slate-600 space-x-2 pt-0.5`}>
              {schoolInfo?.adresse && <span>{schoolInfo.adresse}</span>}
              {schoolInfo?.telephone && <span>&bull; Tél: {schoolInfo.telephone}</span>}
              {schoolInfo?.email && <span>&bull; Email: {schoolInfo.email}</span>}
            </div>
          </div>

          {/* RIGHT BADGE / REPUBLIQUE */}
          <div className="flex-shrink-0 text-right block">
            <span className={`inline-block ${isA4 ? "text-xs px-3 py-1" : "text-[8px] px-2 py-0.5"} font-bold text-slate-600 border border-slate-300 rounded-md uppercase bg-slate-50`}>
              Année {academicYear}
            </span>
          </div>
        </div>

        {/* DOCUMENT TITLE & RECEIPT NUMBER */}
        <div className="py-2 text-center space-y-1.5">
          <h2 className={`${isA4 ? "text-xl sm:text-2xl" : "text-base"} font-black text-slate-900 uppercase tracking-wider`}>
            REÇU OFFICIEL DE PAIEMENT
          </h2>
          <div className={`inline-block bg-slate-100 text-slate-800 font-mono font-bold ${isA4 ? "px-4 py-1 text-sm border-2" : "px-3 py-0.5 text-xs border"} rounded-lg border-slate-300`}>
            N° {receiptNumber}
          </div>
        </div>

        {/* GRID 2 COLUMNS: STUDENT INFO & REGULATION DETAILS */}
        <div className={`grid grid-cols-2 ${isA4 ? "gap-6 my-4" : "gap-3 my-2"}`}>
          {/* BLOCK 1: INFORMATIONS ÉLÈVE */}
          <div className={`border border-slate-200 rounded-2xl ${isA4 ? "p-4 space-y-2.5" : "p-2.5 space-y-1.5"} bg-slate-50/50`}>
            <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
              <span className={`font-black ${isA4 ? "text-xs" : "text-[9px]"} text-slate-900 uppercase tracking-wider`}>
                INFORMATIONS DE L'ÉLÈVE
              </span>
              <span className={`${isA4 ? "text-xs" : "text-[8px]"} text-slate-400 font-mono`}>BÉNÉFICIAIRE</span>
            </div>

            <div className={`space-y-1.5 ${isA4 ? "text-xs sm:text-sm" : "text-[11px]"}`}>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Nom & Prénom :</span>
                <span className="font-bold text-slate-950">{student.nom || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Matricule :</span>
                <span className="font-mono font-semibold text-slate-800">
                  {student.id ? `MAT-${student.id}` : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Classe :</span>
                <span className="font-bold text-primary">{studentClass}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Année Scolaire :</span>
                <span className="font-medium text-slate-800">{academicYear}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Parent / Tuteur :</span>
                <span className="font-semibold text-slate-800">{parentName}</span>
              </div>
            </div>
          </div>

          {/* BLOCK 2: DÉTAIL DU RÈGLEMENT */}
          <div className={`border border-slate-200 rounded-2xl ${isA4 ? "p-4 space-y-2.5" : "p-2.5 space-y-1.5"} bg-slate-50/50`}>
            <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
              <span className={`font-black ${isA4 ? "text-xs" : "text-[9px]"} text-slate-900 uppercase tracking-wider`}>
                DÉTAIL DU RÈGLEMENT
              </span>
              <span className={`${isA4 ? "text-xs" : "text-[8px]"} text-slate-400 font-mono`}>TRANSACTION</span>
            </div>

            <div className={`space-y-1.5 ${isA4 ? "text-xs sm:text-sm" : "text-[11px]"}`}>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Motif du Règlement :</span>
                <span className="font-black uppercase text-slate-900">{payment.type || "SCOLARITÉ"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Mode de Paiement :</span>
                <span className="font-bold text-slate-800">{modePaiement}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Réf. Transaction :</span>
                <span className="font-mono text-slate-700">{payment.transactionRef || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Date de Règlement :</span>
                <span className="font-bold text-slate-900">{paymentDateFormatted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Date d'Émission :</span>
                <span className="text-slate-600">{generationDateFormatted}</span>
              </div>
            </div>
          </div>
        </div>

        {/* BLOCK 3: MONTANT RÉGLÉ & STATUT */}
        <div className={`border-2 border-slate-900 rounded-2xl ${isA4 ? "p-5 my-4" : "p-3 my-2"} bg-slate-900 text-white flex flex-row items-center justify-between gap-4`}>
          <div className="space-y-1 text-left">
            <span className={`${isA4 ? "text-xs" : "text-[9px]"} font-bold uppercase tracking-widest text-slate-400`}>
              MONTANT RÉGLÉ
            </span>
            <div className={`${isA4 ? "text-2xl sm:text-3xl" : "text-xl"} font-black tracking-tight text-emerald-400`}>
              {amountNumber.toLocaleString("fr-FR")} FCFA
            </div>
            <div className={`${isA4 ? "text-xs" : "text-[10px]"} italic text-slate-300 font-medium`}>
              Montant en lettres : <span className="font-bold text-white uppercase">{amountInWords}</span>
            </div>
          </div>

          <div className="flex-shrink-0 text-center">
            <div
              className={`border-2 border-dashed ${isA4 ? "px-4 py-2 text-xs" : "px-3 py-1.5 text-[10px]"} rounded-xl text-center uppercase tracking-widest font-black ${
                isPaid
                  ? "border-emerald-400 text-emerald-300 bg-emerald-950/60"
                  : isPending
                  ? "border-amber-400 text-amber-300 bg-amber-950/60"
                  : "border-rose-400 text-rose-300 bg-rose-950/60"
              }`}
            >
              {isPaid ? "STATUT : PAYÉ" : isPending ? "STATUT : EN ATTENTE" : "STATUT : ANNULÉ"}
            </div>
          </div>
        </div>

        {/* FINANCIAL CONTEXT SUMMARY IF AVAILABLE */}
        {typeof totalPaidByStudent === "number" && totalPaidByStudent > 0 && (
          <div className={`${isA4 ? "p-3.5 text-xs" : "px-3 py-1.5 text-[10px]"} bg-slate-100 rounded-xl text-slate-700 flex justify-between items-center border border-slate-200`}>
            <span className="font-medium text-slate-600">
              Cumul des versements validés enregistrés pour cet élève :
            </span>
            <span className="font-bold text-slate-900">{totalPaidByStudent.toLocaleString("fr-FR")} FCFA</span>
          </div>
        )}

        {/* OFFICIAL ATTESTATION TEXT */}
        <div className={`${isA4 ? "p-3.5 text-xs" : "p-2 text-[9px]"} text-slate-600 text-center italic bg-slate-50 rounded-xl border border-slate-200`}>
          "Le présent reçu atteste du règlement du montant indiqué ci-dessus et constitue une preuve officielle de paiement enregistrée dans le système de gestion de l'établissement."
        </div>

        {/* SIGNATURE & CACHET SECTION */}
        <div className={`grid grid-cols-2 gap-6 ${isA4 ? "pt-6 mt-6" : "pt-2 mt-2"} border-t border-slate-200`}>
          {/* SIGNATURE */}
          <div className="text-center space-y-8">
            <span className={`font-bold ${isA4 ? "text-xs" : "text-[9px]"} text-slate-800 uppercase tracking-wider block`}>
              SIGNATURE DU RESPONSABLE
            </span>
            <div className={`${isA4 ? "h-14" : "h-8"} flex items-end justify-center`}>
              <div className={`${isA4 ? "w-48" : "w-32"} border-b border-slate-400`}></div>
            </div>
          </div>

          {/* CACHET OFFICIEL */}
          <div className="text-center space-y-2">
            <span className={`font-bold ${isA4 ? "text-xs" : "text-[9px]"} text-slate-800 uppercase tracking-wider block`}>
              CACHET DE L'ÉTABLISSEMENT
            </span>
            <div className={`${isA4 ? "h-20" : "h-14"} flex items-center justify-center`}>
              {schoolInfo?.cachet_url ? (
                <img
                  src={schoolInfo.cachet_url}
                  alt="Cachet de l'établissement"
                  className={`${isA4 ? "h-20 max-w-[160px]" : "h-14 max-w-[120px]"} w-auto object-contain mx-auto`}
                />
              ) : (
                <div className={`border-2 border-dashed border-slate-300 rounded-xl ${isA4 ? "h-16 w-44 text-xs" : "h-12 w-32 text-[8px]"} flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest`}>
                  Zone Cachet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DISCREET FOOTER */}
      <div className={`pt-4 border-t border-slate-200 ${isA4 ? "text-xs" : "text-[8px]"} text-slate-400 flex flex-row justify-between items-center gap-2 text-left`}>
        <div>
          Document officiel généré par <span className="font-bold text-slate-700">MonÉcole+</span> &bull; Plateforme de Gestion Scolaire
        </div>
        <div>Édité le {generationDateFormatted}</div>
      </div>
    </div>
  )
}
