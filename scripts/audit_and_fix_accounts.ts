import masterPrisma from '../lib/prisma';
import { getTenantClient } from '../lib/prisma-tenant';
import bcrypt from 'bcryptjs';

interface AccountCheck {
  schoolName: string;
  expectedSubdomain: string;
  name: string;
  role: string;
  email: string;
}

const testAccounts: AccountCheck[] = [
  // 1. Cocody
  { schoolName: 'Lycée Moderne de Cocody', expectedSubdomain: 'cocody_1785950690672', name: 'SuperModif Cocody', role: 'admin', email: 'admin_cocody@monecole.ci' },
  { schoolName: 'Lycée Moderne de Cocody', expectedSubdomain: 'cocody_1785950690672', name: 'Professeur Koffi', role: 'teacher', email: 'koffi_cocody_1785950690672@monecole.ci' },
  { schoolName: 'Lycée Moderne de Cocody', expectedSubdomain: 'cocody_1785950690672', name: 'Professeur Konan', role: 'teacher', email: 'konan_cocody_1785950690672@monecole.ci' },
  { schoolName: 'Lycée Moderne de Cocody', expectedSubdomain: 'cocody_1785950690672', name: 'Jean Marc', role: 'student', email: 'jean_cocody_1785950690672@monecole.ci' },
  { schoolName: 'Lycée Moderne de Cocody', expectedSubdomain: 'cocody_1785950690672', name: 'Marie Chantal', role: 'student', email: 'marie_cocody_1785950690672@monecole.ci' },
  { schoolName: 'Lycée Moderne de Cocody', expectedSubdomain: 'cocody_1785950690672', name: 'Adama Traoré', role: 'student', email: 'adama_cocody_1785950690672@monecole.ci' },
  { schoolName: 'Lycée Moderne de Cocody', expectedSubdomain: 'cocody_1785950690672', name: 'Kouamé Aya', role: 'student', email: 'aya.kouame@monecole.ci' },
  { schoolName: 'Lycée Moderne de Cocody', expectedSubdomain: 'cocody_1785950690672', name: 'Traoré Mamadou', role: 'student', email: 'mamadou.traore@monecole.ci' },

  // 2. Abou
  { schoolName: "Lycée Moderne d'Abou", expectedSubdomain: 'abou', name: 'Admin Abou', role: 'admin', email: 'admin@abou.com' },
  { schoolName: "Lycée Moderne d'Abou", expectedSubdomain: 'abou', name: 'Prof Toure', role: 'teacher', email: 'prof@toure.com' },
  { schoolName: "Lycée Moderne d'Abou", expectedSubdomain: 'abou', name: 'M. KONE', role: 'teacher', email: 'sublimecom@gmail.com' },
  { schoolName: "Lycée Moderne d'Abou", expectedSubdomain: 'abou', name: 'Kone Aicha', role: 'parent', email: 'kone@aicha.com' },
  { schoolName: "Lycée Moderne d'Abou", expectedSubdomain: 'abou', name: 'AB TOURE', role: 'student', email: 'eleve@abtoure.com' },
  { schoolName: "Lycée Moderne d'Abou", expectedSubdomain: 'abou', name: 'KONE O DAOUD', role: 'student', email: 'konedahoud8@gmail.com' },
  { schoolName: "Lycée Moderne d'Abou", expectedSubdomain: 'abou', name: 'Bancali Bamba', role: 'student', email: 'eleve@bancoul1.com' },

  // 3. Judith Touré
  { schoolName: 'Lycée Judith Touré', expectedSubdomain: 'lycee-judith-toure', name: 'Judith Touré', role: 'admin', email: 'Admin@judith.com' },
  { schoolName: 'Lycée Judith Touré', expectedSubdomain: 'lycee-judith-toure', name: 'Prof Abou', role: 'teacher', email: 'prof@abou.com' },
  { schoolName: 'Lycée Judith Touré', expectedSubdomain: 'lycee-judith-toure', name: 'BAMBA ISSA', role: 'parent', email: 'admin@bambaissa.com' },
  { schoolName: 'Lycée Judith Touré', expectedSubdomain: 'lycee-judith-toure', name: 'BAMBA BANCOUL', role: 'student', email: 'eleve@bancoul.com' },

  // 4. Bingerville
  { schoolName: 'Lycée garçon de Bingerville', expectedSubdomain: 'lycee-garcon-de-bingerville', name: 'Ousmane Konaté', role: 'admin', email: 'cheickabdallah003@gmail.com' },

  // 5. Bamba Zakaria
  { schoolName: 'Bamba Zakaria Fatogoman', expectedSubdomain: 'bamba-zakaria-fatogoman', name: 'Bamba Fatogoman', role: 'admin', email: 'admin@bambazakaria.com' },

  // 6. Sana Odienné
  { schoolName: 'Lycée Sana Odienné', expectedSubdomain: 'lycee-sana-odienne', name: 'Aboubakar Touré', role: 'admin', email: 'info1sanahotel@gmail.com' },
];

async function auditAndFix() {
  console.log('🔍 Starting Comprehensive Account Audit & Diagnostic across Master and Tenant DBs...\n');

  const testPassword = 'password123';
  const defaultHash = await bcrypt.hash(testPassword, 10);

  let passCount = 0;
  let fixedCount = 0;
  let failCount = 0;

  for (const item of testAccounts) {
    const cleanEmail = item.email.toLowerCase().trim();
    console.log(`--------------------------------------------------`);
    console.log(`Testing Account: ${item.name} (${item.role}) <${cleanEmail}>`);
    console.log(`Target School: ${item.schoolName} (${item.expectedSubdomain})`);

    // 1. Fetch School in Master DB
    const ecole = await masterPrisma.ecole.findFirst({
      where: {
        OR: [
          { subdomain: item.expectedSubdomain },
          { nom: { contains: item.schoolName, mode: 'insensitive' } }
        ]
      }
    });

    if (!ecole) {
      console.error(`❌ CRITICAL: School "${item.schoolName}" not found in Master DB!`);
      failCount++;
      continue;
    }

    console.log(`  • Found School in Master DB: ID=${ecole.id}, subdomain=${ecole.subdomain}`);

    // 2. Fetch User in Master DB
    let masterUser = await masterPrisma.user.findFirst({
      where: { email: { equals: cleanEmail, mode: 'insensitive' } }
    });

    let masterUpdated = false;

    if (!masterUser) {
      console.log(`  ⚠️ Master User missing for ${cleanEmail}. Creating in Master DB...`);
      masterUser = await masterPrisma.user.create({
        data: {
          nom: item.name,
          email: cleanEmail,
          password: defaultHash,
          role: item.role as any,
          id_ecole: ecole.id
        }
      });
      masterUpdated = true;
      console.log(`  ✅ Master User created: ID=${masterUser.id}, school_id=${masterUser.id_ecole}`);
    } else {
      console.log(`  • Master User found: ID=${masterUser.id}, role=${masterUser.role}, school_id=${masterUser.id_ecole}`);
      
      // Check password match
      const pwdOk = await bcrypt.compare(testPassword, masterUser.password);
      if (!pwdOk) {
        console.log(`  ⚠️ Password mismatch in Master DB for ${cleanEmail}. Updating hash to password123...`);
        masterUser = await masterPrisma.user.update({
          where: { id: masterUser.id },
          data: { password: defaultHash }
        });
        masterUpdated = true;
      }

      // Check school_id match
      if (masterUser.id_ecole !== ecole.id) {
        console.log(`  ⚠️ Incorrect school_id in Master User (${masterUser.id_ecole} vs ${ecole.id}). Updating...`);
        masterUser = await masterPrisma.user.update({
          where: { id: masterUser.id },
          data: { id_ecole: ecole.id }
        });
        masterUpdated = true;
      }

      // Check role match
      if (masterUser.role.toLowerCase() !== item.role.toLowerCase()) {
        console.log(`  ⚠️ Role mismatch in Master User (${masterUser.role} vs ${item.role}). Updating...`);
        masterUser = await masterPrisma.user.update({
          where: { id: masterUser.id },
          data: { role: item.role as any }
        });
        masterUpdated = true;
      }
    }

    // 3. Fetch User in Tenant DB
    if (!ecole.database_url) {
      console.error(`  ❌ CRITICAL: No database_url for ecole ID=${ecole.id}`);
      failCount++;
      continue;
    }

    const tenantPrisma = getTenantClient(ecole.database_url);
    let tenantUser = await tenantPrisma.user.findFirst({
      where: { email: { equals: cleanEmail, mode: 'insensitive' } }
    });

    let tenantUpdated = false;

    if (!tenantUser) {
      console.log(`  ⚠️ Tenant User missing in [${ecole.subdomain}] for ${cleanEmail}. Syncing to Tenant DB...`);
      tenantUser = await tenantPrisma.user.create({
        data: {
          nom: item.name,
          email: cleanEmail,
          password: defaultHash,
          role: item.role as any,
          id_ecole: ecole.id
        }
      });
      tenantUpdated = true;
      console.log(`  ✅ Tenant User created: ID=${tenantUser.id}`);
    } else {
      console.log(`  • Tenant User found: ID=${tenantUser.id}, role=${tenantUser.role}`);
      const tenantPwdOk = await bcrypt.compare(testPassword, tenantUser.password);
      if (!tenantPwdOk) {
        console.log(`  ⚠️ Password mismatch in Tenant DB for ${cleanEmail}. Updating hash...`);
        tenantUser = await tenantPrisma.user.update({
          where: { id: tenantUser.id },
          data: { password: defaultHash }
        });
        tenantUpdated = true;
      }
    }

    if (masterUpdated || tenantUpdated) {
      fixedCount++;
      console.log(`  🔧 Account FIX APPLIED AND VALIDATED in DBs for ${cleanEmail}`);
    } else {
      passCount++;
      console.log(`  ✅ Account DB checks PASS for ${cleanEmail}`);
    }
  }

  console.log(`\n==================================================`);
  console.log(`SUMMARY OF DB AUDIT & REPAIR:`);
  console.log(`Total Accounts Tested: ${testAccounts.length}`);
  console.log(`Already PASS in BDD:   ${passCount}`);
  console.log(`Repaired in BDD:       ${fixedCount}`);
  console.log(`Failed in BDD:         ${failCount}`);
  console.log(`==================================================\n`);

  process.exit(0);
}

auditAndFix().catch(err => {
  console.error('Audit script error:', err);
  process.exit(1);
});
