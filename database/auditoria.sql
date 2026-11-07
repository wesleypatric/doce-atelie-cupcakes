-- Somente leitura. Não altera tabelas ou registros.
BEGIN READ ONLY;
SELECT table_name FROM information_schema.tables
 WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
   AND table_name IN ('usuarios','enderecos','categorias','produtos','carrinhos',
   'itens_carrinho','pedidos','itens_pedido','pagamentos','eventos_pagamento','historico_pedidos')
 ORDER BY table_name;

-- Subtotal e mínimo de um item dependem de mais de uma linha.
SELECT p.id AS pedido_inconsistente
  FROM pedidos p LEFT JOIN itens_pedido i ON i.pedido_id = p.id
 GROUP BY p.id HAVING count(i.produto_id) = 0 OR p.subtotal <> coalesce(sum(i.subtotal),0);

-- Estoque reservado é uma redundância controlada, reconciliada com pedidos pendentes.
SELECT p.id AS produto_com_reserva_inconsistente
  FROM produtos p LEFT JOIN (
    SELECT i.produto_id, sum(i.quantidade) AS reservado
      FROM itens_pedido i JOIN pedidos o ON o.id = i.pedido_id
     WHERE o.status = 'aguardando_pagamento' GROUP BY i.produto_id
  ) r ON r.produto_id = p.id
 WHERE p.estoque_reservado <> coalesce(r.reservado,0);

SELECT o.id AS pedido_sem_historico FROM pedidos o
 WHERE NOT EXISTS (SELECT 1 FROM historico_pedidos h WHERE h.pedido_id = o.id);

SELECT g.id AS pagamento_com_valor_divergente FROM pagamentos g
 JOIN pedidos p ON p.id = g.pedido_id WHERE g.valor <> p.total;
ROLLBACK;
