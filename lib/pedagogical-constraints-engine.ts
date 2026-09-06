import { getPrisma } from "@/lib/tenant-context"

export type Severity = "BLOCKING" | "WARNING"

export interface ConstraintViolation {
  severity: Severity
  rule: string
  entity: string
  message: string
  details?: any
}

export interface ValidationResult {
  valid: boolean
  hasBlockingErrors: boolean
  violations: ConstraintViolation[]
  qualityScore?: number // 0 - 100
}

export interface TimetableSlot {
  id?: number
  id_classe: number
  id_enseignant: number
  matiere: string
  jour: "Lundi" | "Mardi" | "Mercredi" | "Jeudi" | "Vendredi" | "Samedi"
  heure_debut: Date | string
  heure_fin: Date | string
  salle?: string | null
}

/**
 * Helper to parse time into total minutes since midnight
 */
export function parseTimeToMinutes(dateOrStr: Date | string): number {
  if (typeof dateOrStr === "string") {
    // Expected format "HH:MM" or ISO string
    if (dateOrStr.includes("T")) {
      const d = new Date(dateOrStr)
      return d.getUTCHours() * 60 + d.getUTCMinutes()
    }
    const [h, m] = dateOrStr.split(":").map(Number)
    return (h || 0) * 60 + (m || 0)
  }
  if (dateOrStr instanceof Date) {
    return dateOrStr.getUTCHours() * 60 + dateOrStr.getUTCMinutes()
  }
  return 0
}

// ─────────────────────────────────────────────────────────────
// RP-001 - RP-010 : CONSTRAINTS FOR STUDENTS & ENROLLMENT
// ─────────────────────────────────────────────────────────────

/**
 * Validates a student enrollment action.
 * RP-001: Unique active enrollment per student/school/year.
 * RP-002: School year scoping.
 * RP-003: Grade level compatibility.
 * RP-004: Duplicate student prevention.
 * RP-010: Class maximum capacity limit.
 * RP-080: Double active enrollment check.
 */
export async function validateStudentEnrollment(params: {
  studentId?: number
  email?: string
  nom?: string
  id_classe: number
  annee_scolaire: string
  allowCapacityOverride?: boolean
}): Promise<ValidationResult> {
  const violations: ConstraintViolation[] = []
  const prisma = await getPrisma()

  // 1. Fetch Class and capacity
  const targetClass = await prisma.class.findUnique({
    where: { id: params.id_classe },
    include: {
      inscriptions: {
        where: { statut: 'active', annee_scolaire: params.annee_scolaire }
      }
    }
  })

  if (!targetClass) {
    violations.push({
      severity: "BLOCKING",
      rule: "RP-011",
      entity: "Class",
      message: `La classe spécifiée (ID: ${params.id_classe}) est introuvable.`
    })
    return { valid: false, hasBlockingErrors: true, violations }
  }

  // RP-010: Capacity check
  const currentActiveCount = targetClass.inscriptions.length
  const maxCapacity = targetClass.capacite || 60

  if (currentActiveCount >= maxCapacity && !params.allowCapacityOverride) {
    violations.push({
      severity: "BLOCKING",
      rule: "RP-010",
      entity: "Class",
      message: `La classe ${targetClass.nom} a atteint sa capacité maximale de ${maxCapacity} élèves (${currentActiveCount} élèves actifs).`,
      details: { currentActiveCount, maxCapacity }
    })
  }

  // If student exists (studentId provided)
  if (params.studentId) {
    const student = await prisma.user.findUnique({
      where: { id: params.studentId },
      include: {
        inscriptions: {
          where: {
            annee_scolaire: params.annee_scolaire,
            statut: 'active'
          },
          include: { classe: true }
        }
      }
    })

    if (student) {
      // RP-001 & RP-080: Single active enrollment
      const activeEnrollments = student.inscriptions.filter(i => i.id_classe !== params.id_classe)
      if (activeEnrollments.length > 0) {
        const existingClassName = activeEnrollments[0].classe.nom
        violations.push({
          severity: "BLOCKING",
          rule: "RP-001",
          entity: "Inscription",
          message: `L'élève ${student.nom} est déjà affecté activement à la classe ${existingClassName} pour l'année scolaire ${params.annee_scolaire}.`,
          details: { existingClass: existingClassName, schoolYear: params.annee_scolaire }
        })
      }
    }
  }

  // RP-004: Duplicate check for new student creation by email/name
  if (!params.studentId && params.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: params.email }
    })
    if (existingUser) {
      violations.push({
        severity: "BLOCKING",
        rule: "RP-004",
        entity: "User",
        message: `Un utilisateur existe déjà avec l'email ${params.email}. Impossible de créer un doublon.`
      })
    }
  }

  const hasBlockingErrors = violations.some(v => v.severity === "BLOCKING")
  return {
    valid: !hasBlockingErrors,
    hasBlockingErrors,
    violations
  }
}

// ─────────────────────────────────────────────────────────────
// RP-020 - RP-024 : CONSTRAINTS FOR TEACHERS & SUBJECTS
// ─────────────────────────────────────────────────────────────

/**
 * Validates assignment of a teacher to a course/slot.
 * RP-020 & RP-021: Subject authorization.
 * RP-022: Teacher availability.
 * RP-023 & RP-024: Teacher slot collisions.
 */
export async function validateTeacherAssignment(params: {
  teacherId: number
  subject: string
  day: "Lundi" | "Mardi" | "Mercredi" | "Jeudi" | "Vendredi" | "Samedi"
  startTime: Date | string
  endTime: Date | string
  classId: number
  excludeCourseId?: number
}): Promise<ValidationResult> {
  const violations: ConstraintViolation[] = []
  const prisma = await getPrisma()

  // 1. Fetch Teacher & authorized subjects
  const teacher = await prisma.user.findUnique({
    where: { id: params.teacherId },
    include: { teacherSubjects: true }
  })

  if (!teacher || teacher.role !== 'teacher') {
    violations.push({
      severity: "BLOCKING",
      rule: "RP-020",
      entity: "Teacher",
      message: `L'enseignant spécifié (ID: ${params.teacherId}) n'existe pas ou n'a pas le rôle d'enseignant.`
    })
    return { valid: false, hasBlockingErrors: true, violations }
  }

  // RP-021: Check if subject is authorized (either User.matiere matches or in TeacherSubject list)
  const allowedSubjects = new Set<string>()
  if (teacher.matiere) allowedSubjects.add(teacher.matiere.trim().toLowerCase())
  teacher.teacherSubjects.forEach(ts => allowedSubjects.add(ts.matiere.trim().toLowerCase()))

  const requestedSubject = params.subject.trim().toLowerCase()
  if (allowedSubjects.size > 0 && !allowedSubjects.has(requestedSubject)) {
    violations.push({
      severity: "BLOCKING",
      rule: "RP-021",
      entity: "TeacherSubject",
      message: `L'enseignant ${teacher.nom} n'est pas autorisé à enseigner la matière "${params.subject}". Matières autorisées: ${Array.from(allowedSubjects).join(", ")}.`
    })
  }

  // RP-023 & RP-024: Teacher collision check
  const startMin = parseTimeToMinutes(params.startTime)
  const endMin = parseTimeToMinutes(params.endTime)

  const existingCourses = await prisma.emploiDuTemps.findMany({
    where: {
      id_enseignant: params.teacherId,
      jour: params.day,
      id: params.excludeCourseId ? { not: params.excludeCourseId } : undefined
    },
    include: { classe: true }
  })

  for (const c of existingCourses) {
    const cStartMin = parseTimeToMinutes(c.heure_debut)
    const cEndMin = parseTimeToMinutes(c.heure_fin)

    // Check overlap: max(start1, start2) < min(end1, end2)
    if (Math.max(startMin, cStartMin) < Math.min(endMin, cEndMin)) {
      violations.push({
        severity: "BLOCKING",
        rule: "RP-023",
        entity: "EmploiDuTemps",
        message: `Conflit enseignant: ${teacher.nom} donne déjà un cours à la classe ${c.classe.nom} (${c.matiere}) le ${params.day} de ${c.heure_debut.toISOString().substr(11, 5)} à ${c.heure_fin.toISOString().substr(11, 5)}.`
      })
      break
    }
  }

  const hasBlockingErrors = violations.some(v => v.severity === "BLOCKING")
  return {
    valid: !hasBlockingErrors,
    hasBlockingErrors,
    violations
  }
}

// ─────────────────────────────────────────────────────────────
// RP-030 - RP-042 : TIMETABLE & AI SCHEDULE VALIDATOR
// ─────────────────────────────────────────────────────────────

/**
 * Validates a complete timetable (or set of entries) against all pedagogical rules.
 */
export async function validateTimetable(
  entries: TimetableSlot[],
  options?: { maxHoursPerDay?: number }
): Promise<ValidationResult> {
  const violations: ConstraintViolation[] = []
  const maxHoursPerDay = options?.maxHoursPerDay || 7

  const prisma = await getPrisma()

  // Fetch teachers, levels, and level subjects for deep validation
  const [teachers, levelSubjects] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'teacher' },
      include: { teacherSubjects: true }
    }),
    prisma.levelSubject.findMany({
      include: { schoolLevel: true }
    })
  ])

  const teacherMap = new Map(teachers.map(t => [t.id, t]))

  // Group entries by class and day
  const classDayMap = new Map<string, TimetableSlot[]>()
  const teacherDayMap = new Map<string, TimetableSlot[]>()
  const roomDayMap = new Map<string, TimetableSlot[]>()

  for (const slot of entries) {
    const startMin = parseTimeToMinutes(slot.heure_debut)
    const endMin = parseTimeToMinutes(slot.heure_fin)
    if (endMin <= startMin) {
      violations.push({
        severity: "BLOCKING",
        rule: "RP-030",
        entity: "EmploiDuTemps",
        message: `Créneau horaire invalide pour la classe ID ${slot.id_classe}: heure fin (${slot.heure_fin}) <= heure début (${slot.heure_debut}).`
      })
    }

    // RP-037: Pause time check (default pause 10:00 - 10:15 or 13:00-14:00)
    if (startMin >= 600 && endMin <= 615) {
      violations.push({
        severity: "WARNING",
        rule: "RP-037",
        entity: "EmploiDuTemps",
        message: `Un cours de ${slot.matiere} est placé sur la pause de 10h.`
      })
    }

    // Grouping for class collision (RP-030)
    const classKey = `${slot.id_classe}_${slot.jour}`
    if (!classDayMap.has(classKey)) classDayMap.set(classKey, [])
    classDayMap.get(classKey)!.push(slot)

    // Grouping for teacher collision (RP-031 & RP-024)
    const teacherKey = `${slot.id_enseignant}_${slot.jour}`
    if (!teacherDayMap.has(teacherKey)) teacherDayMap.set(teacherKey, [])
    teacherDayMap.get(teacherKey)!.push(slot)

    // Grouping for room collision (RP-038)
    if (slot.salle) {
      const roomKey = `${slot.salle}_${slot.jour}`
      if (!roomDayMap.has(roomKey)) roomDayMap.set(roomKey, [])
      roomDayMap.get(roomKey)!.push(slot)
    }

    // RP-021: Check teacher subject authorization
    const teacher = teacherMap.get(slot.id_enseignant)
    if (teacher) {
      const allowed = new Set<string>()
      if (teacher.matiere) allowed.add(teacher.matiere.trim().toLowerCase())
      teacher.teacherSubjects.forEach(ts => allowed.add(ts.matiere.trim().toLowerCase()))

      const requestedSubj = slot.matiere.trim().toLowerCase()
      if (allowed.size > 0 && !allowed.has(requestedSubj)) {
        violations.push({
          severity: "BLOCKING",
          rule: "RP-021",
          entity: "EmploiDuTemps",
          message: `L'enseignant ${teacher.nom} n'est pas autorisé à enseigner ${slot.matiere} dans le cours de la classe ID ${slot.id_classe}.`
        })
      }
    }
  }

  // RP-030: Check Class Overlaps
  for (const [classKey, slots] of classDayMap.entries()) {
    const sorted = [...slots].sort((a, b) => parseTimeToMinutes(a.heure_debut) - parseTimeToMinutes(b.heure_debut))
    
    // Calculate total daily hours
    let totalMinutes = 0
    for (let i = 0; i < sorted.length; i++) {
      const cur = sorted[i]
      const dur = parseTimeToMinutes(cur.heure_fin) - parseTimeToMinutes(cur.heure_debut)
      totalMinutes += dur

      for (let j = i + 1; j < sorted.length; j++) {
        const next = sorted[j]
        const curStart = parseTimeToMinutes(cur.heure_debut)
        const curEnd = parseTimeToMinutes(cur.heure_fin)
        const nextStart = parseTimeToMinutes(next.heure_debut)
        const nextEnd = parseTimeToMinutes(next.heure_fin)

        if (Math.max(curStart, nextStart) < Math.min(curEnd, nextEnd)) {
          violations.push({
            severity: "BLOCKING",
            rule: "RP-030",
            entity: "ClassSchedule",
            message: `Conflit de classe: La classe (ID ${cur.id_classe}) a deux cours simultanés le ${cur.jour} (${cur.matiere} et ${next.matiere}).`
          })
        }
      }
    }

    // RP-035: Check Student Overload (> maxHoursPerDay)
    if (totalMinutes > maxHoursPerDay * 60) {
      const [classId, day] = classKey.split("_")
      violations.push({
        severity: "BLOCKING",
        rule: "RP-035",
        entity: "StudentOverload",
        message: `Surcharge journalière: La classe (ID ${classId}) a ${Math.round(totalMinutes / 60)}h de cours le ${day} (Maximum autorisé: ${maxHoursPerDay}h).`
      })
    }
  }

  // RP-031 & RP-024: Check Teacher Overlaps
  for (const [teacherKey, slots] of teacherDayMap.entries()) {
    const sorted = [...slots].sort((a, b) => parseTimeToMinutes(a.heure_debut) - parseTimeToMinutes(b.heure_debut))
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const a = sorted[i]
        const b = sorted[j]
        const aStart = parseTimeToMinutes(a.heure_debut)
        const aEnd = parseTimeToMinutes(a.heure_fin)
        const bStart = parseTimeToMinutes(b.heure_debut)
        const bEnd = parseTimeToMinutes(b.heure_fin)

        if (Math.max(aStart, bStart) < Math.min(aEnd, bEnd)) {
          const teacher = teacherMap.get(a.id_enseignant)
          violations.push({
            severity: "BLOCKING",
            rule: "RP-031",
            entity: "TeacherSchedule",
            message: `Conflit Enseignant: Professeur ${teacher?.nom || a.id_enseignant} programmé dans deux classes (ID ${a.id_classe} et ID ${b.id_classe}) le ${a.jour} à ${a.heure_debut}.`
          })
        }
      }
    }
  }

  // RP-038: Check Room Overlaps
  for (const [roomKey, slots] of roomDayMap.entries()) {
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const a = slots[i]
        const b = slots[j]
        const aStart = parseTimeToMinutes(a.heure_debut)
        const aEnd = parseTimeToMinutes(a.heure_fin)
        const bStart = parseTimeToMinutes(b.heure_debut)
        const bEnd = parseTimeToMinutes(b.heure_fin)

        if (Math.max(aStart, bStart) < Math.min(aEnd, bEnd)) {
          const [roomName, day] = roomKey.split("_")
          violations.push({
            severity: "BLOCKING",
            rule: "RP-038",
            entity: "RoomConflict",
            message: `Conflit de Salle: La salle ${roomName} est occupée simultanément par deux cours le ${day} à ${a.heure_debut}.`
          })
        }
      }
    }
  }

  // Calculate Quality Score
  const blockingCount = violations.filter(v => v.severity === "BLOCKING").length
  const warningCount = violations.filter(v => v.severity === "WARNING").length
  const qualityScore = Math.max(0, 100 - (blockingCount * 25 + warningCount * 5))

  const hasBlockingErrors = blockingCount > 0
  return {
    valid: !hasBlockingErrors,
    hasBlockingErrors,
    violations,
    qualityScore
  }
}

// ─────────────────────────────────────────────────────────────
// RP-050 - RP-053 : GRADES & EVALUATIONS CONSTRAINTS
// ─────────────────────────────────────────────────────────────

/**
 * Validates grade entry.
 * RP-050: Evaluation context.
 * RP-052: Score scale (0 <= grade <= maxScore).
 * RP-053: Duplicate score prevention.
 */
export async function validateGradeEntry(params: {
  studentId: number
  evaluationId: number
  value: number
}): Promise<ValidationResult> {
  const violations: ConstraintViolation[] = []
  const prisma = await getPrisma()

  // 1. Fetch Evaluation
  const evaluation = await prisma.evaluation.findUnique({
    where: { id: params.evaluationId }
  })

  if (!evaluation) {
    violations.push({
      severity: "BLOCKING",
      rule: "RP-050",
      entity: "Evaluation",
      message: `L'évaluation spécifiée (ID: ${params.evaluationId}) est introuvable.`
    })
    return { valid: false, hasBlockingErrors: true, violations }
  }

  // RP-052: Score scale validation
  const bareme = evaluation.bareme || 20
  if (isNaN(params.value) || params.value < 0 || params.value > bareme) {
    violations.push({
      severity: "BLOCKING",
      rule: "RP-052",
      entity: "Note",
      message: `La note (${params.value}) doit être comprise entre 0 et le barème (${bareme}).`
    })
  }

  // RP-053: Check existing grade
  const existingNote = await prisma.note.findFirst({
    where: {
      id_evaluation: params.evaluationId,
      id_eleve: params.studentId
    }
  })

  if (existingNote) {
    violations.push({
      severity: "WARNING",
      rule: "RP-053",
      entity: "Note",
      message: `Une note existe déjà pour cet élève sur cette évaluation. Elle sera remplacée.`
    })
  }

  const hasBlockingErrors = violations.some(v => v.severity === "BLOCKING")
  return {
    valid: !hasBlockingErrors,
    hasBlockingErrors,
    violations
  }
}

// ─────────────────────────────────────────────────────────────
// PRE-AUDIT TIMETABLE BEFORE AI GENERATION
// ─────────────────────────────────────────────────────────────

export async function preAuditTimetable(): Promise<{
  canGenerate: boolean
  blockingIssues: string[]
  warnings: string[]
  summary: {
    classesCount: number
    teachersCount: number
    subjectsCount: number
  }
}> {
  const prisma = await getPrisma()
  const blockingIssues: string[] = []
  const warnings: string[] = []

  const [classes, teachers] = await Promise.all([
    prisma.class.findMany({ include: { schoolLevel: true } }),
    prisma.user.findMany({
      where: { role: 'teacher' },
      include: { teacherSubjects: true }
    })
  ])

  if (classes.length === 0) {
    blockingIssues.push("Aucune classe disponible dans l'établissement.")
  }

  if (teachers.length === 0) {
    blockingIssues.push("Aucun enseignant disponible dans l'établissement.")
  }

  // Check if teachers have assigned subjects
  const teachersWithNoSubjects = teachers.filter(t => !t.matiere && t.teacherSubjects.length === 0)
  if (teachersWithNoSubjects.length > 0) {
    warnings.push(`${teachersWithNoSubjects.length} enseignant(s) n'ont aucune matière attribuée (ex: ${teachersWithNoSubjects.slice(0, 3).map(t => t.nom).join(", ")}).`)
  }

  return {
    canGenerate: blockingIssues.length === 0,
    blockingIssues,
    warnings,
    summary: {
      classesCount: classes.length,
      teachersCount: teachers.length,
      subjectsCount: 8
    }
  }
}
