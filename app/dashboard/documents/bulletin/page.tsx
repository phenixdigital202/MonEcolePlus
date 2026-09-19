"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  Download, 
  Printer, 
  LineChart as LineChartIcon,
  TrendingUp,
  CheckCircle2,
  QrCode,
  Building2,
  ArrowLeft,
  Loader2,
  ChevronRight
} from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { getClasses } from "@/lib/grades-actions"
import { getBulletinFullClassDataAction, getSchoolInfoAction } from "@/lib/documents-actions"
import { DocumentPrintContainer } from "@/components/documents/document-print-container"
import { downloadDocumentAsPdf } from "@/lib/pdf-export-utils"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"

interface BulletinTemplateProps {
  student: any
  schoolInfo: any
  selectedSemester: string
  templateStyle: "classique" | "premium" | "ministere" | "custom"
}

function BulletinTemplate({ student, schoolInfo, selectedSemester, templateStyle }: BulletinTemplateProps) {
  if (!student) return null

  const activeYear = schoolInfo?.activeSchoolYear || "2026-2027"

  return (
    <>
      {/* 1. MODEL CLASSIQUE (Standard A4 Full Page) */}
      {templateStyle === "classique" && (
        <div
          id="printable-document"
          className="printable-area print-page-a4 w-full max-w-[210mm] min-h-[280mm] mx-auto bg-white p-8 sm:p-10 border-4 border-slate-200 text-slate-900 font-sans shadow-sm print:shadow-none print:border-none box-border flex flex-col justify-between"
        >
          <div className="space-y-6">
            {/* Header Branding */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
              <div className="flex gap-4 items-center">
                <div className="h-16 w-16 bg-primary flex items-center justify-center text-white rounded-2xl font-bold overflow-hidden p-1">
                  {schoolInfo.logo_url ? (
                    <img src={schoolInfo.logo_url} alt="Logo Établissement" className="h-full w-full object-contain" />
                  ) : (
                    <Building2 className="h-8 w-8" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-black uppercase text-slate-900">{schoolInfo.nom}</h2>
                  <p className="text-xs font-bold text-slate-600">{schoolInfo.adresse} {schoolInfo.telephone && `| ${schoolInfo.telephone}`}</p>
                  <p className="text-xs text-primary italic font-semibold">&quot;L&apos;Excellence est notre engagement&quot;</p>
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-xl md:text-2xl font-black italic text-slate-900">BULLETIN SCOLAIRE</h1>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">
                  Trimestre {selectedSemester} &bull; Année {activeYear}
                </p>
              </div>
            </div>

            {/* Student Metadata Table */}
            <div className="grid grid-cols-4 gap-3 mb-4 text-xs sm:text-sm bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>ÉLÈVE : <span className="font-black text-slate-900 uppercase">{student.nom}</span></div>
              <div>CLASSE : <span className="font-black text-slate-900">{student.classNom}</span></div>
              <div>EFFECTIF : <span className="font-black text-slate-900">{student.totalStudents}</span></div>
              <div className="text-right">RANG : <span className="font-black text-primary">#{student.rank}</span></div>
            </div>

            {/* Subjects Grid */}
            <table className="w-full border-collapse border border-slate-300 text-xs sm:text-sm mb-4">
              <thead className="bg-slate-100 uppercase font-black text-slate-700">
                <tr>
                  <th className="border border-slate-300 p-2.5 text-left">Matières</th>
                  <th className="border border-slate-300 p-2.5 text-center">Coef</th>
                  <th className="border border-slate-300 p-2.5 text-center">Moyenne / 20</th>
                  <th className="border border-slate-300 p-2.5 text-left">Appréciation du Professeur</th>
                </tr>
              </thead>
              <tbody>
                {student.subjects?.map((m: any, i: number) => (
                  <tr key={i} className="border-b border-slate-200">
                    <td className="border border-slate-300 p-2.5 font-bold text-slate-900">{m.name}</td>
                    <td className="border border-slate-300 p-2.5 text-center">{m.coef}</td>
                    <td className="border border-slate-300 p-2.5 text-center font-black text-primary bg-primary/5">{m.avg.toFixed(2)}</td>
                    <td className="border border-slate-300 p-2.5 text-xs italic text-slate-600">{m.feedback}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="grid grid-cols-2 gap-6 mb-4">
              <div className="space-y-3">
                <div className="p-4 border border-slate-300 bg-slate-50 text-center rounded-2xl">
                  <p className="text-xs uppercase font-bold text-slate-500">Moyenne Générale</p>
                  <p className="text-3xl font-black text-slate-900">{student.overallAvg.toFixed(2)} / 20</p>
                </div>
                <div className="p-3 border border-slate-300 rounded-2xl text-xs">
                  <p className="font-bold text-slate-600">Assiduité & Absences :</p>
                  <p className="text-slate-800 font-bold mt-1">{student.totalAbsences} absence(s) enregistrée(s)</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 border border-slate-300 bg-primary/10 text-center rounded-2xl">
                  <p className="text-xs uppercase font-bold text-primary">Rang de Classe</p>
                  <p className="text-3xl font-black text-primary">#{student.rank} <span className="text-xs font-bold text-slate-500">/ {student.totalStudents}</span></p>
                </div>
                <div className="p-3 border border-slate-300 rounded-2xl min-h-[60px] text-xs">
                  <p className="font-bold text-slate-600 mb-1">Décision du Conseil de Classe :</p>
                  <p className="font-bold italic text-slate-900">{student.decision}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer & Signatures */}
          <div className="flex justify-between items-end border-t border-slate-200 pt-6 mt-4">
            <div className="flex gap-3 items-center">
              <QrCode className="h-14 w-14 text-slate-900" />
              <p className="text-[9px] font-mono leading-tight text-slate-500">DOCUMENT SÉCURISÉ<br/>ID : BULLETIN-2026-X89<br/>Vérifié par MonÉcole+</p>
            </div>
            <div className="text-center w-56">
              <p className="text-xs font-black uppercase mb-8 text-slate-800">Cachet & Signature du Directeur</p>
              {schoolInfo.cachet_url ? (
                <div className="relative mx-auto h-20 w-32 flex items-center justify-center -rotate-6">
                  <img src={schoolInfo.cachet_url} alt="Cachet Officiel" className="h-20 w-32 object-contain" />
                </div>
              ) : (
                <div className="relative mx-auto h-16 w-32 border-2 border-dashed border-rose-600/40 rounded-xl flex items-center justify-center -rotate-6">
                  <p className="text-[7px] font-black text-rose-600 text-center uppercase tracking-widest opacity-60">DIRECTION GENERALE<br/>AUTHENTIFIÉ</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. MODEL PREMIUM (Stripe / Canva style A4 Full Page) */}
      {templateStyle === "premium" && (
        <div
          id="printable-document"
          className="printable-area print-page-a4 w-full max-w-[210mm] min-h-[280mm] mx-auto bg-white p-8 sm:p-10 border border-slate-200 text-slate-800 font-sans shadow-sm print:shadow-none print:border-none box-border flex flex-col justify-between relative"
        >
          {/* Subtle Premium Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03] rotate-12">
            <p className="text-9xl font-black tracking-widest text-slate-900">OFFICIEL</p>
          </div>

          <div className="space-y-6 relative z-10">
            {/* Top layout */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-bold overflow-hidden p-1">
                    {schoolInfo.logo_url ? (
                      <img src={schoolInfo.logo_url} alt="Logo Établissement" className="h-full w-full object-contain" />
                    ) : (
                      <Building2 className="h-7 w-7" />
                    )}
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-wider text-slate-900">{schoolInfo.nom}</h2>
                </div>
                <p className="text-xs text-slate-500 font-medium">{schoolInfo.adresse} {schoolInfo.telephone && `• ${schoolInfo.telephone}`} {schoolInfo.email && `• ${schoolInfo.email}`}</p>
              </div>
              <div className="text-right space-y-1.5">
                <span className="text-xs font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-100">
                  Bulletin de Notes
                </span>
                <p className="text-xs font-bold text-slate-500 mt-1">Trimestre {selectedSemester} &bull; Année {activeYear}</p>
              </div>
            </div>

            {/* Student Metadata Card */}
            <div className="grid grid-cols-4 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/80 mb-6 text-xs sm:text-sm">
              <div>
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Élève</p>
                <p className="font-extrabold text-slate-900 text-sm mt-0.5 uppercase">{student.nom}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">Classe</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{student.classNom}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">Effectif</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{student.totalStudents} élèves</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">Rang de Classe</p>
                <p className="font-extrabold text-indigo-600 text-sm mt-0.5">#{student.rank}</p>
              </div>
            </div>

            {/* Table without vertical borders */}
            <table className="w-full text-xs sm:text-sm text-left mb-6">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-400 uppercase tracking-widest font-black text-[9px] pb-3">
                  <th className="py-3 font-bold">Matière</th>
                  <th className="py-3 text-center font-bold">Coeff.</th>
                  <th className="py-3 text-center font-bold">Moyenne / 20</th>
                  <th className="py-3 pl-4 font-bold">Appréciation & Observations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {student.subjects?.map((m: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-3.5 font-bold text-slate-950">{m.name}</td>
                    <td className="py-3.5 text-center text-slate-500 font-medium">{m.coef}</td>
                    <td className="py-3.5 text-center font-extrabold text-slate-900 bg-slate-50 rounded-xl px-2">{m.avg.toFixed(2)}</td>
                    <td className="py-3.5 pl-4 text-slate-500 italic leading-relaxed">{m.feedback}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Performance Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-5 bg-slate-900 text-white rounded-2xl flex flex-col justify-between">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Moyenne Générale</p>
                <p className="text-3xl font-black tracking-tight mt-2">{student.overallAvg.toFixed(2)} <span className="text-xs font-bold text-slate-400">/ 20</span></p>
              </div>
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Décision</p>
                <p className="text-sm font-extrabold text-slate-800 mt-2 italic">&quot;{student.decision}&quot;</p>
              </div>
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Assiduité</p>
                <p className="text-sm font-bold text-slate-800 mt-2">{student.totalAbsences} absence(s)</p>
              </div>
            </div>
          </div>

          {/* Premium Footer with QR Code and Hand Signature */}
          <div className="flex justify-between items-end border-t border-slate-200 pt-6 mt-4 relative z-10">
            <div className="flex gap-4 items-center">
              <div className="p-1 border rounded-xl bg-slate-50">
                <QrCode className="h-12 w-12 text-slate-800" />
              </div>
              <div className="text-[8px] font-mono text-slate-400 leading-normal uppercase">
                <p className="font-extrabold text-slate-600">Document Authentique</p>
                <p>ID: {student.id || `B-${Date.now().toString().substring(7)}`}</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Direction des Études</p>
              <div className="relative h-16 w-36 mx-auto flex items-center justify-center">
                {schoolInfo.cachet_url ? (
                  <img src={schoolInfo.cachet_url} alt="Cachet Officiel" className="h-16 w-auto object-contain mx-auto" />
                ) : (
                  <>
                    <svg className="absolute inset-0 text-indigo-700 opacity-80" viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10,25 C30,10 50,40 70,20 C85,5 90,30 95,25 C80,30 40,45 20,35" />
                    </svg>
                    <div className="absolute h-14 w-14 border border-dashed border-rose-600/30 rounded-full flex items-center justify-center rotate-12 opacity-60">
                      <span className="text-[5px] font-black text-rose-600 uppercase text-center tracking-tighter">DIRECTION<br/>DE L'ECOLE</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. MODEL MINISTERE (Official Governmental A4 Full Page) */}
      {templateStyle === "ministere" && (
        <div
          id="printable-document"
          className="printable-area print-page-a4 w-full max-w-[210mm] min-h-[280mm] mx-auto bg-white p-8 sm:p-10 border-4 border-slate-900 text-slate-900 font-serif shadow-sm print:shadow-none print:border-none box-border flex flex-col justify-between"
        >
          <div className="space-y-6">
            {/* Ministry Header */}
            <div className="grid grid-cols-3 border-b-4 border-slate-900 pb-4 mb-4 items-start text-xs sm:text-sm">
              <div>
                <p className="font-black tracking-wide">RÉPUBLIQUE DE CÔTE D'IVOIRE</p>
                <p className="text-[9px] font-medium leading-tight text-slate-600 mt-1">Ministère de l'Éducation Nationale et de l'Alphabétisation</p>
                <p className="font-bold text-slate-800 mt-2 uppercase">DRENA: ABIDJAN 1</p>
              </div>
              <div className="text-center flex flex-col items-center">
                <div className="h-10 w-10 border-2 border-slate-800 rounded-full flex items-center justify-center font-bold text-[8px] tracking-tighter uppercase p-1">
                  M+
                </div>
                <span className="text-[8px] font-black tracking-widest mt-1">UNION &bull; DISCIPLINE &bull; TRAVAIL</span>
              </div>
              <div className="text-right flex flex-col items-end">
                {schoolInfo.logo_url && (
                  <img src={schoolInfo.logo_url} alt="Logo Établissement" className="h-10 w-10 object-contain mb-1" />
                )}
                <h2 className="text-sm font-extrabold uppercase">{schoolInfo.nom}</h2>
                <p className="text-[9px] text-slate-500">{schoolInfo.adresse}</p>
                <p className="text-[9px] font-bold text-slate-700">{schoolInfo.telephone}</p>
              </div>
            </div>

            <div className="text-center my-4">
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-900 underline underline-offset-4">
                BULLETIN DE NOTES DU {selectedSemester}e TRIMESTRE
              </h1>
              <p className="text-xs font-bold text-slate-600 mt-1.5">
                ANNÉE SCOLAIRE : {activeYear}
              </p>
            </div>

            {/* Student Details */}
            <div className="border border-slate-400 p-4 rounded-xl mb-4 text-xs sm:text-sm grid grid-cols-2 gap-4 bg-slate-50/50">
              <div>
                <p>Nom & Prénom(s) : <strong className="uppercase">{student.nom}</strong></p>
                <p className="mt-1">Classe : <strong>{student.classNom}</strong></p>
              </div>
              <div className="text-right">
                <p>Rang : <strong>{student.rank} sur {student.totalStudents}</strong></p>
                <p className="mt-1">Moyenne Générale : <strong>{student.overallAvg.toFixed(2)} / 20</strong></p>
              </div>
            </div>

            {/* Government Grid Table */}
            <table className="w-full border-collapse border-2 border-slate-800 text-xs sm:text-sm mb-4">
              <thead className="bg-slate-100 font-bold uppercase text-slate-800 text-center border-b-2 border-slate-800">
                <tr>
                  <th className="border border-slate-400 p-2.5 text-left">Disciplines</th>
                  <th className="border border-slate-400 p-2.5">Coef</th>
                  <th className="border border-slate-400 p-2.5">Moyenne / 20</th>
                  <th className="border border-slate-400 p-2.5">Appréciations & Décisions</th>
                </tr>
              </thead>
              <tbody>
                {student.subjects?.map((m: any, i: number) => (
                  <tr key={i} className="border-b border-slate-400">
                    <td className="border border-slate-400 p-2.5 font-bold">{m.name}</td>
                    <td className="border border-slate-400 p-2.5 text-center">{m.coef}</td>
                    <td className="border border-slate-400 p-2.5 text-center font-extrabold">{m.avg.toFixed(2)}</td>
                    <td className="border border-slate-400 p-2.5 italic pl-4 text-slate-700">{m.feedback}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Ministry footer stamp */}
          <div className="grid grid-cols-2 gap-8 mt-6 pt-4 border-t-2 border-slate-800 text-xs sm:text-sm">
            <div>
              <p className="font-bold uppercase tracking-wider text-slate-600">Décision d'orientation :</p>
              <p className="font-extrabold italic mt-2 text-slate-900">&quot;{student.decision}&quot;</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-800 uppercase">Le Principal de l'Établissement</p>
              <div className="relative mx-auto mt-4 h-20 w-36 border-2 border-rose-600 rounded-2xl flex items-center justify-center rotate-3">
                {schoolInfo.cachet_url ? (
                  <img src={schoolInfo.cachet_url} alt="Cachet Officiel" className="h-16 w-auto object-contain" />
                ) : (
                  <p className="text-[7px] font-black text-rose-600 text-center uppercase tracking-wider">MINISTÈRE DE L'ÉDUCATION<br/>CACHET OFFICIEL</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODEL CUSTOMIZABLE (Branded accent A4 Full Page) */}
      {templateStyle === "custom" && (
        <div
          id="printable-document"
          className="printable-area print-page-a4 w-full max-w-[210mm] min-h-[280mm] mx-auto bg-white p-8 sm:p-10 border-t-8 border-indigo-600 border-x border-b border-slate-200 text-slate-900 font-sans shadow-sm print:shadow-none print:border-none box-border flex flex-col justify-between"
        >
          <div className="space-y-6">
            {/* Branded Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-bold overflow-hidden p-1">
                  {schoolInfo.logo_url ? (
                    <img src={schoolInfo.logo_url} alt="Logo Établissement" className="h-full w-full object-contain" />
                  ) : (
                    <Building2 className="h-7 w-7" />
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">{schoolInfo.nom}</h3>
                  <p className="text-xs text-slate-500">{schoolInfo.adresse} {schoolInfo.telephone && `• ${schoolInfo.telephone}`}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-4 py-1.5 rounded-xl text-xs font-bold uppercase">
                  Trimestre {selectedSemester} &bull; {activeYear}
                </span>
              </div>
            </div>

            {/* Student Badge Card */}
            <div className="p-6 bg-indigo-600/5 rounded-2xl my-4 flex justify-between items-center border border-indigo-100">
              <div>
                <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Élève Beneficiaire</p>
                <h2 className="text-xl font-black text-slate-900 mt-1 uppercase">{student.nom}</h2>
                <p className="text-xs font-semibold text-slate-600 mt-1">Classe: {student.classNom} &bull; Rang: #{student.rank}/{student.totalStudents}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Moyenne Trimestrielle</p>
                <h2 className="text-3xl font-black text-indigo-600 mt-1">{student.overallAvg.toFixed(2)} / 20</h2>
              </div>
            </div>

            {/* Simple table style */}
            <table className="w-full text-xs sm:text-sm text-left mb-6">
              <thead>
                <tr className="border-b-2 border-slate-200 text-slate-400 uppercase tracking-widest font-black text-[9px] pb-3">
                  <th className="py-3">Matière</th>
                  <th className="py-3 text-center">Coeff</th>
                  <th className="py-3 text-center">Note / 20</th>
                  <th className="py-3 pl-4">Observations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {student.subjects?.map((m: any, i: number) => (
                  <tr key={i}>
                    <td className="py-3.5 font-bold text-slate-900">{m.name}</td>
                    <td className="py-3.5 text-center text-slate-500">{m.coef}</td>
                    <td className="py-3.5 text-center font-extrabold text-indigo-600 bg-indigo-50/50 rounded-xl px-2">{m.avg.toFixed(2)}</td>
                    <td className="py-3.5 pl-4 text-slate-500 italic">{m.feedback}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Custom signatures */}
          <div className="flex justify-between items-end border-t border-slate-200 pt-6 mt-4">
            <div className="flex gap-3 items-center">
              <QrCode className="h-12 w-12 text-slate-800" />
              <p className="text-[9px] font-mono text-slate-400">ID: B-CUSTOM-2026<br/>Vérifié en Ligne par MonÉcole+</p>
            </div>
            <div className="text-center w-52 border border-slate-200 bg-slate-50 p-4 rounded-2xl">
              <p className="text-xs font-black uppercase tracking-widest text-slate-600 mb-4">La Direction</p>
              <div className="h-12 flex items-center justify-center text-xs italic text-slate-500">
                {schoolInfo.cachet_url ? (
                  <img src={schoolInfo.cachet_url} alt="Cachet Officiel" className="h-12 w-auto object-contain mx-auto" />
                ) : (
                  "Signé électroniquement"
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function BulletinBatchPage() {
  const searchParams = useSearchParams()
  const classIdParam = searchParams.get("classId")
  const [step, setStep] = useState<"select" | "preview">("select")
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedSemester, setSelectedSemester] = useState("1")
  const [isLoadingClasses, setIsLoadingClasses] = useState(true)
  const [isCalculating, setIsCalculating] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(0)
  const [selectedTemplateStyle, setSelectedTemplateStyle] = useState<"classique" | "premium" | "ministere" | "custom">("classique")
  const [schoolInfo, setSchoolInfo] = useState<any>({
    nom: "MonÉcole+ Groupe Scolaire",
    adresse: "Abidjan, Côte d'Ivoire",
    telephone: "+225 07 00 00 00 00",
    email: "contact@monecoleplus.ci"
  })

  useEffect(() => {
    const initData = async () => {
      setIsLoadingClasses(true)
      const [clsList, schInfo] = await Promise.all([
        getClasses(),
        getSchoolInfoAction()
      ])
      setClasses(clsList)
      if (classIdParam && clsList.some((c: any) => c.id.toString() === classIdParam)) {
        setSelectedClass(classIdParam)
      } else if (clsList.length > 0) {
        setSelectedClass(clsList[0].id.toString())
      }
      if (schInfo.success) setSchoolInfo(schInfo.data)
      setIsLoadingClasses(false)
    }
    initData()
  }, [classIdParam])

  const handleGenerate = async () => {
    if (!selectedClass) return toast.error("Veuillez choisir une classe")
    setIsCalculating(true)
    
    const res = await getBulletinFullClassDataAction(parseInt(selectedClass), selectedSemester)
    if (res.success && res.data) {
      setReportData(res.data)
      setSelectedStudentIndex(0)
      setStep("preview")
      toast.success(`Bulletins générés pour ${res.data.students.length} élève(s) !`)
    } else {
      toast.error(res.error || "Erreur lors du calcul des bulletins")
    }
    setIsCalculating(false)
  }

  const handlePrint = () => {
    window.print()
  }

  const currentStudent = reportData?.students?.[selectedStudentIndex]

  return (
    <>
      <DashboardHeader 
        title="Bulletin de Notes SaaS" 
        subtitle="Générez des bulletins premium calculés en direct sur la base de données"
      />
      
      <main className="p-4 md:p-8 max-w-6xl mx-auto">
        {step === "select" ? (
          <div className="max-w-2xl mx-auto space-y-8 py-6">
            <Card className="border-primary/20 shadow-2xl relative overflow-hidden rounded-3xl bg-white">
               <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                  <TrendingUp className="h-24 w-24 text-primary" />
               </div>
               <CardHeader>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    Génération des Bulletins
                  </CardTitle>
               </CardHeader>
               <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Classe</label>
                      <Select value={selectedClass} onValueChange={setSelectedClass} disabled={isLoadingClasses}>
                        <SelectTrigger className="h-12 border-slate-200 rounded-2xl">
                          <SelectValue placeholder={isLoadingClasses ? "Chargement des classes..." : "Choisir une classe"} />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          {classes.map(c => (
                            <SelectItem key={c.id} value={c.id.toString()}>{c.nom}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Période Académique</label>
                      <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                        <SelectTrigger className="h-12 border-slate-200 rounded-2xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          <SelectItem value="1">Trimestre 1</SelectItem>
                          <SelectItem value="2">Trimestre 2</SelectItem>
                          <SelectItem value="3">Trimestre 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    className="w-full h-14 text-base font-bold shadow-xl shadow-primary/20 rounded-2xl bg-primary text-white hover:bg-primary/90 border-none" 
                    onClick={handleGenerate}
                    disabled={isCalculating || !selectedClass}
                  >
                    {isCalculating ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                        Calcul des moyennes & rangs...
                      </>
                    ) : (
                      <>
                        <FileText className="h-5 w-5 mr-3" />
                        Générer tous les bulletins
                      </>
                    )}
                  </Button>

                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10 text-xs text-slate-600 font-medium">
                     <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                     <span>Le calcul automatique en 1 clic extrait les notes réelles de PostgreSQL et attribue les rangs de classe.</span>
                  </div>
               </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
               <Card className="bg-emerald-500/5 border-emerald-500/10 rounded-2xl">
                  <CardContent className="p-4 flex gap-4 items-center">
                     <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold">
                        <TrendingUp className="h-5 w-5" />
                     </div>
                     <div>
                        <p className="text-[10px] uppercase font-bold text-emerald-600">Calculateur PostgreSQL</p>
                        <p className="text-sm font-bold text-slate-800">Direct & Exact</p>
                     </div>
                  </CardContent>
               </Card>
               <Card className="bg-amber-500/5 border-amber-500/10 rounded-2xl">
                  <CardContent className="p-4 flex gap-4 items-center">
                     <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold">
                        <LineChartIcon className="h-5 w-5" />
                     </div>
                     <div>
                        <p className="text-[10px] uppercase font-bold text-amber-600">Rangs de Classe</p>
                        <p className="text-sm font-bold text-slate-800">Automatiques</p>
                     </div>
                  </CardContent>
               </Card>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3 items-start">
             <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-100/70 p-3 rounded-2xl border border-slate-200 print:hidden">
                   <Button variant="ghost" size="sm" onClick={() => setStep("select")} className="font-bold text-xs self-start sm:self-auto">
                      <ArrowLeft className="h-4 w-4 mr-2" /> Retour à la sélection
                   </Button>
                   <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
                      <div className="flex items-center gap-1.5">
                         <span className="text-[10px] font-black uppercase text-slate-500">Design :</span>
                         <Select value={selectedTemplateStyle} onValueChange={(val: any) => setSelectedTemplateStyle(val)}>
                            <SelectTrigger className="h-9 border-slate-200 rounded-xl text-xs bg-white w-44 font-bold">
                               <SelectValue placeholder="Style du PDF" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                               <SelectItem value="classique" className="text-xs font-medium">Classique (Standard)</SelectItem>
                               <SelectItem value="premium" className="text-xs font-medium">Premium (Stripe/Canva)</SelectItem>
                               <SelectItem value="ministere" className="text-xs font-medium">Ministère Ivoirien</SelectItem>
                               <SelectItem value="custom" className="text-xs font-medium">Personnalisable</SelectItem>
                            </SelectContent>
                         </Select>
                      </div>
                      <Button size="sm" variant="outline" className="border-slate-300 font-bold rounded-xl gap-2 text-slate-700 bg-white" onClick={() => {
                        if (!currentStudent) return
                        toast.info("Génération du bulletin PDF...")
                        downloadDocumentAsPdf({
                          elementId: "printable-document",
                          filename: `Bulletin_${currentStudent.nom?.replace(/\s+/g, '_')}_T${selectedSemester}_${selectedTemplateStyle}`,
                          format: "a4"
                        })
                      }}>
                        <Download className="h-4 w-4" /> Télécharger PDF
                      </Button>
                      <Button size="sm" className="bg-primary text-white font-bold rounded-xl gap-2 border-none shadow-md shadow-primary/20" onClick={handlePrint}>
                        <Printer className="h-4 w-4" /> Imprimer
                      </Button>
                   </div>
                </div>

                {/* Print Portal Container & Screen Preview */}
                {currentStudent ? (
                  <div className="relative">
                    <DocumentPrintContainer pageSize="a4">
                      <BulletinTemplate
                        student={currentStudent}
                        schoolInfo={schoolInfo}
                        selectedSemester={selectedSemester}
                        templateStyle={selectedTemplateStyle}
                      />
                    </DocumentPrintContainer>

                    {/* Screen Preview */}
                    <div className="bg-slate-200/50 p-4 rounded-3xl overflow-x-auto flex justify-center border border-slate-200">
                      <BulletinTemplate
                        student={currentStudent}
                        schoolInfo={schoolInfo}
                        selectedSemester={selectedSemester}
                        templateStyle={selectedTemplateStyle}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-16 text-center text-slate-400 italic bg-white rounded-3xl border">
                    Aucun élève trouvé dans cette classe.
                  </div>
                )}
             </div>

             {/* Students Batch Selector Sidebar */}
             <div className="space-y-4 print:hidden no-print">
                <Card className="border-slate-200 bg-white rounded-3xl shadow-lg overflow-hidden">
                   <CardHeader className="bg-slate-50 border-b">
                      <CardTitle className="text-sm font-bold uppercase text-slate-600">Élèves de la Classe ({reportData?.students?.length || 0})</CardTitle>
                   </CardHeader>
                   <CardContent className="p-3 space-y-1.5 max-h-[500px] overflow-y-auto custom-scrollbar">
                      {reportData?.students?.map((s: any, idx: number) => (
                        <div 
                          key={s.id} 
                          className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${idx === selectedStudentIndex ? 'bg-primary text-white shadow-md' : 'hover:bg-slate-50 border border-slate-100'}`}
                          onClick={() => setSelectedStudentIndex(idx)}
                        >
                           <div className="flex items-center gap-2.5">
                              <div className={`h-7 w-7 rounded-xl flex items-center justify-center font-bold text-xs ${idx === selectedStudentIndex ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
                                 {s.rank}
                              </div>
                              <div>
                                 <p className="text-xs font-bold leading-tight">{s.nom}</p>
                                 <p className={`text-[10px] ${idx === selectedStudentIndex ? 'text-white/80' : 'text-slate-500'}`}>Moy: {s.overallAvg.toFixed(2)}/20</p>
                              </div>
                           </div>
                           <ChevronRight className={`h-4 w-4 ${idx === selectedStudentIndex ? 'text-white' : 'text-slate-400'}`} />
                        </div>
                      ))}
                   </CardContent>
                </Card>
             </div>
          </div>
        )}
      </main>
    </>
  )
}
