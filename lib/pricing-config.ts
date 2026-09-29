export interface PricingPlan {
  id: string
  name: string
  priceMonthly: string
  priceYearly: string
  priceYearlyTotal: string
  currency: string
  periodMonthly: string
  periodYearly: string
  description: string
  badge?: string
  features: string[]
  cta: string
  highlighted: boolean
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter Établissement",
    priceMonthly: "32 000 FCFA",
    priceYearly: "26 600 FCFA",
    priceYearlyTotal: "320 000 FCFA / an (2 mois offerts)",
    currency: "FCFA",
    periodMonthly: "/ mois",
    periodYearly: "/ mois (facturé annuellement)",
    description: "La puissance complète de MonÉcole+ pour les écoles jusqu'à 1 000 élèves.",
    features: [
      "Jusqu'à 1 000 élèves inclus",
      "Toutes les fonctionnalités Pro incluses",
      "Database physique dédiée par École",
      "Assistant IA MonÉcole+ inclus",
      "WhatsApp Cloud API & SMS automatiques",
      "Bulletins PDF & Certificats QR Code",
      "Paiements Mobile Money intégrés"
    ],
    cta: "Commencer l'essai (14j gratuits)",
    highlighted: false
  },
  {
    id: "pro",
    name: "Pro Établissement",
    priceMonthly: "55 000 FCFA",
    priceYearly: "45 800 FCFA",
    priceYearlyTotal: "550 000 FCFA / an (2 mois offerts)",
    currency: "FCFA",
    periodMonthly: "/ mois",
    periodYearly: "/ mois (facturé annuellement)",
    description: "Capacité illimitée et accompagnement prioritaire pour grands établissements.",
    badge: "LE PLUS POPULAIRE",
    features: [
      "Élèves & Classes ILLIMITÉS",
      "Toutes les fonctionnalités Starter +",
      "Database physique dédiée ultra-performante",
      "Assistant IA MonÉcole+ prioritaire",
      "WhatsApp Cloud API & SMS illimités",
      "Rapports statistiques avancés",
      "Support prioritaire 24/7 dédié"
    ],
    cta: "Créer mon école Pro",
    highlighted: true
  },
  {
    id: "entreprise",
    name: "Groupe & Réseau",
    priceMonthly: "Sur Mesure",
    priceYearly: "Sur Mesure",
    priceYearlyTotal: "Devis personnalisé personnalisé",
    currency: "",
    periodMonthly: "",
    periodYearly: "",
    description: "Solution sur-mesure pour les réseaux scolaires et groupes multi-sites.",
    badge: "MULTI-ÉTABLISSEMENTS",
    features: [
      "Gestion Multi-Établissements centralisée",
      "Master DB Centralisée + API Dédiée",
      "Sauvegardes automatiques en temps réel",
      "Accompagnement & formation sur site",
      "Garantie SLA de disponibilité 99.99%",
      "Directeur de compte dédié"
    ],
    cta: "Contacter notre équipe",
    highlighted: false
  }
]

export const DETAILED_COMPARISON_FEATURES = [
  {
    category: "Capacité & Établissement",
    items: [
      { name: "Nombre d'élèves", starter: "Jusqu'à 1 000", pro: "Illimité", entreprise: "Illimité" },
      { name: "Nombre de classes", starter: "Illimité", pro: "Illimité", entreprise: "Illimité" },
      { name: "Enseignants & Rôles", starter: "Illimité", pro: "Illimité", entreprise: "Illimité" },
      { name: "Multi-Établissements", starter: "Non", pro: "Non", entreprise: "Oui" }
    ]
  },
  {
    category: "Fonctionnalités Clés",
    items: [
      { name: "Bulletins & Reçus de paiement PDF", starter: "Oui", pro: "Oui", entreprise: "Oui" },
      { name: "Certificats de scolarité QR Code", starter: "Oui", pro: "Oui", entreprise: "Oui" },
      { name: "Assistant IA MonÉcole+", starter: "Inclus", pro: "Inclus Prioritaire", entreprise: "Sur-mesure" },
      { name: "WhatsApp Cloud API & SMS Auto", starter: "Inclus", pro: "Illimité", entreprise: "Illimité" },
      { name: "Isolation DB Physique Dédiée", starter: "Oui", pro: "Oui Ultra-performante", entreprise: "Dédiée Multi-sites" }
    ]
  },
  {
    category: "Support & Accompagnement",
    items: [
      { name: "Support technique", starter: "Email & WhatsApp", pro: "Prioritaire 24/7", entreprise: "Dédié 24/7" },
      { name: "Formation & Déploiement", starter: "Guidée en ligne", pro: "Accompagnement dédié", entreprise: "Sur site inclus" }
    ]
  }
]
