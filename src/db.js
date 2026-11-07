const { Pool } = require('pg');

// O driver lê PGHOST, PGPORT, PGDATABASE, PGUSER e PGPASSWORD.
const pool = new Pool({ max: 10, connectionTimeoutMillis: 5000 });
pool.on('error', (error) => {
  console.error('Falha em conexão ociosa do PostgreSQL:', error.code);
});

async function transaction(work) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch { /* preserva erro original */ }
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { pool, transaction };
