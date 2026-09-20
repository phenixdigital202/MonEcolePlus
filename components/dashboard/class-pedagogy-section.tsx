"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  UserCheck, 
  BookOpen, 
  Plus, 
  Pencil, 
  Trash2, 
  Check, 
  X, 
  Loader2, 
  GraduationCap,
  ShieldCheck,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"
import { 
  updateHeadTeacherAction, 
  getClassPedagogyDetailsAction, 
  addClassSubjectAction, 
  updateClassSubjectAction, 
  deleteClassSubjectAction 
} from "@/lib/classes-pedagogy-actions"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"

interface ClassPedagogySectionProps {
  classId: number
  userRole?: string
}

export function ClassPedagogySection({ classId, userRole = "admin" }: ClassPedagogySectionProps) {
  const [loading, setLoading] = useState(true)
  const [classData, setClassData] = useState<any>(null)
  const [tenantTeachers, setTenantTeachers] = useState<any[]>([])
  const [teacherSubjects, setTeacherSubjects] = useState<any[]>([])
  const [allowedSubjects, setAllowedSubjects] = useState<string[]>([])
  
  // Head Teacher state
  const [selectedHeadTeacherId, setSelectedHeadTeacherId] = useState<string>("")
  const [savingHeadTeacher, setSavingHeadTeacher] = useState(false)

  // Subject Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<any>(null)
  const [formMatiere, setFormMatiere] = useState("")
  const [formCoefficient, setFormCoefficient] = useState("1.0")
  const [formVolume, setFormVolume] = useState("4")
  const [formSelectedTeacherIds, setFormSelectedTeacherIds] = useState<number[]>([])
  const [submittingSubject, setSubmittingSubject] = useState(false)

  const [deletingId, setDeletingId] = useState<number | null>(null)

  const loadData = async () => {
    setLoading(true)
    const res = await getClassPedagogyDetailsAction(classId)
    if (res.success && res.data) {
      setClassData(res.data.classData)
      setTenantTeachers(res.data.tenantTeachers || [])
      setTeacherSubjects(res.data.teacherSubjects || [])
      setAllowedSubjects(res.data.allowedSubjects || [])
      setSelectedHeadTeacherId(res.data.classData.id_professeur_principal?.toString() || "")
    } else {
      toast.error(res.error || "Erreur lors du chargement de la gestion pédagogique.")
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [classId])

  const handleSaveHeadTeacher = async () => {
    setSavingHeadTeacher(true)
    const teacherId = selectedHeadTeacherId ? parseInt(selectedHeadTeacherId) : null
    const res = await updateHeadTeacherAction(classId, teacherId)
    if (res.success) {
      toast.success(res.message || "Professeur principal mis à jour.")
      loadData()
    } else {
      toast.error(res.error)
    }
    setSavingHeadTeacher(false)
  }

  const openAddModal = () => {
    setEditingSubject(null)
    setFormMatiere(allowedSubjects[0] || "")
    setFormCoefficient("1.0")
    setFormVolume("4")
    setFormSelectedTeacherIds([])
    setIsModalOpen(true)
  }

  const openEditModal = (cs: any) => {
    setEditingSubject(cs)
    setFormMatiere(cs.matiere)
    setFormCoefficient(cs.coefficient.toString())
    setFormVolume((cs.volume_horaire_hebdo || 4).toString())
    setFormSelectedTeacherIds(cs.teachers ? cs.teachers.map((t: any) => t.id_enseignant) : [])
    setIsModalOpen(true)
  }

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    const coefNum = parseFloat(formCoefficient)
    if (isNaN(coefNum) || coefNum <= 0) {
      toast.error("Le coefficient doit être un nombre strictement positif (> 0).")
      return
    }

    setSubmittingSubject(true)
    if (editingSubject) {
      // Update existing class subject
      const res = await updateClassSubjectAction({
        classSubjectId: editingSubject.id,
        coefficient: coefNum,
        volume_horaire_hebdo: parseInt(formVolume) || 4,
        teacherIds: formSelectedTeacherIds
      })
      if (res.success) {
        toast.success(res.message)
        setIsModalOpen(false)
        loadData()
      } else {
        toast.error(res.error)
      }
    } else {
      // Add new class subject
      const res = await addClassSubjectAction({
        classId,
        matiere: formMatiere,
        coefficient: coefNum,
        volume_horaire_hebdo: parseInt(formVolume) || 4,
        teacherIds: formSelectedTeacherIds
      })
      if (res.success) {
        toast.success(res.message)
        setIsModalOpen(false)
        loadData()
      } else {
        toast.error(res.error)
      }
    }
    setSubmittingSubject(false)
  }

  const handleDeleteSubject = async (csId: number, matName: string) => {
    if (!confirm(`Voulez-vous vraiment retirer la matière "${matName}" de cette classe ?`)) return

    setDeletingId(csId)
    const res = await deleteClassSubjectAction(csId)
    if (res.success) {
      toast.success(res.message)
      loadData()
    } else {
      toast.error(res.error)
    }
    setDeletingId(null)
  }

  // Compute subjects taught by currently selected teacher(s) in modal
  const selectedTeachersSubjects = Array.from(
    new Set(
      formSelectedTeacherIds.flatMap((tId) => {
        const t = tenantTeachers.find((tch) => tch.id === tId)
        const mainMat = t?.matiere ? [t.matiere.trim()] : []
        const habMats = teacherSubjects
          .filter((ts) => ts.id_enseignant === tId)
          .map((ts) => ts.matiere.trim())
        return [...mainMat, ...habMats]
      }).filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }))

  // Subject options in modal: if teachers selected, show their subjects; otherwise show all DB subjects
  const availableSubjectOptions =
    formSelectedTeacherIds.length > 0 && selectedTeachersSubjects.length > 0
      ? selectedTeachersSubjects
      : allowedSubjects

  // Auto-sync selected Matiere when teacher selection changes
  useEffect(() => {
    if (formSelectedTeacherIds.length > 0 && selectedTeachersSubjects.length > 0) {
      if (!selectedTeachersSubjects.includes(formMatiere)) {
        setFormMatiere(selectedTeachersSubjects[0])
      }
    }
  }, [formSelectedTeacherIds])

  // Teachers list for modal, enriched with subject badges and sorted with matches first
  const eligibleTeachersForModal = tenantTeachers
    .map((t) => {
      const mainMat = t.matiere ? [t.matiere.trim()] : []
      const habMats = teacherSubjects
        .filter((ts) => ts.id_enseignant === t.id)
        .map((ts) => ts.matiere.trim())
      const allMats = Array.from(new Set([...mainMat, ...habMats]))

      const isMatchingSubject = formMatiere
        ? allMats.some((m) => m.toLowerCase() === formMatiere.toLowerCase().trim())
        : true

      return {
        ...t,
        subjects: allMats,
        isMatchingSubject
      }
    })
    .sort((a, b) => {
      if (a.isMatchingSubject && !b.isMatchingSubject) return -1
      if (!a.isMatchingSubject && b.isMatchingSubject) return 1
      return a.nom.localeCompare(b.nom)
    })

  if (loading) {
    return (
      <Card className="border-none shadow-sm rounded-3xl p-6 flex items-center justify-center min-h-[160px]">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <span className="text-sm font-medium text-slate-500">Chargement de la gestion pédagogique...</span>
      </Card>
    )
  }

  const classSubjects = classData?.classSubjects || []
  const headTeacher = classData?.professeurPrincipal

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. PROFESSEUR PRINCIPAL */}
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 pb-4">
          <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Professeur Principal de la classe
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-700">
                Professeur Principal Actuel :{" "}
                <span className="text-primary font-black">
                  {headTeacher ? headTeacher.nom : "Aucun enseignant désigné"}
                </span>
              </p>
              <p className="text-xs text-slate-400">
                {headTeacher ? headTeacher.email : "Sélectionnez un enseignant du Tenant pour cette classe."}
              </p>
            </div>

            {userRole === "admin" && (
              <div className="flex items-center gap-2">
                <select
                  value={selectedHeadTeacherId}
                  onChange={(e) => setSelectedHeadTeacherId(e.target.value)}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-700"
                >
                  <option value="">-- Aucun professeur principal --</option>
                  {tenantTeachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nom} {t.matiere ? `(${t.matiere})` : ""}
                    </option>
                  ))}
                </select>

                <Button
                  onClick={handleSaveHeadTeacher}
                  disabled={savingHeadTeacher}
                  size="sm"
                  className="rounded-xl h-10 px-4 bg-primary font-bold shadow-sm"
                >
                  {savingHeadTeacher ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1.5" /> Enregistrer
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 2. MATIÈRES ET COEFFICIENTS DE LA CLASSE */}
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50 pb-4">
          <div>
            <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Matières et Coefficients de la classe
            </CardTitle>
            <p className="text-xs text-slate-400 mt-1">
              Source de vérité unique utilisée pour la génération des bulletins et des emplois du temps IA.
            </p>
          </div>

          {userRole === "admin" && (
            <Button
              onClick={openAddModal}
              size="sm"
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm h-9 px-3"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Ajouter une matière
            </Button>
          )}
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/30 text-left">
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Matière</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Enseignant(s) affecté(s)</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Coefficient</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Vol. Hebdo</th>
                  {userRole === "admin" && (
                    <th className="p-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classSubjects.map((cs: any) => {
                  const assignedTeachers = cs.teachers ? cs.teachers.map((t: any) => t.teacher) : []
                  return (
                    <tr key={cs.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-slate-800 text-sm">{cs.matiere}</span>
                      </td>
                      <td className="p-4">
                        {assignedTeachers.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {assignedTeachers.map((t: any) => (
                              <Badge
                                key={t.id}
                                variant="secondary"
                                className="bg-primary/10 text-primary border-0 rounded-lg text-xs font-bold"
                              >
                                {t.nom}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-amber-500 italic font-medium flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" /> Aucun enseignant assigné
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge className="bg-slate-100 text-slate-800 border-slate-200 rounded-lg font-black text-sm px-2.5 py-0.5">
                          Coef. {cs.coefficient}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-bold text-slate-600">{cs.volume_horaire_hebdo || 4} h/sem</span>
                      </td>
                      {userRole === "admin" && (
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              onClick={() => openEditModal(cs)}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full hover:bg-slate-100"
                            >
                              <Pencil className="h-4 w-4 text-slate-600" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteSubject(cs.id, cs.matiere)}
                              disabled={deletingId === cs.id}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-600"
                            >
                              {deletingId === cs.id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-600" />
                              )}
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}

                {classSubjects.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 italic font-medium">
                      <div className="bg-slate-50 h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-3">
                        <BookOpen className="h-6 w-6 text-slate-300" />
                      </div>
                      Aucune matière configurée pour cette classe. Cliquez sur "+ Ajouter une matière".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 3. MODAL AJOUT / MODIFICATION MATIÈRE */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-800">
              {editingSubject ? `Modifier : ${editingSubject.matiere}` : "Ajouter une matière à la classe"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveSubject} className="space-y-4 pt-2">
            {/* Matière choice */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-slate-700">Matière</Label>
                {formSelectedTeacherIds.length > 0 && selectedTeachersSubjects.length > 0 && (
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    Filtré par enseignant sélectionné
                  </span>
                )}
              </div>
              {editingSubject ? (
                <Input value={formMatiere} disabled className="rounded-xl bg-slate-50 font-bold" />
              ) : (
                <select
                  value={formMatiere}
                  onChange={(e) => setFormMatiere(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-800"
                >
                  {availableSubjectOptions.map((mat) => (
                    <option key={mat} value={mat}>
                      {mat}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Coefficient */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Coefficient (&gt; 0)</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={formCoefficient}
                  onChange={(e) => setFormCoefficient(e.target.value)}
                  required
                  className="rounded-xl font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Volume Horaire (h/sem)</Label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={formVolume}
                  onChange={(e) => setFormVolume(e.target.value)}
                  required
                  className="rounded-xl font-bold"
                />
              </div>
            </div>

            {/* Teacher Selection filtered by TeacherSubject */}
            <div className="space-y-2 pt-2">
              <Label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Enseignant(s) autorisé(s)</span>
                <span className="text-[10px] text-slate-400 font-normal">Cocher un enseignant filtre ses matières</span>
              </Label>

              <div className="border border-slate-200 rounded-2xl p-3 max-h-48 overflow-y-auto space-y-2 bg-slate-50/50">
                {eligibleTeachersForModal.map((teacher) => {
                  const isChecked = formSelectedTeacherIds.includes(teacher.id)
                  return (
                    <label
                      key={teacher.id}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isChecked 
                          ? "bg-primary/10 border-primary/40 shadow-sm" 
                          : "bg-white border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormSelectedTeacherIds([...formSelectedTeacherIds, teacher.id])
                          } else {
                            setFormSelectedTeacherIds(formSelectedTeacherIds.filter((id) => id !== teacher.id))
                          }
                        }}
                        className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-slate-800 truncate">{teacher.nom}</p>
                          {teacher.subjects.length > 0 && (
                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[140px]">
                              {teacher.subjects.join(", ")}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">{teacher.email}</p>
                      </div>
                    </label>
                  )
                })}

                {eligibleTeachersForModal.length === 0 && (
                  <p className="text-xs text-amber-500 italic p-2 text-center">
                    Aucun enseignant enregistré dans le système.
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={submittingSubject}
                className="rounded-xl bg-primary font-bold shadow-sm"
              >
                {submittingSubject ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
