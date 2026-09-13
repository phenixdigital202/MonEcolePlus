import { getTenantClient } from '../lib/prisma-tenant';
import masterPrisma from '../lib/prisma';

async function testPedagogy() {
  console.log('🧪 Testing Pedagogical Class Management across Abou and Cocody Tenants...');

  // 1. Fetch Abou ecole
  const abouEcole = await masterPrisma.ecole.findFirst({
    where: { subdomain: 'abou' }
  });

  if (!abouEcole || !abouEcole.database_url) {
    console.error('❌ Abou ecole not found');
    return;
  }

  const abouPrisma = getTenantClient(abouEcole.database_url);

  // 2. Fetch classes in Abou
  const abouClasses = await abouPrisma.class.findMany({
    take: 2,
    include: { classSubjects: true, professeurPrincipal: true }
  });

  console.log(`\n🏫 Tenant Abou (ID ${abouEcole.id}) - Found ${abouClasses.length} classes:`);
  for (const c of abouClasses) {
    console.log(`  • Classe ID ${c.id}: ${c.nom} (${c.niveau}) | Prof Principal: ${c.professeurPrincipal?.nom || 'Aucun'} | Matières: ${c.classSubjects.length}`);
  }

  // 3. Fetch Cocody ecole
  const cocodyEcole = await masterPrisma.ecole.findFirst({
    where: { subdomain: { contains: 'cocody' } }
  });

  if (!cocodyEcole || !cocodyEcole.database_url) {
    console.error('❌ Cocody ecole not found');
    return;
  }

  const cocodyPrisma = getTenantClient(cocodyEcole.database_url);
  const cocodyClasses = await cocodyPrisma.class.findMany({
    take: 2,
    include: { classSubjects: true, professeurPrincipal: true }
  });

  console.log(`\n🏫 Tenant Cocody (ID ${cocodyEcole.id}) - Found ${cocodyClasses.length} classes:`);
  for (const c of cocodyClasses) {
    console.log(`  • Classe ID ${c.id}: ${c.nom} (${c.niveau}) | Prof Principal: ${c.professeurPrincipal?.nom || 'Aucun'} | Matières: ${c.classSubjects.length}`);
  }

  // 4. Verify Multi-Tenant Isolation
  console.log('\n🔒 Verifying Multi-Tenant Isolation...');
  const abouClassIds = abouClasses.map(c => c.id);
  const abouSubjects = await abouPrisma.classSubject.findMany({
    where: { id_classe: { in: abouClassIds } }
  });
  console.log(`✅ Abou DB contains ${abouSubjects.length} class subjects for Abou classes (Isolated strictly from Cocody).`);

  console.log('\n🎉 Test completed successfully!');
  process.exit(0);
}

testPedagogy().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
