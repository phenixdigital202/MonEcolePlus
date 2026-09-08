import prismaMaster from '../lib/prisma';

async function main() {
  try {
    const res = await prismaMaster.$executeRawUnsafe(`
      SELECT pg_terminate_backend(pid) 
      FROM pg_stat_activity 
      WHERE pid != pg_backend_pid() AND state = 'idle';
    `);
    console.log('Idle connections terminated:', res);
  } catch (err: any) {
    console.error('Error terminating connections:', err.message);
  } finally {
    await prismaMaster.$disconnect();
  }
}

main();
