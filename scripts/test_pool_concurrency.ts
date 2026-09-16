import { getPrisma } from '../lib/tenant-context'

async function testPoolConcurrency() {
  console.log('⚡ TESTING POSTGRESQL/PRISMA POOL CONCURRENCY OPTIMIZATIONS...\n')

  const userLoads = [1, 5, 10, 25, 50, 100, 150, 200, 250, 300, 500, 750, 1000]

  console.log('| VUs | RPS | P50 (ms) | P90 (ms) | P95 (ms) | P99 (ms) | Errors (%) | P2024 Pool Timeout | Status |')
  console.log('|---:|---:|---:|---:|---:|---:|---:|:---:|:---:|')

  for (const concurrency of userLoads) {
    const timings: number[] = []
    let errors = 0
    let poolTimeouts = 0
    const rounds = 3

    const tStart = Date.now()
    for (let r = 0; r < rounds; r++) {
      const batchPromises = Array.from({ length: concurrency }).map(async () => {
        const t0 = Date.now()
        try {
          process.env.TEST_TENANT_ID = 'abou'
          const prisma = await getPrisma()
          await prisma.evaluation.findMany({ take: 10 })
          return Date.now() - t0
        } catch (err: any) {
          errors++
          if (err?.message?.includes('Timed out fetching') || err?.code === 'P2024') {
            poolTimeouts++
          }
          return Date.now() - t0
        }
      })
      const results = await Promise.all(batchPromises)
      timings.push(...results)
    }
    const totalBatchDuration = Date.now() - tStart

    timings.sort((a, b) => a - b)
    const rps = parseFloat(((concurrency * rounds) / (totalBatchDuration / 1000)).toFixed(1))
    const p50 = timings[Math.floor(timings.length * 0.50)]
    const p90 = timings[Math.floor(timings.length * 0.90)]
    const p95 = timings[Math.floor(timings.length * 0.95)]
    const p99 = timings[Math.floor(timings.length * 0.99)]
    const errRate = parseFloat(((errors / (concurrency * rounds)) * 100).toFixed(2))
    const status = errRate === 0 ? 'OPTIMAL' : errRate < 1 ? 'ACCEPTABLE' : 'DEGRADED'

    console.log(`| ${concurrency.toString().padStart(4)} | ${rps.toString().padStart(5)} | ${p50.toString().padStart(8)} | ${p90.toString().padStart(8)} | ${p95.toString().padStart(8)} | ${p99.toString().padStart(8)} | ${errRate.toFixed(2).padStart(10)}% | ${poolTimeouts.toString().padStart(18)} | ${status} |`)

    if (errRate > 1.0) {
      console.log(`\n⚠️ LOAD TEST AUTO-STOPPED at ${concurrency} VUs (Error rate ${errRate}% > 1%).`)
      break
    }
  }

  console.log('\n🎉 POOL CONCURRENCY BENCHMARK COMPLETE!')
}

testPoolConcurrency().catch(console.error)
