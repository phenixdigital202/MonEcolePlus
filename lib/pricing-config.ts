export interface PricingPlan {
  id: string
  name: string
  price: string
  currency: string
  period: string
  description: string
  badge?: string
  features: string[]
  cta: string
  highlighted: boolean
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "decouverte",
    name: "Découverte",
    price: "0 FCFA",
    currency: "FCFA",
    period: "/ 14 jours",
    description: "Idéal pour tester gratuitement toutes les fonctionnalités de MonÉcole+.",
    features: [
      "Jusqu'à 150 élèves",
      "Gestion administrative & Inscriptions",
      "Saisie des notes & Bulletins PDF",
      "Calcul des moyennes & rangs",
      "Fiche Établissement dédiée",
      "Support réactif par email"
    ],
    cta: "Essai gratuit 14 jours",
    highlighted: false
  },
  {
    id: "pro",
    name: "Pro Établissement",
    price: "49 000 FCFA",
    currency: "FCFA",
    period: "/ mois",
    description: "Pour les écoles exigeantes voulant l'isolation DB & WhatsApp Cloud.",
    badge: "RECOMMANDÉ POUR LES ÉCOLES",
    features: [
      "Élèves & Classes illimités",
      "Database physique dédiée par École",
      "Assistant IA MonÉcole+ inclus",
      "WhatsApp Cloud API & SMS automatiques",
      "Certificats de scolarité QR Code",
      "Paiements Mobile Money intégrés",
      "Support prioritaire 24/7"
    ],
    cta: "Créer mon école Pro",
    highlighted: true
  },
  {
    id: "entreprise",
    name: "Réseaux & Groupe",
    price: "Sur Mesure",
    currency: "",
    period: "",
    description: "Solutions sur mesure pour les groupes scolaires multi-sites.",
    features: [
      "Gestion Multi-Établissements centralisée",
      "Master DB Centralisée + API Dédiée",
      "Sauvegardes automatiques quotidiennes",
      "Accompagnement & formation sur site",
      "SLA de disponibilité 99.9%",
      "Directeur de compte dédié"
    ],
    cta: "Contacter l'équipe",
    highlighted: false
  }
]

export const DETAILED_COMPARISON_FEATURES = [
  {
    category: "Capacité & Établissement",
    items: [
      { name: "Nombre d'élèves", decouverte: "Jusqu'à 150", pro: "Illimité", entreprise: "Illimité" },
      { name: "Nombre de classes", decouverte: "Illimité", pro: "Illimité", entreprise: "Illimité" },
      { name: "Enseignants & Rôles", decouverte: "Illimité", pro: "Illimité", entreprise: "Illimité" },
      { name: "Multi-Établissements", decouverte: "Non", pro: "Non", entreprise: "Oui" }
    ]
  },
  {
    category: "Fonctionnalités Clés",
    items: [
      { name: "Bulletins & Reçus de paiement PDF", decouverte: "Oui", pro: "Oui", entreprise: "Oui" },
      { name: "Certificats de scolarité QR Code", decouverte: "Oui", pro: "Oui", entreprise: "Oui" },
      { name: "Assistant IA MonÉcole+", decouverte: "Optionnel", pro: "Inclus", entreprise: "Personnalisé" },
      { name: "WhatsApp Cloud API & SMS Auto", decouverte: "Non", pro: "Inclus", entreprise: "Illimité" },
      { name: "Isolation DB Physique Dédiée", decouverte: "Non", pro: "Oui", entreprise: "Oui" }
    ]
  },
  {
    category: "Support & Accompagnement",
    items: [
      { name: "Support technique", decouverte: "Email", pro: "Prioritaire 24/7", entreprise: "Dédié 24/7" },
      { name: "Formation sur site", decouverte: "Optionnelle", pro: "En ligne", entreprise: "Inclus sur site" }
    ]
  }
]
