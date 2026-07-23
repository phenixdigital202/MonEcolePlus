import { getPrisma } from "@/lib/tenant-context"
import { getClasses } from "@/lib/grades-actions"
import { GradesListView } from "@/components/dashboard/grades-list-view"

export default async function GradesListPage() {
  const prisma = await getPrisma()

  const [notes, classes] = await Promise.all([
    prisma.note.findMany({
      include: {
        user: true,
        evaluation: {
          include: {
            classe: true
          }
        }
      },
      orderBy: { evaluation: { date_eval: 'desc' } }
    }),
    getClasses()
  ])

  const serializedNotes = JSON.parse(JSON.stringify(notes))

  return <GradesListView initialNotes={serializedNotes} classes={classes} />
}
