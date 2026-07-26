"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Upload,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  Settings,
  HelpCircle,
  Trash2,
  Table,
  Printer
} from "lucide-react"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import { validateImportData, executeImportData, getExportData } from "@/lib/import-export-actions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

const entityTypes = [
  { id: "students", name: "Élèves", desc: "Comptes élèves" },
  { id: "teachers", name: "Enseignants", desc: "Comptes enseignants" },
  { id: "parents", name: "Parents", desc: "Comptes parents" },
  { id: "classes", name: "Classes", desc: "Classes d'établissement" },
  { id: "subjects", name: "Matières", desc: "Matières et coefficients" }
]

export default function ImportExportPage() {
  const [selectedEntity, setSelectedEntity] = useState(entityTypes[0].id)
  const [previewRows, setPreviewRows] = useState<any[]>([])
  const [validationStats, setValidationStats] = useState<any>(null)
  const [fileName, setFileName] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)

  // Handle file import parsing via SheetJS (xlsx)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setLoading(true)
    const reader = new FileReader()

    reader.onload = async (evt) => {
      try {
        const data = evt.target?.result
        const workbook = XLSX.read(data, { type: "binary" })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const rows = XLSX.utils.sheet_to_json(sheet)

        if (rows.length === 0) {
          toast.error("Le fichier importé est vide.")
          setLoading(false)
          return
        }

        // Validate rows
        const valRes = await validateImportData(selectedEntity, rows)
        if (valRes.success) {
          setPreviewRows(valRes.results)
          setValidationStats({
            total: rows.length,
            valid: valRes.validCount,
            error: valRes.errorCount,
            duplicate: valRes.duplicateCount
          })
          toast.success("Fichier analysé avec succès. Vérifiez l'aperçu avant validation.")
        }
      } catch (err) {
        toast.error("Erreur lors de la lecture du fichier.")
        console.error(err)
      }
      setLoading(false)
    }

    reader.readAsBinaryString(file)
  }

  // Handle database execution of imports
  const handleConfirmImport = async () => {
    if (previewRows.length === 0) return
    
    // Filter out rows in error
    const validRows = previewRows
      .filter(r => r.status === "valid")
      .map(r => r.data)

    if (validRows.length === 0) {
      toast.error("Aucune ligne valide à importer.")
      return
    }

    setImporting(true)
    const res = await executeImportData(selectedEntity, validRows)
    if (res.success) {
      toast.success(`${res.count} enregistrement(s) importé(s) avec succès !`)
      setPreviewRows([])
      setValidationStats(null)
      setFileName("")
    } else {
      toast.error(res.error || "Erreur de base de données lors de l'import")
    }
    setImporting(false)
  }

  // Handle exports
  const handleExport = async (format: "excel" | "csv") => {
    const res = await getExportData(selectedEntity)
    if (!res.success || !res.data) {
      toast.error("Impossible de récupérer les données d'export")
      return
    }

    const worksheet = XLSX.utils.json_to_sheet(res.data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, selectedEntity)

    if (format === "excel") {
      XLSX.writeFile(workbook, `${selectedEntity}_export_${Date.now()}.xlsx`)
    } else {
      XLSX.writeFile(workbook, `${selectedEntity}_export_${Date.now()}.csv`, { bookType: "csv" })
    }
    toast.success(`Données exportées avec succès au format ${format.toUpperCase()}`)
  }

  // Generate blank template helper
  const handleDownloadTemplate = () => {
    let sampleData: any[] = []
    if (selectedEntity === "students" || selectedEntity === "teachers" || selectedEntity === "parents") {
      sampleData = [{ nom: "Koffi Yao", email: "koffi@exemple.com" }]
    } else if (selectedEntity === "classes") {
      sampleData = [{ nom: "Classe 6ème A", niveau: "Secondaire" }]
    } else if (selectedEntity === "subjects") {
      sampleData = [{ nom: "Algèbre", coefficient: "4", code: "MAT101" }]
    }

    const worksheet = XLSX.utils.json_to_sheet(sampleData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template")
    XLSX.writeFile(workbook, `template_${selectedEntity}.xlsx`)
    toast.success("Modèle de document vierge téléchargé.")
  }

  return (
    <>
      <DashboardHeader 
        title="Passerelle Import / Export" 
        subtitle="Importez massivement vos bases de données ou exportez des rapports scolaires au format Excel, CSV ou PDF"
      />

      <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Operations Dashboard */}
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Config & Import Trigger */}
          <Card className="lg:col-span-1 border-none shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                <Settings className="h-4.5 w-4.5 text-primary" />
                Configuration du Transfert
              </CardTitle>
              <CardDescription className="text-xs">Choisissez la cible et chargez votre fichier</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Cible des données</label>
                <Select value={selectedEntity} onValueChange={(val) => {
                  setSelectedEntity(val)
                  setPreviewRows([])
                  setValidationStats(null)
                  setFileName("")
                }}>
                  <SelectTrigger className="rounded-xl border-slate-200 text-xs bg-white">
                    <SelectValue placeholder="Sélectionnez l'entité" />
                  </SelectTrigger>
                  <SelectContent>
                    {entityTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id} className="text-xs">
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Upload drag-n-drop */}
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center space-y-3 relative hover:bg-slate-50/50 transition-colors">
                <input 
                  type="file" 
                  accept=".xlsx, .xls, .csv" 
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="h-8 w-8 mx-auto text-primary" />
                <div>
                  <p className="font-bold text-xs text-slate-800">Glissez-déposez un fichier ici</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Excel (.xlsx) ou CSV (.csv)</p>
                </div>
                {fileName && (
                  <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold py-1 px-2.5 rounded-lg max-w-[200px] truncate">
                    {fileName}
                  </Badge>
                )}
              </div>

              {/* Template downloader */}
              <Button 
                variant="outline" 
                onClick={handleDownloadTemplate}
                className="w-full h-10 border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-xs gap-2"
              >
                <Download className="h-4 w-4 text-slate-500" />
                Télécharger le modèle type (.xlsx)
              </Button>
            </CardContent>
          </Card>

          {/* Verification & Preview statistics */}
          <Card className="lg:col-span-2 border-none shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b pb-4 flex flex-row items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                  <Table className="h-4.5 w-4.5 text-primary" />
                  Console de Validation des Données
                </CardTitle>
                <CardDescription className="text-xs">Statut de l&apos;analyse avant insertion en base</CardDescription>
              </div>
              {validationStats && (
                <div className="flex gap-2">
                  <Badge className="bg-emerald-500 text-white font-bold text-[9px] uppercase border-none">
                    {validationStats.valid} Valides
                  </Badge>
                  <Badge className="bg-amber-500 text-white font-bold text-[9px] uppercase border-none">
                    {validationStats.duplicate} Doublons
                  </Badge>
                  <Badge className="bg-rose-500 text-white font-bold text-[9px] uppercase border-none">
                    {validationStats.error} Erreurs
                  </Badge>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {validationStats ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="font-bold text-xs text-slate-800">Prêt pour l&apos;importation</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        Le système importera uniquement les lignes valides. Les erreurs seront ignorées.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setPreviewRows([])
                          setValidationStats(null)
                          setFileName("")
                        }}
                        className="rounded-xl text-xs border-slate-200 h-9 font-bold text-slate-500"
                      >
                        Annuler
                      </Button>
                      <Button 
                        onClick={handleConfirmImport} 
                        disabled={importing || validationStats.valid === 0}
                        className="rounded-xl text-xs bg-primary text-white h-9 font-bold"
                      >
                        {importing ? "Importation..." : `Confirmer l'import (${validationStats.valid} lignes)`}
                      </Button>
                    </div>
                  </div>

                  {/* Errors checklist warning */}
                  {validationStats.error > 0 && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-xs text-rose-800">Alerte : Lignes erronées détectées</p>
                        <p className="text-[10px] text-rose-600/80 font-medium mt-0.5">
                          {validationStats.error} ligne(s) possèdent des erreurs bloquantes (champs manquants ou format incorrect). Elles ne seront pas enregistrées.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Duplicate warning */}
                  {validationStats.duplicate > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-xs text-amber-800">Doublons détectés</p>
                        <p className="text-[10px] text-amber-600/80 font-medium mt-0.5">
                          {validationStats.duplicate} ligne(s) possèdent des emails déjà existants dans l&apos;école. Ces comptes ne seront pas recréés pour éviter la duplication.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 space-y-3">
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-slate-200 animate-pulse" />
                  <div>
                    <p className="font-bold text-xs text-slate-800">Aucun fichier en cours d&apos;analyse</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      Veuillez téléverser un fichier Excel/CSV sur la gauche pour lister le contenu
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Data Exports and Actions */}
        <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
              <Download className="h-4.5 w-4.5 text-primary" />
              Générateur d&apos;Exportations de données
            </CardTitle>
            <CardDescription className="text-xs">Téléchargez directement les données scolaires actives sous forme de fichiers ou rapports</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 sm:grid-cols-3">
              {entityTypes.map((type) => (
                <div key={type.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">{type.name}</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{type.desc}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setSelectedEntity(type.id)
                        handleExport("excel")
                      }}
                      className="flex-1 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase gap-1"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5" />
                      Excel
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedEntity(type.id)
                        handleExport("csv")
                      }}
                      className="flex-1 h-8 rounded-xl border-slate-200 text-slate-600 font-bold text-[10px] uppercase gap-1 hover:bg-slate-50"
                    >
                      CSV
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        window.print()
                      }}
                      className="h-8 w-8 p-0 rounded-xl border-slate-200 text-slate-500 hover:bg-slate-50"
                    >
                      <Printer className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Live Grid Preview when file uploaded */}
        {previewRows.length > 0 && (
          <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b pb-4">
              <CardTitle className="text-base font-bold text-slate-800">Aperçu du contenu importé ({previewRows.length} lignes)</CardTitle>
              <CardDescription className="text-xs">Grille dynamique d&apos;analyse avant écriture</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    <tr>
                      <th className="py-3.5 px-6">Ligne</th>
                      <th className="py-3.5 px-6">Nom</th>
                      <th className="py-3.5 px-6">Email / Attribut principal</th>
                      <th className="py-3.5 px-6">Statut d&apos;Analyse</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {previewRows.map((row) => (
                      <tr key={row.index} className={`hover:bg-slate-50/50 transition-colors ${
                        row.status === "error" ? "bg-rose-50/20" : 
                        row.status === "duplicate" ? "bg-amber-50/20" : ""
                      }`}>
                        <td className="py-3.5 px-6 font-mono text-slate-400">#{row.index}</td>
                        <td className="py-3.5 px-6 font-bold">{row.data.nom || "N/A"}</td>
                        <td className="py-3.5 px-6 text-slate-500">
                          {row.data.email || row.data.niveau || row.data.coefficient || "N/A"}
                        </td>
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {row.status === "valid" && (
                              <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px] uppercase">
                                Prêt à importer
                              </Badge>
                            )}
                            {row.status === "duplicate" && (
                              <Badge className="bg-amber-50 text-amber-600 border-none font-bold text-[9px] uppercase">
                                Ignoré (Doublon)
                              </Badge>
                            )}
                            {row.status === "error" && (
                              <div className="flex flex-col gap-1">
                                <Badge className="bg-rose-50 text-rose-600 border-none font-bold text-[9px] uppercase w-fit">
                                  Erreur bloquante
                                </Badge>
                                <span className="text-[9px] text-rose-500/80 font-medium">
                                  {row.errors.join(", ")}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  )
}
