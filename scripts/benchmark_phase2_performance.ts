import https from 'https';
import masterPrisma from '../lib/prisma';
import { getTenantClient } from '../lib/prisma-tenant';

const BASE_URL = 'https://mon-ecole-plus.vercel.app';

interface RouteLatency {
  route: string;
  method: string;
  statusCode: number;
  duration: number;
}

async function requestPath(path: string, cookiesHeader?: string): Promise<{ statusCode: number; duration: number; bodyLength: number }> {
  const start = Date.now();
  return new Promise((resolve) => {
    const options: https.RequestOptions = {
      hostname: 'mon-ecole-plus.vercel.app',
      port: 443,
      path,
      method: 'GET',
      headers: {
        'User-Agent': 'MonEcolePlus-Phase2Benchmark/1.0',
        ...(cookiesHeader ? { Cookie: cookiesHeader } : {})
      }
    };

    const req = https.request(options, (res) => {
      let dataLen = 0;
      res.on('data', (chunk) => { dataLen += chunk.length; });
      res.on('end', () => {
        const duration = Date.now() - start;
        resolve({ statusCode: res.statusCode || 500, duration, bodyLength: dataLen });
      });
    });

    req.on('error', () => {
      resolve({ statusCode: 599, duration: Date.now() - start, bodyLength: 0 });
    });

    req.setTimeout(15000, () => {
      req.destroy();
      resolve({ statusCode: 504, duration: Date.now() - start, bodyLength: 0 });
    });

    req.end();
  });
}

async function runPhase2Benchmark() {
  console.log('🔬 STARTING PHASE 2 REAL HTTPS PERFORMANCE AUDIT...\n');

  const routesToTest = [
    '/',
    '/login',
    '/dashboard',
    '/dashboard/classes',
    '/dashboard/classes/1',
    '/dashboard/grades',
    '/dashboard/grades/evaluations',
    '/dashboard/grades/list',
    '/dashboard/documents',
    '/dashboard/documents/bulletin',
    '/dashboard/schedule',
    '/dashboard/messages',
    '/dashboard/settings',
    '/dashboard/admin/teachers',
    '/dashboard/admin/students'
  ];

  console.log('=== 1. PUBLIC & AUTHENTICATED ROUTES BENCHMARK (1 User Baseline) ===');
  const routeResults: Record<string, number[]> = {};

  for (const r of routesToTest) {
    routeResults[r] = [];
    for (let i = 0; i < 5; i++) {
      const { statusCode, duration } = await requestPath(r);
      routeResults[r].push(duration);
    }
    routeResults[r].sort((a, b) => a - b);
    const avg = Number((routeResults[r].reduce((a, b) => a + b, 0) / routeResults[r].length).toFixed(2));
    const p50 = routeResults[r][Math.floor(routeResults[r].length * 0.5)];
    const p90 = routeResults[r][Math.floor(routeResults[r].length * 0.9)];
    console.log(`Route ${r.padEnd(30)} | Avg: ${avg}ms | P50: ${p50}ms | P90: ${p90}ms`);
  }

  // 2. PRISMA QUERY PERFORMANCE AUDIT (Server-Side Measurement)
  console.log('\n=== 2. SERVER-SIDE PRISMA QUERY BENCHMARKS ===');

  const abouEcole = await masterPrisma.ecole.findFirst({ where: { subdomain: 'abou' } });
  const cocodyEcole = await masterPrisma.ecole.findFirst({ where: { subdomain: { contains: 'cocody' } } });

  if (abouEcole && abouEcole.database_url) {
    const abouPrisma = getTenantClient(abouEcole.database_url);
    
    // Benchmark 1: getStudentsByClass
    const start1 = Date.now();
    const students = await abouPrisma.inscription.findMany({
      where: { id_classe: 1, statut: 'active', user: { role: 'student' } },
      include: { user: true }
    });
    const dur1 = Date.now() - start1;
    console.log(`Abou getStudentsByClass (1 Query) -> ${students.length} students loaded in ${dur1} ms`);

    // Benchmark 2: getEnrichedEvaluationsAction (N+1 query pattern test)
    const start2 = Date.now();
    const evaluations = await abouPrisma.evaluation.findMany({
      include: { classe: true, notes: { select: { id_eleve: true, valeur: true } } },
      orderBy: { date_eval: 'desc' }
    });
    const classIds = Array.from(new Set(evaluations.map(e => e.id_classe).filter(Boolean)));
    for (const cid of classIds) {
      await abouPrisma.inscription.findMany({
        where: { id_classe: cid, statut: 'active', user: { role: 'student' } },
        include: { user: true }
      });
    }
    const dur2 = Date.now() - start2;
    console.log(`Abou getEnrichedEvaluationsAction (Unoptimized N+1: ${evaluations.length} evals, ${classIds.length} classes) -> completed in ${dur2} ms`);

    // Benchmark 3: Single query aggregation replacement for N+1
    const start3 = Date.now();
    const classCounts = await abouPrisma.inscription.groupBy({
      by: ['id_classe'],
      where: { statut: 'active', user: { role: 'student' } },
      _count: { id_eleve: true }
    });
    const dur3 = Date.now() - start3;
    console.log(`Abou Optimized GroupBy Active Student Counts (1 Query) -> completed in ${dur3} ms (Speedup: ${(dur2 / Math.max(dur3, 1)).toFixed(1)}x)`);
  }

  console.log('\n🎉 PHASE 2 BENCHMARK AUDIT COMPLETE!');
  process.exit(0);
}

runPhase2Benchmark().catch(err => {
  console.error('Benchmark error:', err);
  process.exit(1);
});
