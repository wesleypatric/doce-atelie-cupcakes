-- Execute uma vez em um banco vazio. PostgreSQL 16 ou superior.
BEGIN;

CREATE TABLE usuarios (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome varchar(120) NOT NULL CHECK (length(trim(nome)) > 0),
    email varchar(254) NOT NULL CHECK (email = lower(trim(email)) AND email LIKE '%_@_%._%'),
    senha_hash text NOT NULL,
    telefone varchar(20),
    papel varchar(20) NOT NULL DEFAULT 'cliente' CHECK (papel IN ('cliente', 'funcionario')),
    ativo boolean NOT NULL DEFAULT true,
    criado_em timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX usuarios_email_unico ON usuarios (email);

CREATE TABLE enderecos (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id integer NOT NULL REFERENCES usuarios(id),
    destinatario varchar(120) NOT NULL,
    cep varchar(8) NOT NULL CHECK (cep ~ '^[0-9]{8}$'),
    logradouro varchar(200) NOT NULL,
    numero varchar(20) NOT NULL,
    complemento varchar(120),
    bairro varchar(100) NOT NULL,
    cidade varchar(100) NOT NULL,
    uf varchar(2) NOT NULL CHECK (uf ~ '^[A-Z]{2}$'),
    ativo boolean NOT NULL DEFAULT true,
    criado_em timestamptz NOT NULL DEFAULT now(),
    UNIQUE (id, usuario_id)
);
CREATE INDEX enderecos_usuario_idx ON enderecos(usuario_id);

CREATE TABLE categorias (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome varchar(80) NOT NULL UNIQUE
);

CREATE TABLE produtos (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    categoria_id integer REFERENCES categorias(id),
    nome varchar(120) NOT NULL,
    descricao text NOT NULL,
    ingredientes text NOT NULL,
    alergenicos text NOT NULL,
    imagem_url text,
    preco numeric(12,2) NOT NULL CHECK (preco > 0),
    estoque_fisico integer NOT NULL DEFAULT 0 CHECK (estoque_fisico >= 0),
    estoque_reservado integer NOT NULL DEFAULT 0 CHECK (estoque_reservado >= 0),
    disponivel integer GENERATED ALWAYS AS (estoque_fisico - estoque_reservado) STORED,
    ativo boolean NOT NULL DEFAULT true,
    criado_em timestamptz NOT NULL DEFAULT now(),
    CHECK (estoque_reservado <= estoque_fisico)
);
CREATE INDEX produtos_categoria_idx ON produtos(categoria_id);

CREATE TABLE carrinhos (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id integer NOT NULL UNIQUE REFERENCES usuarios(id),
    atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE itens_carrinho (
    carrinho_id integer NOT NULL REFERENCES carrinhos(id) ON DELETE CASCADE,
    produto_id integer NOT NULL REFERENCES produtos(id),
    quantidade integer NOT NULL CHECK (quantidade > 0),
    PRIMARY KEY (carrinho_id, produto_id)
);
CREATE INDEX itens_carrinho_produto_idx ON itens_carrinho(produto_id);

CREATE TABLE pedidos (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id integer NOT NULL REFERENCES usuarios(id),
    endereco_origem_id integer NOT NULL,
    -- Snapshot: alterações cadastrais não modificam a entrega contratada.
    destinatario varchar(120) NOT NULL,
    cep varchar(8) NOT NULL CHECK (cep ~ '^[0-9]{8}$'),
    logradouro varchar(200) NOT NULL,
    numero varchar(20) NOT NULL,
    complemento varchar(120),
    bairro varchar(100) NOT NULL,
    cidade varchar(100) NOT NULL,
    uf varchar(2) NOT NULL CHECK (uf ~ '^[A-Z]{2}$'),
    status varchar(30) NOT NULL DEFAULT 'aguardando_pagamento'
        CHECK (status IN ('aguardando_pagamento','confirmado','em_preparo','saiu_para_entrega','entregue','cancelado')),
    subtotal numeric(12,2) NOT NULL CHECK (subtotal > 0),
    taxa_entrega numeric(12,2) NOT NULL CHECK (taxa_entrega >= 0),
    total numeric(13,2) GENERATED ALWAYS AS (subtotal + taxa_entrega) STORED,
    chave_idempotencia uuid NOT NULL UNIQUE,
    criado_em timestamptz NOT NULL DEFAULT now(),
    reserva_ate timestamptz NOT NULL,
    versao integer NOT NULL DEFAULT 1 CHECK (versao > 0),
    CHECK (reserva_ate > criado_em),
    FOREIGN KEY (endereco_origem_id, usuario_id) REFERENCES enderecos(id, usuario_id)
);
CREATE INDEX pedidos_usuario_data_idx ON pedidos(usuario_id, criado_em DESC);
CREATE INDEX pedidos_operacao_idx ON pedidos(status, criado_em);
CREATE INDEX pedidos_expiracao_idx ON pedidos(reserva_ate) WHERE status = 'aguardando_pagamento';

CREATE TABLE itens_pedido (
    pedido_id integer NOT NULL REFERENCES pedidos(id),
    produto_id integer NOT NULL REFERENCES produtos(id),
    nome_produto varchar(120) NOT NULL,
    preco_unitario numeric(12,2) NOT NULL CHECK (preco_unitario > 0),
    quantidade integer NOT NULL CHECK (quantidade > 0),
    subtotal numeric(14,2) GENERATED ALWAYS AS (preco_unitario * quantidade) STORED,
    PRIMARY KEY (pedido_id, produto_id)
);
CREATE INDEX itens_pedido_produto_idx ON itens_pedido(produto_id);

CREATE TABLE pagamentos (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pedido_id integer NOT NULL REFERENCES pedidos(id),
    provedor varchar(60) NOT NULL,
    referencia_externa varchar(200),
    chave_idempotencia uuid NOT NULL UNIQUE,
    valor numeric(13,2) NOT NULL CHECK (valor > 0),
    status varchar(30) NOT NULL DEFAULT 'pendente'
        CHECK (status IN ('pendente','em_conciliacao','aprovado','recusado','estornado')),
    estorno_pendente boolean NOT NULL DEFAULT false,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    UNIQUE (provedor, referencia_externa)
);
CREATE INDEX pagamentos_pedido_idx ON pagamentos(pedido_id);
-- Impede duas tentativas simultaneamente liquidadas para um mesmo pedido.
CREATE UNIQUE INDEX pagamentos_liquidacao_unica ON pagamentos(pedido_id)
    WHERE status IN ('aprovado', 'estornado');

CREATE TABLE eventos_pagamento (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pagamento_id integer NOT NULL REFERENCES pagamentos(id),
    evento_externo_id varchar(200) NOT NULL,
    -- Identificador externo é único dentro da tentativa; sem dados de cartão.
    tipo varchar(80) NOT NULL,
    recebido_em timestamptz NOT NULL DEFAULT now(),
    processado_em timestamptz,
    UNIQUE (pagamento_id, evento_externo_id)
);

CREATE TABLE historico_pedidos (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pedido_id integer NOT NULL REFERENCES pedidos(id),
    status varchar(30) NOT NULL
        CHECK (status IN ('aguardando_pagamento','confirmado','em_preparo','saiu_para_entrega','entregue','cancelado')),
    responsavel_id integer REFERENCES usuarios(id),
    origem varchar(20) NOT NULL CHECK (origem IN ('sistema','funcionario')),
    criado_em timestamptz NOT NULL DEFAULT now(),
    CHECK ((origem = 'sistema' AND responsavel_id IS NULL)
        OR (origem = 'funcionario' AND responsavel_id IS NOT NULL))
);
CREATE INDEX historico_pedido_idx ON historico_pedidos(pedido_id, criado_em, id);
CREATE INDEX historico_responsavel_idx ON historico_pedidos(responsavel_id);

COMMIT;
