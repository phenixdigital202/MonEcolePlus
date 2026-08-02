import { LandingHeader } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export default function FAQPage() {
  const faqs = [
    {
      q: "Comment puis-je créer un compte pour mon établissement ?",
      a: "La création est très simple. Cliquez sur le bouton 'Créer mon établissement' dans l'en-tête, remplissez le formulaire avec vos coordonnées professionnelles, puis configurez vos classes. Vous bénéficiez d'un essai gratuit de 14 jours."
    },
    {
      q: "Quels sont les moyens de paiement acceptés pour la scolarité ?",
      a: "MonÉcole+ intègre nativement les principaux opérateurs de Mobile Money d'Afrique de l'Ouest (Orange Money, MTN MoMo, Wave) ainsi que les règlements par Cartes Bancaires (Visa, MasterCard)."
    },
    {
      q: "L'intelligence artificielle est-elle disponible sur toutes les formules ?",
      a: "Le moteur prédictif et l'assistant d'analyse IA (détection des élèves en difficulté, prévision de réussite aux examens) sont intégrés à partir de la formule Professional et pleinement développés dans l'offre Enterprise."
    },
    {
      q: "Mes données scolaires sont-elles sécurisées ?",
      a: "Absolument. Nous appliquons un cloisonnement strict par base de données multi-tenant hébergée de manière sécurisée sous Supabase avec un middleware de filtrage de sécurité et chiffrement des mots de passe."
    }
  ]

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <LandingHeader />
      
      <main className="max-w-4xl mx-auto px-6 lg:px-8 pt-32 pb-24 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Questions Fréquentes
          </h1>
          <p className="text-sm sm:text-base text-[#a1a1aa] leading-relaxed">
            Retrouvez les réponses aux questions les plus courantes posées par les chefs d&apos;établissement.
          </p>
        </div>

        <div className="space-y-6 pt-6 border-t border-[#27272a]">
          {faqs.map((f, i) => (
            <div key={i} className="p-6 rounded-2xl border border-[#27272a] bg-neutral-950/40 space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-white">🙋‍♂️ {f.q}</h3>
              <p className="text-xs sm:text-sm text-[#a1a1aa] leading-relaxed pl-6">{f.a}</p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
