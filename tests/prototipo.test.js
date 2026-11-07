const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function prototype() {
  const elements = new Map();
  const handlers = {};
  const get = key => {
    if (!elements.has(key)) elements.set(key, { innerHTML: '', textContent: '', focus() {}, scrollIntoView() {} });
    return elements.get(key);
  };
  const context = vm.createContext({
    document: { querySelector: get, addEventListener: (type, fn) => { handlers[type] = fn; } },
    location: { hash: '#catalogo' },
    window: { scrollTo() {}, addEventListener() {} },
    FormData: class { constructor(form) { return new Map(Object.entries(form.values)); } }
  });
  vm.runInContext(fs.readFileSync('public/app.js', 'utf8'), context);
  return {
    run: code => vm.runInContext(code, context),
    html: () => get('main').innerHTML,
    submit: (id, values, dataset = {}) => handlers.submit({ preventDefault() {}, target: { id, values, dataset } }),
    click: button => handlers.click({ target: { closest: () => ({ dataset: {}, hasAttribute: () => false, ...button }) } })
  };
}

test('recusa preserva pedido e reserva; aprovação liquida uma única vez', () => {
  const app = prototype();
  app.submit('add-form', { quantity: '2' }, { id: '1' });
  assert.equal(app.run('count()'), 2);
  app.run("location.hash='#pagamento';render()");
  assert.match(app.html(), /Que bom ter você aqui/);
  app.submit('account-form', { email: 'cliente@example.com' });
  app.submit('address-form', { nome: 'Exemplo', cep: '01001000', rua: 'Exemplo', numero: '10', bairro: 'Centro', cidade: 'São Paulo', uf: 'SP', complemento: '' });
  app.run("location.hash='#revisao';render()");
  app.run("location.hash='#pagamento';render()");
  assert.match(app.html(), /Pagamento demonstrativo/);
  const id = app.run('state.order.id');
  assert.equal(app.run('count()'), 0);
  assert.equal(app.run('products[0].reserved'), 2);
  app.click({ dataset: { pay: 'refused' } });
  assert.equal(app.run('state.order.id'), id);
  assert.equal(app.run('state.order.pending'), true);
  assert.equal(app.run('products[0].reserved'), 2);
  app.click({ dataset: { pay: 'approved' } });
  assert.equal(app.run('count()'), 0);
  assert.equal(app.run('state.order.total'), 31);
  app.run("location.hash='#pedidos';render()");
  assert.match(app.html(), /DEMO-001/);
  assert.equal(app.run('products[0].stock'), 18);
  assert.equal(app.run('products[0].reserved'), 0);
  app.click({ dataset: { pay: 'approved' } });
  assert.equal(app.run('products[0].stock'), 18);
  app.click({ hasAttribute: name => name === 'data-advance' });
  assert.equal(app.run('state.status'), 1);
});

test('busca vazia, limite de quantidade e escape de nome editado', () => {
  const app = prototype();
  app.submit('search-form', { busca: 'inexistente' });
  assert.match(app.html(), /Nenhum sabor encontrado/);
  app.submit('add-form', { quantity: '21' }, { id: '1' });
  assert.equal(app.run('count()'), 0);
  app.submit('edit-form', { name: '<img src=x onerror=alert(1)>', price: '12', stock: '20', ingredients: 'Exemplo', allergens: 'Contém leite', active: 'true' }, { id: '1' });
  // Nomes editados devem permanecer texto em todas as telas.
  app.run("state.search='';location.hash='#catalogo';render()");
  assert.ok(!app.html().includes('<img src=x'));
});

function prepareOrder(app) {
  app.submit('add-form', { quantity: '2' }, { id: '1' });
  app.submit('account-form', { email: 'cliente@example.com' });
  app.submit('address-form', { nome:'Exemplo', cep:'01001000', rua:'Rua', numero:'10', bairro:'Centro', cidade:'São Paulo', uf:'SP', complemento:'' });
  app.run("location.hash='#revisao';render();location.hash='#pagamento';render()");
}

test('expiração libera reserva uma vez e impede preparo e aprovação posterior', () => {
  const app=prototype();prepareOrder(app);
  app.click({ dataset: { pay: 'pending' } });
  app.click({ hasAttribute: name => name === 'data-advance' });
  assert.equal(app.run('state.status'),0);
  app.click({ hasAttribute: name => name === 'data-expire' });
  app.click({ hasAttribute: name => name === 'data-expire' });
  app.click({ hasAttribute: name => name === 'data-confirm' });
  assert.equal(app.run('state.order.cancelled'),true);
  assert.equal(app.run('products[0].reserved'),0);
  assert.equal(app.run('products[0].stock'),20);
});

test('produto sem estoque e endereço inválido apresentam erro e impedem avanço', () => {
  const app=prototype();
  app.submit('add-form',{quantity:'1'},{id:'3'});
  assert.equal(app.run('count()'),0);
  app.submit('address-form',{nome:'',cep:'123',rua:'',numero:'',bairro:'',cidade:'',uf:'X'});
  assert.equal(app.run('state.address'),null);
  app.run("location.hash='#produto/3';render()");
  assert.match(app.html(),/disabled/);
});

test('pedido congela preço e endereço mesmo após alterações do catálogo', () => {
  const app=prototype();prepareOrder(app);
  app.run("products[0].price=99;state.address.rua='Outro endereço'");
  assert.equal(app.run('state.order.totalCents'),3100);
  assert.equal(app.run('state.order.items[0].unitCents'),1250);
  assert.equal(app.run('state.order.address.rua'),'Rua');
  app.submit('edit-form',{name:'Teste',price:'12',stock:'1',ingredients:'Exemplo',allergens:'Leite'},{id:'1'});
  assert.equal(app.run('products[0].stock'),20);
});

test('mudança de preço exige nova confirmação e retomar pagamento não cria outro pedido', () => {
  const app=prototype();
  app.submit('add-form',{quantity:'1'},{id:'1'});
  app.submit('account-form',{email:'cliente@example.com'});
  app.submit('address-form',{nome:'Exemplo',cep:'01001000',rua:'Rua',numero:'10',bairro:'Centro',cidade:'São Paulo',uf:'SP'});
  app.run("location.hash='#revisao';render();products[0].price=14;location.hash='#pagamento';render()");
  assert.equal(app.run('state.order'),null);
  assert.equal(app.run('products[0].reserved'),0);
  assert.match(app.html(),/Está tudo do seu jeito/);
  app.run("location.hash='#pagamento';render()");
  const id=app.run('state.order.id');
  app.run('render()');
  assert.equal(app.run('state.order.id'),id);
  assert.equal(app.run('products[0].reserved'),1);
  assert.equal(app.run('state.order.totalCents'),2000);
});
