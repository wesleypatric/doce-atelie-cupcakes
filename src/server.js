const http = require('node:http');
const { pool } = require('./db');
const { readFile } = require('node:fs/promises');
const path = require('node:path');
const staticFiles = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/index.html': ['index.html', 'text/html; charset=utf-8'],
  '/styles.css': ['styles.css', 'text/css; charset=utf-8'],
  '/app.js': ['app.js', 'text/javascript; charset=utf-8'],
  '/design.html': ['design.html', 'text/html; charset=utf-8'],
  '/revisao.html': ['revisao.html', 'text/html; charset=utf-8']
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') {
    res.writeHead(405, { Allow: 'GET' });
    return res.end(JSON.stringify({ erro: 'Método não permitido.' }));
  }
  try {
    if (staticFiles[url.pathname]) {
      const [file, type] = staticFiles[url.pathname];
      const content = await readFile(path.join(__dirname, '..', 'public', file));
      res.setHeader('Content-Type', type);
      return res.end(content);
    }
    if (url.pathname === '/api/saude') {
      await pool.query('SELECT 1');
      return res.end(JSON.stringify({ status: 'ok', banco: 'conectado' }));
    }
    if (url.pathname === '/api/produtos') {
      const busca = url.searchParams.get('busca') || '';
      if (busca.length > 120) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ erro: 'Busca deve ter até 120 caracteres.' }));
      }
      const { rows } = await pool.query(
        `SELECT id, nome, descricao, ingredientes, alergenicos, imagem_url,
                preco, disponivel, categoria_id
           FROM produtos
          WHERE ativo = true AND nome ILIKE $1
          ORDER BY nome, id LIMIT 100`,
        [`%${busca}%`]
      );
      return res.end(JSON.stringify(rows));
    }
    res.statusCode = 404;
    res.end(JSON.stringify({ erro: 'Rota não encontrada.' }));
  } catch (error) {
    console.error('Falha na consulta ao banco:', error.code || 'desconhecida');
    res.statusCode = 503;
    res.end(JSON.stringify({ erro: 'Serviço temporariamente indisponível.' }));
  }
});

const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || '127.0.0.1';

server.on('error', async (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`A porta ${port} está ocupada. Defina outra PORT no arquivo .env e execute npm.cmd start novamente.`);
  } else {
    console.error('Não foi possível iniciar a API:', error.code || error.message);
  }
  await pool.end();
  process.exitCode = 1;
});

server.listen(port, host, () => {
  console.log(`API local iniciada em http://${host}:${port}. Consulte /api/saude e /api/produtos.`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(async () => { await pool.end(); process.exit(0); });
  });
}
