import { getClasses, getEnrichedEvaluationsAction } from "@/lib/grades-actions"
import { EvaluationsListView } from "@/components/dashboard/evaluations-list-view"

export default async function EvaluationsListPage() {
  const evaluations = await getEnrichedEvaluationsAction()
  const classes = await getClasses()

  return <EvaluationsListView initialEvaluations={evaluations} classes={classes} />
}
