const fs = require('node:fs');
const { pool } = require('../src/db');
(async()=>{
  const client=await pool.connect();
  try {
    const results=await client.query(fs.readFileSync('database/auditoria.sql','utf8'));
    const queries=results.filter(r=>r.command==='SELECT');
    const summary={tabelasEncontradas:queries[0].rowCount,inconsistencias:queries.slice(1).map((r,i)=>({verificacao:i+1,quantidade:r.rowCount}))};
    console.log(JSON.stringify(summary,null,2));
    if(summary.tabelasEncontradas!==11||summary.inconsistencias.some(i=>i.quantidade>0))process.exitCode=1;
  } finally { await client.query('ROLLBACK');client.release(); }
})().catch(error=>{console.error('Auditoria não concluída:',error.code||error.name);process.exitCode=1;}).finally(()=>pool.end());
