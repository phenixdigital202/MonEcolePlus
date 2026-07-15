"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  BarChart3, 
  GraduationCap,
  Calendar,
  Award
} from "lucide-react"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts"

interface StudentGradebookProps {
  data: {
    globalAverage: string
    rank: number
    totalStudents: number
    subjects: {
      subject: string
      studentAvg: string
      classAvg: string
    }[]
  }
}

export function StudentGradebook({ data }: StudentGradebookProps) {
  // Chart data preparation
  const chartData = data.subjects.map(s => ({
    name: s.subject.substring(0, 5),
    "Ma Note": parseFloat(s.studentAvg),
    "Moy. Classe": parseFloat(s.classAvg)
  }))

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Moyenne Générale</p>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-primary">{data.globalAverage}</span>
              <span className="text-sm text-muted-foreground pb-1">/ 20</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Rang dans la classe</p>
              <Award className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-emerald-600">{data.rank}er</span>
              <span className="text-sm text-muted-foreground pb-1">/ {data.totalStudents}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Position</p>
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-blue-900">
                {parseFloat(data.globalAverage) >= 15 ? "Excellent" : "Très Bon"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Subjects List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Détail par Matière
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.subjects.map((s, i) => {
                const diff = parseFloat(s.studentAvg) - parseFloat(s.classAvg)
                return (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border bg-card/50 hover:bg-muted/30 transition-colors">
                    <div className="space-y-1">
                      <p className="font-bold">{s.subject}</p>
                      <p className="text-[10px] uppercase text-muted-foreground">Moyenne Classe : {s.classAvg}/20</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                         <p className="text-xl font-black text-primary">{s.studentAvg}</p>
                         <div className="flex items-center justify-end gap-1">
                            {diff > 0 ? (
                              <>
                                <TrendingUp className="h-3 w-3 text-emerald-500" />
                                <span className="text-[10px] text-emerald-500 font-bold">+{diff.toFixed(1)}</span>
                              </>
                            ) : diff < 0 ? (
                              <>
                                <TrendingDown className="h-3 w-3 text-red-500" />
                                <span className="text-[10px] text-red-500 font-bold">{diff.toFixed(1)}</span>
                              </>
                            ) : (
                              <Minus className="h-3 w-3 text-muted-foreground" />
                            )}
                         </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Evolution Chart */}
        <div className="space-y-6">
           <Card className="border-primary/20 shadow-lg">
             <CardHeader>
               <CardTitle className="text-md">Analyse Compareé</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="h-64 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                         <defs>
                            <linearGradient id="colorStudent" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                         <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                         <YAxis fontSize={10} tickLine={false} axisLine={false} domain={[0, 20]} />
                         <Tooltip />
                         <Area type="monotone" dataKey="Ma Note" stroke="#2563eb" fillOpacity={1} fill="url(#colorStudent)" strokeWidth={3} />
                         <Area type="monotone" dataKey="Moy. Classe" stroke="#94a3b8" fillOpacity={0.05} fill="#94a3b8" strokeDasharray="5 5" />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
                <div className="mt-4 flex justify-center gap-4 text-[10px] font-bold uppercase">
                   <div className="flex items-center gap-1"><div className="h-1 w-3 bg-primary" /> Ma Note</div>
                   <div className="flex items-center gap-1"><div className="h-1 w-3 bg-muted-foreground border-t border-dashed" /> Moy. Classe</div>
                </div>
             </CardContent>
           </Card>

           <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 flex gap-3 items-center">
                 <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                    <TrendingUp className="h-5 w-5" />
                 </div>
                 <p className="text-xs text-primary font-medium italic">
                    "Tu es au dessus de la moyenne de classe dans 4 matières sur 6. Continue tes efforts !"
                 </p>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
