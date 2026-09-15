import http from 'http';
import https from 'https';

interface BenchmarkResult {
  url: string;
  concurrency: number;
  totalRequests: number;
  statusCounts: Record<string, number>;
  latencies: number[];
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  max: number;
  min: number;
  avg: number;
  errorRate: number;
}

async function makeRequest(targetUrl: string, followRedirects: boolean = false): Promise<{ statusCode: number; duration: number }> {
  const start = Date.now();
  return new Promise((resolve) => {
    const isHttps = targetUrl.startsWith('https:');
    const client = isHttps ? https : http;

    const req = client.get(targetUrl, { headers: { 'User-Agent': 'MonEcolePlus-ForensicTest/1.0' } }, (res) => {
      const statusCode = res.statusCode || 500;
      res.resume();

      if (followRedirects && (statusCode === 301 || statusCode === 302 || statusCode === 307 || statusCode === 308) && res.headers.location) {
        const redirectUrl = res.headers.location.startsWith('http') ? res.headers.location : `https://mon-ecole-plus.vercel.app${res.headers.location}`;
        makeRequest(redirectUrl, true).then(resolve);
      } else {
        const duration = Date.now() - start;
        resolve({ statusCode, duration });
      }
    });

    req.on('error', (err) => {
      const duration = Date.now() - start;
      resolve({ statusCode: 599, duration });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      const duration = Date.now() - start;
      resolve({ statusCode: 504, duration });
    });
  });
}

async function runBenchmark(
  url: string,
  totalRequests: number,
  concurrency: number,
  followRedirects: boolean = false,
  treat3xxAsError: boolean = true
): Promise<BenchmarkResult> {
  const latencies: number[] = [];
  const statusCounts: Record<string, number> = {};
  const queue = Array.from({ length: totalRequests });

  async function worker() {
    while (queue.length > 0) {
      queue.pop();
      const { statusCode, duration } = await makeRequest(url, followRedirects);
      statusCounts[statusCode] = (statusCounts[statusCode] || 0) + 1;
      latencies.push(duration);
    }
  }

  const workers = Array.from({ length: concurrency }).map(() => worker());
  await Promise.all(workers);

  latencies.sort((a, b) => a - b);
  const min = latencies[0] || 0;
  const max = latencies[latencies.length - 1] || 0;
  const avg = Number((latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1)).toFixed(2));
  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p90 = latencies[Math.floor(latencies.length * 0.9)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;

  let errorCount = 0;
  for (const [codeStr, count] of Object.entries(statusCounts)) {
    const code = parseInt(codeStr);
    if (treat3xxAsError) {
      if (code < 200 || code >= 300) errorCount += count;
    } else {
      if (code < 200 || code >= 400) errorCount += count;
    }
  }

  const errorRate = Number(((errorCount / totalRequests) * 100).toFixed(2));

  return {
    url,
    concurrency,
    totalRequests,
    statusCounts,
    latencies,
    p50,
    p90,
    p95,
    p99,
    max,
    min,
    avg,
    errorRate
  };
}

async function executeForensicDiagnostic() {
  console.log('🔬 STARTING FORENSIC BENCHMARK DIAGNOSTIC...\n');

  // TEST 1: HTTP without following redirects (Simulating the exact load test configuration)
  console.log('=== TEST 1: HTTP (http://mon-ecole-plus.vercel.app/) - 100 reqs, 10 conc (Without Following Redirects) ===');
  const test1 = await runBenchmark('http://mon-ecole-plus.vercel.app/', 100, 10, false, true);
  console.log('Results:', {
    statusCounts: test1.statusCounts,
    avgLatency: `${test1.avg} ms`,
    p90Latency: `${test1.p90} ms`,
    errorRate: `${test1.errorRate}% (308 redirect treated as error by load test tool)`
  });

  // TEST 2: HTTP WITH auto-following redirects
  console.log('\n=== TEST 2: HTTP (http://mon-ecole-plus.vercel.app/) - 50 reqs, 5 conc (With Auto-Following Redirects) ===');
  const test2 = await runBenchmark('http://mon-ecole-plus.vercel.app/', 50, 5, true, false);
  console.log('Results:', {
    statusCounts: test2.statusCounts,
    avgLatency: `${test2.avg} ms`,
    p90Latency: `${test2.p90} ms`,
    errorRate: `${test2.errorRate}%`
  });

  // TEST 3: Direct HTTPS (https://mon-ecole-plus.vercel.app/) Progressive Load
  console.log('\n=== TEST 3: Direct HTTPS (https://mon-ecole-plus.vercel.app/) Progressive Concurrency ===');
  for (const conc of [1, 5, 10, 25]) {
    const res = await runBenchmark('https://mon-ecole-plus.vercel.app/', 40, conc, false, false);
    console.log(`Concurrency ${conc}: Status=${JSON.stringify(res.statusCounts)}, Avg=${res.avg}ms, P50=${res.p50}ms, P90=${res.p90}ms, P99=${res.p99}ms, Errors=${res.errorRate}%`);
  }

  // TEST 4: Direct HTTPS /login Page Load
  console.log('\n=== TEST 4: Direct HTTPS /login Page Load ===');
  const test4 = await runBenchmark('https://mon-ecole-plus.vercel.app/login', 30, 5, false, false);
  console.log('Results:', {
    statusCounts: test4.statusCounts,
    avgLatency: `${test4.avg} ms`,
    p90Latency: `${test4.p90} ms`,
    errorRate: `${test4.errorRate}%`
  });

  console.log('\n🎉 FORENSIC BENCHMARK COMPLETE!');
  process.exit(0);
}

executeForensicDiagnostic().catch(err => {
  console.error('Diagnostic error:', err);
  process.exit(1);
});
