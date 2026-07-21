import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get("classId")
  const semester = searchParams.get("semester")

  if (!classId) {
    return NextResponse.json({ error: "classId is required" }, { status: 400 })
  }

  try {
    const id = parseInt(classId)
    
    // Fetch all students in the class
    const inscriptions = await prisma.inscription.findMany({
      where: { id_classe: id },
      include: { user: {
        include: {
          notes: {
            where: {
              evaluation: {
                id_classe: id,
                // In a real app, we would filter by date/semester
                // periode: semester 
              }
            }
          }
        }
      } }
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
        avg: avg
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
