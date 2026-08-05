import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ success: false, error: "Identifiant manquant." }, { status: 400 })
  }

  const masterPrisma = new PrismaClient()

  try {
    // 1. Search in master database
    const doc = await masterPrisma.verifiedDocument.findUnique({
      where: { id }
    })

    if (!doc) {
      // 2. If not found in master, search in tenant databases
      const ecoles = await masterPrisma.ecole.findMany()
      for (const ecole of ecoles) {
        if (!ecole.database_url) continue
        
        const tenantPrisma = new PrismaClient({
          datasources: { db: { url: ecole.database_url } }
        })
        try {
          const tenantDoc = await tenantPrisma.verifiedDocument.findUnique({
            where: { id }
          })
          if (tenantDoc) {
            return NextResponse.json({
              success: true,
              data: {
                id: tenantDoc.id,
                numeroUnique: tenantDoc.numeroUnique,
                hashSha256: tenantDoc.hashSha256,
                typeDocument: tenantDoc.typeDocument,
                dateGeneration: tenantDoc.dateGeneration,
                schoolName: ecole.nom
              }
            })
          }
        } catch (e) {
        } finally {
          await tenantPrisma.$disconnect()
        }
      }

      return NextResponse.json({ success: false, error: "Document introuvable." }, { status: 404 })
    }

    // Find issuer school name
    const school = await masterPrisma.ecole.findUnique({
      where: { id: doc.id_ecole }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: doc.id,
        numeroUnique: doc.numeroUnique,
        hashSha256: doc.hashSha256,
        typeDocument: doc.typeDocument,
        dateGeneration: doc.dateGeneration,
        schoolName: school?.nom || "Établissement MonÉcole+"
      }
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  } finally {
    await masterPrisma.$disconnect()
  }
}
