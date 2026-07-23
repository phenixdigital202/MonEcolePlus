import { NextRequest, NextResponse } from "next/server"
import { getPrisma } from "@/lib/tenant-context"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get("classId")
  const semester = searchParams.get("semester")

  if (!classId) {
    return NextResponse.json({ error: "classId is required" }, { status: 400 })
  }

  try {
    const prisma = await getPrisma()
    const id = parseInt(classId)
    
    // Fetch all students in the class with their notes for this evaluation period
    const inscriptions = await prisma.inscription.findMany({
      where: { id_classe: id },
      include: {
        user: {
          include: {
            notes: {
              where: {
                evaluation: {
                  id_classe: id
                }
              },
              include: {
                evaluation: true
              }
            }
          }
        }
      }
    })

    const studentsData = inscriptions.map(i => {
      const student = i.user
      const notes = student.notes || []
      const avg = notes.length > 0 
        ? notes.reduce((acc, n) => acc + Number(n.valeur), 0) / notes.length
        : 0

      return {
        id: student.id,
        name: student.nom,
        email: student.email,
        avg: avg,
        notesCount: notes.length,
        notes: notes.map(n => ({
          matiere: n.evaluation.matiere,
          valeur: Number(n.valeur),
          type: n.evaluation.type_eval
        }))
      }
    })

    // Sort by average descending
    studentsData.sort((a, b) => b.avg - a.avg)

    return NextResponse.json(studentsData)
  } catch (error) {
    console.error("Error fetching report data:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
