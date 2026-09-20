import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function numberToFrenchWords(n: number): string {
  if (isNaN(n) || n === 0) return "Zéro franc CFA"

  const units = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"]
  const teens = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"]
  const tens = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingts", "quatre-vingt-dix"]

  function convertGroup(num: number): string {
    let res = ""
    const h = Math.floor(num / 100)
    const r = num % 100

    if (h > 0) {
      if (h === 1) res += "cent"
      else res += units[h] + " cent"
      if (r > 0) res += " "
    }

    if (r > 0) {
      if (r < 10) {
        res += units[r]
      } else if (r >= 10 && r < 20) {
        res += teens[r - 10]
      } else if (r >= 20 && r < 70) {
        const t = Math.floor(r / 10)
        const u = r % 10
        if (u === 1 && t !== 8) res += tens[t] + " et un"
        else if (u > 0) res += tens[t] + "-" + units[u]
        else res += tens[t]
      } else if (r >= 70 && r < 80) {
        const u = r % 10
        if (u === 1) res += "soixante et onze"
        else res += "soixante-" + teens[u]
      } else if (r >= 80 && r < 90) {
        const u = r % 10
        if (u === 0) res += "quatre-vingts"
        else res += "quatre-vingt-" + units[u]
      } else if (r >= 90 && r < 100) {
        const u = r % 10
        res += "quatre-vingt-" + teens[u]
      }
    }
    return res
  }

  let amount = Math.floor(Math.abs(n))
  let result = ""

  const millions = Math.floor(amount / 1000000)
  amount %= 1000000
  const thousands = Math.floor(amount / 1000)
  const remainder = amount % 1000

  if (millions > 0) {
    if (millions === 1) result += "un million "
    else result += convertGroup(millions) + " millions "
  }

  if (thousands > 0) {
    if (thousands === 1) result += "mille "
    else result += convertGroup(thousands) + " mille "
  }

  if (remainder > 0) {
    result += convertGroup(remainder)
  }

  result = result.trim()
  if (!result) return "Zéro franc CFA"

  result = result.charAt(0).toUpperCase() + result.slice(1)
  return result + " francs CFA"
}

export function getClassSortRank(name: string = "", level: string = ""): number {
  const text = `${name} ${level}`.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  // 1. Maternelle / Jardin
  if (/\b(creche|tps|toute petite)\b/.test(text)) return 10
  if (/\b(ps|petite section)\b/.test(text)) return 20
  if (/\b(ms|moyenne section)\b/.test(text)) return 30
  if (/\b(gs|grande section)\b/.test(text)) return 40
  if (/\b(jardin|maternelle|nursery|prescolaire)\b/.test(text)) return 50

  // 2. Primaire
  if (/\bci\b/.test(text)) return 90
  if (/\bcp\s*1[a-z0-9]*\b|\bcp1[a-z0-9]*\b/.test(text)) return 100
  if (/\bcp\s*2[a-z0-9]*\b|\bcp2[a-z0-9]*\b/.test(text)) return 110
  if (/\bcp\b/.test(text)) return 105
  if (/\bce\s*1[a-z0-9]*\b|\bce1[a-z0-9]*\b/.test(text)) return 120
  if (/\bce\s*2[a-z0-9]*\b|\bce2[a-z0-9]*\b/.test(text)) return 130
  if (/\bcm\s*1[a-z0-9]*\b|\bcm1[a-z0-9]*\b/.test(text)) return 140
  if (/\bcm\s*2[a-z0-9]*\b|\bcm2[a-z0-9]*\b/.test(text)) return 150

  // 3. Collège (6ème, 5ème, 4ème, 3ème)
  if (/\b6\s*(e|eme|eme[a-z0-9]*|sixieme)\b/.test(text) || /^6\b/.test(text) || /^6[a-z0-9]/.test(text)) return 200
  if (/\b5\s*(e|eme|eme[a-z0-9]*|cinquieme)\b/.test(text) || /^5\b/.test(text) || /^5[a-z0-9]/.test(text)) return 210
  if (/\b4\s*(e|eme|eme[a-z0-9]*|quatrieme)\b/.test(text) || /^4\b/.test(text) || /^4[a-z0-9]/.test(text)) return 220
  if (/\b3\s*(e|eme|eme[a-z0-9]*|troisieme)\b/.test(text) || /^3\b/.test(text) || /^3[a-z0-9]/.test(text)) return 230

  // 4. Lycée (2nde, 1ère, Terminale)
  if (/\b(2\s*nd|2\s*nde|2nde[a-z0-9]*|seconde)\b/.test(text) || /^2\b/.test(text) || /^2[a-z0-9]/.test(text)) return 300
  if (/\b(1\s*er|1\s*ere|1ere[a-z0-9]*|premiere)\b/.test(text) || /^1\b/.test(text) || /^1[a-z0-9]/.test(text)) return 310
  if (/\b(terminale[a-z0-9]*|tle[a-z0-9]*|term[a-z0-9]*)\b/.test(text)) return 320

  // Level fallbacks
  if (/\bmaternelle\b/.test(text)) return 50
  if (/\bprimaire\b/.test(text)) return 160
  if (/\bcollege\b/.test(text)) return 240
  if (/\blycee\b/.test(text)) return 330

  return 999
}

export function sortClasses<T extends { name?: string; nom?: string; level?: string; niveau?: string }>(classes: T[]): T[] {
  if (!Array.isArray(classes)) return []
  return [...classes].sort((a, b) => {
    const nameA = a.name || a.nom || ""
    const levelA = a.level || a.niveau || ""
    const nameB = b.name || b.nom || ""
    const levelB = b.level || b.niveau || ""

    const rankA = getClassSortRank(nameA, levelA)
    const rankB = getClassSortRank(nameB, levelB)

    if (rankA !== rankB) {
      return rankA - rankB
    }

    return nameA.localeCompare(nameB, "fr", { numeric: true, sensitivity: "base" })
  })
}

