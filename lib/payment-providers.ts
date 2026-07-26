export interface PaymentProvider {
  initiatePayment(amount: number, phone: string, reference: string): Promise<{ success: boolean; transactionId: string; message: string }>
  verifyPayment(transactionId: string): Promise<{ success: boolean; status: "paye" | "en_attente" | "annule" }>
  refundPayment(transactionId: string, amount: number): Promise<{ success: boolean }>
}

export class OrangeMoneyProvider implements PaymentProvider {
  async initiatePayment(amount: number, phone: string, reference: string) {
    console.log(`[Orange Money API] Initiating payment of ${amount} CFA for ${phone} (Ref: ${reference})`)
    // Mock successful API response
    return {
      success: true,
      transactionId: `OM_${Math.floor(100000 + Math.random() * 900000)}`,
      message: "Demande USSD envoyée sur le mobile du client."
    }
  }

  async verifyPayment(transactionId: string) {
    console.log(`[Orange Money API] Verifying transaction ${transactionId}`)
    return { success: true, status: "paye" as const }
  }

  async refundPayment(transactionId: string, amount: number) {
    console.log(`[Orange Money API] Refunding ${amount} CFA for transaction ${transactionId}`)
    return { success: true }
  }
}

export class MtnMomoProvider implements PaymentProvider {
  async initiatePayment(amount: number, phone: string, reference: string) {
    console.log(`[MTN MoMo API] Initiating payment of ${amount} CFA for ${phone} (Ref: ${reference})`)
    return {
      success: true,
      transactionId: `MTN_${Math.floor(100000 + Math.random() * 900000)}`,
      message: "Veuillez valider le prompt MTN MoMo sur votre téléphone."
    }
  }

  async verifyPayment(transactionId: string) {
    console.log(`[MTN MoMo API] Verifying transaction ${transactionId}`)
    return { success: true, status: "paye" as const }
  }

  async refundPayment(transactionId: string, amount: number) {
    console.log(`[MTN MoMo API] Refunding ${amount} CFA for transaction ${transactionId}`)
    return { success: true }
  }
}

export class WaveProvider implements PaymentProvider {
  async initiatePayment(amount: number, phone: string, reference: string) {
    console.log(`[Wave API] Initiating payment of ${amount} CFA for ${phone} (Ref: ${reference})`)
    return {
      success: true,
      transactionId: `WV_${Math.floor(100000 + Math.random() * 900000)}`,
      message: "Lien de paiement Wave généré."
    }
  }

  async verifyPayment(transactionId: string) {
    console.log(`[Wave API] Verifying transaction ${transactionId}`)
    return { success: true, status: "paye" as const }
  }

  async refundPayment(transactionId: string, amount: number) {
    console.log(`[Wave API] Refunding ${amount} CFA for transaction ${transactionId}`)
    return { success: true }
  }
}

export function getPaymentProvider(name: string): PaymentProvider {
  switch (name.toLowerCase()) {
    case "orange_money":
    case "orange":
      return new OrangeMoneyProvider()
    case "mtn_momo":
    case "mtn":
      return new MtnMomoProvider()
    case "wave":
      return new WaveProvider()
    default:
      throw new Error(`Provider de paiement inconnu : ${name}`)
  }
}
