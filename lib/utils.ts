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
