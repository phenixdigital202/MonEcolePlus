import { masterPrisma } from '../lib/prisma';

async function main() {
  const ecoles = await masterPrisma.ecole.findMany();
  let count = 0;
  for (const e of ecoles) {
    if (e.db_url && (e.db_url.includes(':5432') || !e.db_url.includes('pgbouncer=true'))) {
      let updated = e.db_url.replace(':5432', ':6543');
      if (!updated.includes('pgbouncer=true')) {
        updated += (updated.includes('?') ? '&' : '?') + 'pgbouncer=true';
      }
      await masterPrisma.ecole.update({
        where: { id: e.id },
        data: { db_url: updated }
      });
      console.log(`[UPDATED] School ID ${e.id} (${e.subdomain}) -> ${updated}`);
      count++;
    }
  }
  console.log(`🎉 Successfully updated ${count} school DB URLs to Port 6543 Transaction Pooler!`);
}

main().catch(console.error).finally(() => masterPrisma.$disconnect());
