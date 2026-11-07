-- Apenas catálogo fictício para desenvolvimento. Não cria contas ou senhas.
BEGIN;
INSERT INTO categorias(nome) VALUES ('Tradicionais'), ('Especiais');
INSERT INTO produtos(categoria_id, nome, descricao, ingredientes, alergenicos, preco, estoque_fisico)
SELECT id, 'Cupcake de chocolate', 'Massa de chocolate com cobertura de brigadeiro.',
    'Farinha de trigo, leite, ovos, açúcar, cacau e manteiga.',
    'Contém trigo, leite e ovos. Contém glúten.', 12.50, 30
FROM categorias WHERE nome = 'Tradicionais';
INSERT INTO produtos(categoria_id, nome, descricao, ingredientes, alergenicos, preco, estoque_fisico)
SELECT id, 'Cupcake de baunilha', 'Massa de baunilha com cobertura cremosa.',
    'Farinha de trigo, leite, ovos, açúcar, baunilha e manteiga.',
    'Contém trigo, leite e ovos. Contém glúten.', 11.00, 20
FROM categorias WHERE nome = 'Tradicionais';
COMMIT;
