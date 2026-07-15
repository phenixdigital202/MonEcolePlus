"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  Download, 
  Printer, 
  LineChart as LineChartIcon,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  QrCode,
  Building2,
  Search,
  ArrowLeft
} from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts"
import { Badge } from "@/components/ui/badge"

const data = [
  { name: "Maths", note: 18, classAvg: 12 },
  { name: "Français", note: 14, classAvg: 13 },
  { name: "Anglais", note: 16, classAvg: 11 },
  { name: "Physique", note: 17, classAvg: 10 },
  { name: "SVT", note: 15, classAvg: 12 },
  { name: "Histo", note: 13, classAvg: 11 },
]

export default function BulletinBatchPage() {
  const [step, setStep] = useState<"select" | "preview">("select")
  const [selectedClass, setSelectedClass] = useState("")

  const handleGenerate = () => {
    setStep("preview")
  }

  return (
    <>
      <DashboardHeader 
        title="Bulletin de Notes SaaS" 
        subtitle="Générez des bulletins premium avec graphiques de performance"
      />
      
      <main className="p-6 max-w-6xl mx-auto">
        {step === "select" ? (
          <div className="max-w-2xl mx-auto space-y-8 py-12">
            <Card className="border-primary/20 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                  <TrendingUp className="h-24 w-24 text-primary" />
               </div>
               <CardHeader>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    Génération en Masse
                  </CardTitle>
               </CardHeader>
               <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Classe</label>
                      <Select value={selectedClass} onValueChange={setSelectedClass}>
                        <SelectTrigger className="h-12 border-primary/20">
                          <SelectValue placeholder="Choisir une classe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3a">3ème A (24 élèves)</SelectItem>
                          <SelectItem value="3b">3ème B (18 élèves)</SelectItem>
                          <SelectItem value="term">Terminale S (32 élèves)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Période</label>
                      <Select defaultValue="t1">
                        <SelectTrigger className="h-12 border-primary/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="t1">1er Semestre</SelectItem>
                          <SelectItem value="t2">2ème Semestre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    className="w-full h-14 text-lg shadow-xl shadow-primary/20" 
                    onClick={handleGenerate}
                    disabled={!selectedClass}
                  >
                    <FileText className="h-5 w-5 mr-3" />
                    Générer tous les bulletins
                  </Button>

                  <div className="flex items-center gap-2 p-4 rounded-xl bg-primary/5 border border-primary/10 text-xs text-muted-foreground">
                     <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                     <span>La génération en 1 clic calculera automatiquement les rangs, moyennes et apprécations de base.</span>
                  </div>
               </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
               <Card className="bg-emerald-500/5 border-emerald-500/10">
                  <CardContent className="p-4 flex gap-4 items-center">
                     <div className="h-10 w-10 rounded bg-emerald-500 flex items-center justify-center text-white">
                        <TrendingUp className="h-5 w-5" />
                     </div>
                     <div>
                        <p className="text-[10px] uppercase font-bold text-emerald-600">Calculateur IA</p>
                        <p className="text-sm font-bold">Inclus</p>
                     </div>
                  </CardContent>
               </Card>
               <Card className="bg-amber-500/5 border-amber-500/10">
                  <CardContent className="p-4 flex gap-4 items-center">
                     <div className="h-10 w-10 rounded bg-amber-500 flex items-center justify-center text-white">
                        <LineChartIcon className="h-5 w-5" />
                     </div>
                     <div>
                        <p className="text-[10px] uppercase font-bold text-amber-600">Graphiques</p>
                        <p className="text-sm font-bold">Automatiques</p>
                     </div>
                  </CardContent>
               </Card>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3 items-start">
             <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center bg-muted/30 p-2 rounded-lg">
                   <Button variant="ghost" size="sm" onClick={() => setStep("select")}>
                      <ArrowLeft className="h-4 w-4 mr-2" /> Retour
                   </Button>
                   <div className="flex gap-2">
                       <Button size="sm" variant="outline" className="bg-white"><Printer className="h-4 w-4 mr-2" /> Imprimer tout</Button>
                       <Button size="sm"><Download className="h-4 w-4 mr-2" /> Tout en ZIP</Button>
                   </div>
                </div>

                {/* High-Fidelity Bulletin Template */}
                <Card className="border-4 border-muted/50 shadow-2xl overflow-hidden bg-white text-black font-sans p-10 relative">
                   {/* Header Branding */}
                   <div className="flex justify-between border-b-2 border-black pb-4 mb-6">
                      <div className="flex gap-4 items-center">
                         <div className="h-16 w-16 bg-primary flex items-center justify-center text-white rounded">
                            <Building2 className="h-8 w-8" />
                         </div>
                         <div>
                            <h2 className="text-xl font-black uppercase text-primary">Groupe Scolaire Excellence</h2>
                            <p className="text-[10px] font-bold">Secteur 3, Conakry | +224 620 00 00 00</p>
                            <p className="text-[10px] text-muted-foreground italic">"L'Excellence est une habitude"</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <h1 className="text-2xl font-black italic">BULLETIN SCOLAIRE</h1>
                         <p className="text-xs font-bold uppercase tracking-widest text-primary">1er Semestre 2025-2026</p>
                      </div>
                   </div>

                   {/* Student Metadata Table */}
                   <div className="grid grid-cols-4 gap-4 mb-6 text-[11px]">
                      <div className="p-3 bg-gray-50 border-y border-black font-medium">
                         ÉLÈVE : <span className="font-black">ABOU TRAORE</span>
                      </div>
                      <div className="p-3 bg-gray-50 border-y border-black font-medium">
                         CLASSE : <span className="font-black">3ème A</span>
                      </div>
                      <div className="p-3 bg-gray-50 border-y border-black font-medium">
                         EFFECTIF : <span className="font-black">24</span>
                      </div>
                      <div className="p-3 bg-gray-50 border-y border-black font-medium text-right">
                         ID : <span className="font-black">B-99021</span>
                      </div>
                   </div>

                   {/* Subjects Grid */}
                   <table className="w-full border-collapse border border-black text-xs mb-6">
                      <thead className="bg-gray-100 uppercase">
                        <tr>
                           <th className="border border-black p-2 text-left">Matières</th>
                           <th className="border border-black p-2 text-center">Coef</th>
                           <th className="border border-black p-2 text-center">Note / 20</th>
                           <th className="border border-black p-2 text-center">Moy. Classe</th>
                           <th className="border border-black p-2 text-left">Appréciation du Professeur</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: "Mathématiques", coef: 5, note: 18.5, avg: 12.4, feedback: "Excellent travail. Trés rigoureux." },
                          { name: "Français", coef: 4, note: 14, avg: 11.2, feedback: "Bonne participation orale." },
                          { name: "Anglais", coef: 3, note: 16.5, avg: 10.8, feedback: "Niveau solide. Continue." },
                          { name: "Physique-Chimie", coef: 4, note: 17, avg: 12.1, feedback: "Excellente analyse scientifique." },
                        ].map((m, i) => (
                           <tr key={i}>
                              <td className="border border-black p-2 font-bold">{m.name}</td>
                              <td className="border border-black p-2 text-center">{m.coef}</td>
                              <td className="border border-black p-2 text-center font-black bg-primary/5">{m.note}</td>
                              <td className="border border-black p-2 text-center italic">{m.avg}</td>
                              <td className="border border-black p-2 text-[10px] italic">{m.feedback}</td>
                           </tr>
                        ))}
                      </tbody>
                   </table>

                   <div className="grid grid-cols-2 gap-8 mb-8">
                      {/* Evolution Graph - Differentiation Feature */}
                      <div className="space-y-4">
                         <h4 className="text-[10px] font-black uppercase flex items-center gap-2">
                           <TrendingUp className="h-3 w-3 text-primary" /> Visualisation de Performance
                         </h4>
                         <div className="h-40 w-full bg-gray-50 border border-muted p-2 rounded">
                            <ResponsiveContainer width="100%" height="100%">
                               <AreaChart data={data}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                  <XAxis dataKey="name" fontSize={8} tickLine={false} axisLine={false} />
                                  <YAxis fontSize={8} tickLine={false} axisLine={false} domain={[0, 20]} />
                                  <Tooltip />
                                  <Area type="monotone" dataKey="note" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.1} />
                                  <Area type="monotone" dataKey="classAvg" stroke="#94a3b8" fill="#cbd5e1" fillOpacity={0.05} />
                               </AreaChart>
                            </ResponsiveContainer>
                         </div>
                      </div>

                      <div className="space-y-4">
                         {/* Stats Box */}
                         <div className="grid grid-cols-2 gap-2">
                            <div className="p-4 border border-black bg-gray-50 text-center">
                               <p className="text-[10px] uppercase font-bold text-muted-foreground">Moyenne Générale</p>
                               <p className="text-2xl font-black">16.25</p>
                            </div>
                            <div className="p-4 border border-black bg-primary/10 text-center">
                               <p className="text-[10px] uppercase font-bold text-primary">Rang</p>
                               <p className="text-2xl font-black text-primary">1er <span className="text-xs font-normal">/ 24</span></p>
                            </div>
                         </div>
                         <div className="p-4 border border-black min-h-[80px]">
                            <p className="text-[10px] uppercase font-bold mb-2">Avis du conseil de classe</p>
                            <p className="text-xs font-medium italic">Félicitations du jury. Élève moteur dans la classe.</p>
                         </div>
                      </div>
                   </div>

                   {/* Footer, Verification and Signatures */}
                   <div className="flex justify-between items-end border-t border-black/20 pt-6">
                      <div className="flex gap-4 items-center">
                         <QrCode className="h-16 w-16" />
                         <div>
                            <p className="text-[8px] font-mono leading-tight">DOCUMENT SÉCURISÉ<br/>ID: {Math.random().toString(36).substring(7).toUpperCase()}<br/>Vérifier sur :<br/>mon-ecole-plus.com/verify</p>
                         </div>
                      </div>
                      <div className="text-center w-64">
                         <p className="text-[10px] font-black uppercase mb-12 italic underline underline-offset-4 decoration-primary">Cachet et Signature du Directeur</p>
                         {/* Stamp Simulation */}
                         <div className="relative mx-auto h-20 w-32 border-2 border-red-600/30 rounded flex items-center justify-center -rotate-6">
                            <p className="text-[6px] font-black text-red-600 text-center uppercase tracking-widest opacity-60">DIRECTION GÉNÉRALE<br/>ECOLE EXCELLENCE<br/>AUTHENTIFIÉ</p>
                         </div>
                      </div>
                   </div>
                </Card>
             </div>

             <div className="space-y-6">
                <Card className="border-primary/20 bg-primary/5">
                   <CardHeader>
                      <CardTitle className="text-lg">Contrôle du Batch</CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4">
                      {[
                        { name: "Abou Traore", status: "Calculé", icon: CheckCircle2, color: "text-emerald-500" },
                        { name: "Sarah Koné", status: "Calculé", icon: CheckCircle2, color: "text-emerald-500" },
                        { name: "Jean Diallo", status: "En attente", icon: Award, color: "text-muted-foreground" },
                      ].map((s, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-white border rounded-lg">
                           <span className="text-sm font-medium">{s.name}</span>
                           <div className="flex items-center gap-2">
                              <span className={`text-[10px] uppercase font-bold ${s.color}`}>{s.status}</span>
                              <s.icon className={`h-4 w-4 ${s.color}`} />
                           </div>
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
