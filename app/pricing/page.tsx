import TarifsPage from "@/app/tarifs/page"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tarifs & Formules | MonÉcole+",
  description: "Découvrez nos offres simples et adaptées aux établissements scolaires en FCFA.",
}

export default function PricingPage() {
  return <TarifsPage />
}
