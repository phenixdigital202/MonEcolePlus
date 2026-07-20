import { getPrisma } from "@/lib/tenant-context"
import { getClasses } from "@/lib/grades-actions"
import { EvaluationsListView } from "@/components/dashboard/evaluations-list-view"

export default async function EvaluationsListPage() {
  const prisma = await getPrisma()
  const evaluations = await prisma.evaluation.findMany({
    include: {
      classes: true,
      _count: {
        select: { notes: true }
      }
    },
    orderBy: { date_eval: 'desc' }
  })

  const classes = await getClasses()

  return <EvaluationsListView initialEvaluations={evaluations} classes={classes} />
}
