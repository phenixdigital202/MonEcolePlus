"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Plus,
  Download,
  Mic
} from "lucide-react"

type StudentGrade = {
  id: number
  name: string
  class: string
  grades: { subject: string, value: number }[]
  average: number
}

export function GradesList({ 
  initialStudents, 
  subjects 
}: { 
  initialStudents: StudentGrade[], 
  subjects: string[] 
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedSubject, setSelectedSubject] = useState("all")

  const filteredStudents = initialStudents.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedClass === "all" || s.class === selectedClass)
  )

  return (
    <>
      {/* Actions Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
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
        <div className="flex gap-2 flex-wrap">
          <select 
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="all">Toutes les matières</option>
            {subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <Button variant="outline">
            <Mic className="h-4 w-4 mr-2" />
            Saisie vocale
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter notes
          </Button>
        </div>
      </div>

      {/* Grades Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notes des élèves</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-4 text-left text-sm font-semibold text-foreground">Élève</th>
                  {subjects.slice(0, 5).map(subject => (
                    <th key={subject} className="py-3 px-4 text-center text-sm font-semibold text-foreground truncate max-w-[100px]">
                      {subject}
                    </th>
                  ))}
                  <th className="py-3 px-4 text-center text-sm font-semibold text-foreground">Moyenne</th>
                  <th className="py-3 px-4 text-center text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, idx) => (
                  <tr key={student.id} className={idx % 2 === 0 ? "bg-muted/30" : ""}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {student.name.split(" ").map(n => n[0]).join("")}
                          </span>
                        </div>
                        <span className="font-medium text-foreground">{student.name}</span>
                      </div>
                    </td>
                    {subjects.slice(0, 5).map(subject => {
                      const grade = student.grades.find(g => g.subject === subject)
                      const val = grade ? grade.value : null
                      return (
                        <td key={subject} className="py-3 px-4 text-center">
                          <span className={`font-medium ${val && val >= 14 ? "text-chart-3" : val && val >= 10 ? "text-foreground" : val ? "text-destructive" : "text-muted-foreground"}`}>
                            {val !== null ? val.toFixed(1) : "-"}
                          </span>
                        </td>
                      )
                    })}
                    <td className="py-3 px-4 text-center">
                      <span className={`font-semibold ${student.average >= 14 ? "text-chart-3" : student.average >= 10 ? "text-chart-4" : "text-destructive"}`}>
                        {student.average.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button variant="ghost" size="sm">Modifier</Button>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={subjects.length + 2} className="py-8 text-center text-muted-foreground">
                      Aucun élève trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
