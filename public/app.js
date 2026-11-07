const products = [
  { id: 1, name: 'Chocolate intenso', desc: 'Massa macia de cacau e brigadeiro cremoso.', price: 12.5, category: 'Clássicos', color: '#68402d', frosting: '#70422e', tag: 'O queridinho', ingredients: 'Farinha de trigo, leite, ovos, açúcar, cacau e manteiga.' },
  { id: 2, name: 'Baunilha delicada', desc: 'Baunilha perfumada e um toque de doçura.', price: 11, category: 'Clássicos', color: '#c29154', frosting: '#f5e4bb', tag: 'Feito com carinho', ingredients: 'Farinha de trigo, leite, ovos, açúcar, baunilha e manteiga.' },
  { id: 3, name: 'Morango dos sonhos', desc: 'Cobertura de morango sobre massa de baunilha.', price: 14, category: 'Especiais', color: '#b47c50', frosting: '#d78f9c', tag: 'Especial da casa', ingredients: 'Farinha de trigo, leite, ovos, açúcar, manteiga e morango.' }
];
const state = { cart: {}, logged: false, category: 'Todos', search: '', address: null, order: null, status: 0 };
products.forEach((p, i) => { p.stock = i === 2 ? 0 : 20; p.reserved = 0; p.active = true; p.allergens = 'Contém trigo, leite e ovos. Contém glúten.'; });
let orderSequence = 0;
const available = p => p.active ? p.stock - p.reserved : 0;
const cents = p => Math.round(p.price * 100);
const cartCents = () => products.reduce((sum, p) => sum + cents(p) * (state.cart[p.id] || 0), 0);
const signature = () => JSON.stringify(products.filter(p => state.cart[p.id]).map(p => [p.id, state.cart[p.id], cents(p), p.active]));
const main = document.querySelector('main');
const money = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const count = () => Object.values(state.cart).reduce((a,b) => a+b,0);
const subtotal = () => cartCents() / 100;
function cupcake(p, decorative = true) { return `<svg viewBox="0 0 400 310" ${decorative ? 'aria-hidden="true"' : 'role="img" aria-label="Ilustração de cupcake"'}><ellipse cx="200" cy="272" rx="105" ry="14" fill="#69462d" opacity=".12"/><path d="M116 171h168l-24 91H140z" fill="${p.color}"/><path d="M128 177l16 79m13-79l8 79m20-79l2 79m27-79l-4 79m31-79l-12 79m31-79l-18 79" stroke="#fff" stroke-width="4" opacity=".25"/><path d="M108 170c-8-23 13-39 35-42-8-23 9-42 34-43-8-19 4-41 26-55 0 21 9 28 29 38 17 8 21 21 14 34 29 0 43 19 37 36 19 5 25 18 19 32-22 25-164 25-194 0z" fill="${p.frosting}"/><path d="M146 128c37 16 94 16 132 6M175 86c16 9 45 17 69 16M118 167c43 15 120 19 170-1" stroke="#fff" opacity=".27" fill="none" stroke-width="5" stroke-linecap="round"/><g fill="#fff2d7"><rect x="159" y="116" width="10" height="3" transform="rotate(25 159 116)"/><rect x="231" y="141" width="10" height="3" transform="rotate(-22 231 141)"/><rect x="197" y="67" width="9" height="3"/></g></svg>`; }
const steps = active => `<ol class="steps">${['Sacola','Entrega','Revisão','Pagamento'].map((v,i)=>`<li class="${i===active?'current':''}" ${i===active?'aria-current="step"':''}>${i+1}. ${v}</li>`).join('')}</ol>`;
function notice(text) { document.querySelector('#aviso').textContent=text; }
function summary(button = '') { return `<aside class="panel"><h2>Seu resumo</h2>${products.filter(p=>state.cart[p.id]).map(p=>`<div class="summary-line"><span>${state.cart[p.id]} × ${escapeHTML(p.name)}</span><span>${money(cents(p)*state.cart[p.id]/100)}</span></div>`).join('')}<div class="summary-line"><span>Subtotal</span><span>${money(subtotal())}</span></div><div class="summary-line"><span>Entrega ilustrativa</span><span>${money(6)}</span></div><div class="summary-line total"><span>Total</span><span>${money(subtotal()+6)}</span></div>${button}<p class="muted">Valores fictícios para testar o fluxo.</p></aside>`; }
function catalog() { const shown=products.filter(p=>p.active&&(state.category==='Todos'||p.category===state.category)&&p.name.toLowerCase().includes(state.search.toLowerCase()));return `<section class="hero"><div class="hero-copy"><span class="eyebrow">Um carinho em forma de cupcake</span><h1>Seu dia merece<br>um doce momento.</h1><p class="muted">Receitas artesanais, coberturas generosas e aquele cuidado que faz toda a diferença.</p><a class="btn" href="#cardapio">Escolha seu favorito <span aria-hidden="true">↗</span></a></div><div class="hero-art">${cupcake(products[2])}<span class="hero-seal">ARTESANAL<br>feito com<br>carinho</span></div></section><div class="benefits"><span>✳ Produção artesanal</span><span>✳ Ingredientes selecionados</span><span>✳ Entrega com cuidado</span></div><section id="cardapio"><div class="section-head"><div><span class="eyebrow">Escolha um pouco de felicidade</span><h2>Nossos cupcakes</h2></div><form class="search" id="search-form"><label class="muted" for="busca">Buscar</label><input id="busca" name="busca" placeholder="Seu sabor favorito" value="${escapeHTML(state.search)}"><button class="secondary">Buscar</button></form></div><div class="chips" aria-label="Filtrar por categoria">${['Todos','Clássicos','Especiais'].map(c=>`<button class="chip" data-category="${c}" aria-pressed="${state.category===c}">${c}</button>`).join('')}</div><div class="grid">${shown.map(p=>`<article class="card"><a class="product-art" href="#produto/${p.id}" aria-label="Ver ${escapeHTML(p.name)}"><span class="tag">${available(p)>0?p.tag:'Indisponível'}</span>${cupcake(p)}</a><div class="card-content"><h3>${escapeHTML(p.name)}</h3><p>${p.desc}</p><div class="card-bottom"><span class="price">${money(p.price)}</span><a href="#produto/${p.id}">Conhecer sabor ↗</a></div></div></article>`).join('')}</div>${!shown.length?'<p role="status">Nenhum sabor encontrado. Tente outro nome ou categoria.</p>':''}</section>`; }
function detail(id) {
  const p = products.find(p => p.id === Number(id) && p.active);
  if (!p) return '<h1>Sabor não encontrado</h1><a href="#catalogo">Voltar ao catálogo</a>';
  return `<div class="crumb"><a href="#catalogo">Cardápio</a> / ${escapeHTML(p.name)}</div><div class="two-col"><div class="detail-art">${cupcake(p)}</div><section><span class="eyebrow">${p.category} · Unidade</span><h1 class="screen-title">${escapeHTML(p.name)}</h1><p class="muted">${p.desc}</p><h2>${money(p.price)}</h2><p class="order-status">${available(p)>0?available(p)+' unidades disponíveis na simulação':'Indisponível no momento'}</p><h3>Ingredientes</h3><p>${escapeHTML(p.ingredients)}</p><p class="note"><strong>Alergênicos:</strong> ${escapeHTML(p.allergens)} Informações ilustrativas; confirmar com a loja.</p><form id="add-form" data-id="${p.id}" novalidate><div class="field"><label for="quantity">Quantidade</label><input id="quantity" name="quantity" type="number" min="1" max="${Math.min(20,available(p))}" value="1" required aria-describedby="form-errors"></div><p id="form-errors" class="error" role="alert" tabindex="-1"></p><button class="primary full" ${available(p)<=0?'disabled':''}>Adicionar à sacola</button></form></section></div>`;
}
function account(register=false){return `<section class="narrow panel"><span class="eyebrow">Um lugar para seus favoritos</span><h1 class="screen-title">${register?'Crie sua conta':'Que bom ter você aqui'}</h1><p class="muted">Acesso demonstrativo. Não use dados ou senhas reais.</p><form id="account-form" novalidate>${register?'<div class="field"><label for="nome">Nome fictício</label><input id="nome" name="nome" value="Cliente exemplo" required autocomplete="off" aria-describedby="form-errors"></div>':''}<div class="field"><label for="email">E-mail de demonstração</label><input id="email" name="email" type="email" aria-describedby="form-errors" value="cliente@example.com" required autocomplete="off"></div><div class="note">O protótipo não solicita senha nem cria uma conta real.</div><p id="form-errors" class="error" role="alert" tabindex="-1"></p><button class="primary full">${register?'Simular cadastro':'Entrar na demonstração'}</button></form><p>${register?'<a href="#acesso">Já tenho conta</a>':'Primeira visita? <a href="#cadastro">Criar uma conta</a>'}</p></section>`;}
function cart(){if(!count())return `<div class="empty"><span class="eyebrow">Sua sacola</span><h1>Ainda cabe um doce aqui.</h1><p class="muted">Escolha seus cupcakes favoritos para começar.</p><a class="btn" href="#catalogo">Explorar o cardápio</a></div>`;return `${steps(0)}<h1 class="screen-title">Sua sacola</h1><div class="two-col"><section>${products.filter(p=>state.cart[p.id]).map(p=>`<article class="cart-row">${cupcake(p)}<div class="grow"><h3>${escapeHTML(p.name)}</h3><span>${money(p.price)} / unidade</span><br><button class="text-btn" data-remove="${p.id}">Remover ${escapeHTML(p.name)}</button></div><div class="qty"><button data-qty="${p.id}" data-delta="-1" aria-label="Diminuir quantidade de ${escapeHTML(p.name)}">−</button><span aria-label="Quantidade">${state.cart[p.id]}</span><button data-qty="${p.id}" data-delta="1" aria-label="Aumentar quantidade de ${escapeHTML(p.name)}">+</button></div></article>`).join('')}<p><a href="#catalogo">Continuar escolhendo</a></p></section>${summary(`<a class="btn full" href="#${state.logged?'entrega':'acesso'}">Continuar para entrega</a>`)}</div>`;}
function delivery(){if(!count())return cart();if(!state.logged)return account();const a=state.address||{};return `${steps(1)}<h1 class="screen-title">Onde entregamos seu doce?</h1><div class="two-col"><form class="panel" id="address-form" novalidate><p class="muted">Preencha um endereço fictício para testar a entrega.</p><div class="form-grid">${[['nome','Destinatário','Cliente exemplo'],['cep','CEP','01001000'],['rua','Rua','Praça de exemplo'],['numero','Número','100'],['complemento','Complemento opcional',''],['bairro','Bairro','Centro'],['cidade','Cidade','São Paulo'],['uf','UF','SP']].map(([name,label,value])=>`<div><label for="${name}">${label}</label><input id="${name}" name="${name}" value="${escapeHTML(a[name]??value)}" ${name==='complemento'?'':'required'} ${name==='cep'?'pattern="[0-9]{8}" inputmode="numeric" maxlength="8" aria-describedby="cep-help"':name==='uf'?'pattern="[A-Za-z]{2}" maxlength="2"':''}></div>`).join('')}</div><p id="cep-help" class="muted">CEP: 8 números, sem traço. O CEP 00000000 simula endereço fora da área. Cobertura e prazo reais serão definidos com a loja.</p><p id="form-errors" class="error" role="alert" tabindex="-1"></p><button class="primary">Revisar pedido</button></form>${summary()}</div>`;}
function review(){if(!count())return cart();if(!state.logged)return account();if(!state.address)return delivery();const a=state.address;state.reviewed=signature();return `${steps(2)}<h1 class="screen-title">Está tudo do seu jeito?</h1><div class="two-col"><section class="panel"><h2>Entrega</h2><p>${escapeHTML(a.nome)}<br>${escapeHTML(a.rua)}, ${escapeHTML(a.numero)} ${escapeHTML(a.complemento)}<br>${escapeHTML(a.bairro)} · ${escapeHTML(a.cidade)} / ${escapeHTML(a.uf)}<br>CEP ${escapeHTML(a.cep)}</p><a href="#entrega">Alterar endereço</a><h3>Antes de continuar</h3><p>Confira os sabores, quantidades e as informações de alergênicos. A taxa de R$ 6,00 é apenas demonstrativa.</p><p class="note">O próximo passo simula um pagamento, sem solicitar dados bancários.</p></section>${summary('<a class="btn full" href="#pagamento">Continuar para pagamento</a>')}</div>`;}
function createDemoOrder() {
  if (state.order && !state.order.cancelled && state.order.pending && !count()) return true;
  if (!count() || !state.logged || !state.address) return false;
  const invalid = products.find(p => state.cart[p.id] && state.cart[p.id] > available(p));
  if (invalid) { notice('Disponibilidade alterada: revise a quantidade de '+invalid.name+'.'); return false; }
  if (state.reviewed !== signature()) { notice('O preço ou os itens mudaram. Revise o pedido antes de confirmar.'); return false; }
  const items = products.filter(p=>state.cart[p.id]).map(p=>({...p,qty:state.cart[p.id],unitCents:cents(p)}));
  state.order = { id: 'DEMO-'+String(++orderSequence).padStart(3,'0'), items, totalCents: cartCents()+600, total:(cartCents()+600)/100, address:{...state.address}, pending:true, cancelled:false, payment:'não iniciado', history:['Pedido criado — aguardando pagamento'] };
  items.forEach(item => { products.find(p=>p.id===item.id).reserved += item.qty; });
  state.cart = {};
  state.status = 0;
  return true;
}
function payment() {
  if (!createDemoOrder()) {
    if (!count()) return cart();
    if (!state.logged) return account();
    if (!state.address) return delivery();
    location.hash='revisao';
    return review();
  }
  const o = state.order;
  return `${steps(3)}<h1 class="screen-title">Um último passo</h1><div class="two-col"><section class="panel"><h2>Pagamento demonstrativo</h2><p>Pedido ${o.id} criado. Os itens já estão reservados nesta simulação.</p><p class="note">Não informe cartão, Pix ou senha. Na versão final, a aprovação será recebida do provedor, independentemente da tela aberta.</p><button class="primary full" data-pay="approved">Simular pagamento aprovado</button><p><button class="secondary full" data-pay="refused">Simular pagamento recusado</button></p><button class="text-btn" data-pay="pending">Simular pagamento pendente</button><p id="payment-feedback" role="status"></p><a href="#pedidos">Acompanhar este pedido</a></section><aside class="panel"><h2>Resumo congelado</h2>${orderItems(o)}<div class="summary-line total"><span>Total com entrega</span><span>${money(o.totalCents/100)}</span></div></aside></div>`;
}
function orderItems(o) { return o.items.map(p=>`<div class="summary-line"><span>${p.qty} × ${escapeHTML(p.name)}</span><span>${money(p.qty*p.unitCents/100)}</span></div>`).join(''); }
function approveOrder() {
  const o=state.order;
  if (!o || o.cancelled || !o.pending) return;
  o.items.forEach(item=>{const p=products.find(p=>p.id===item.id); p.reserved-=item.qty; p.stock-=item.qty;});
  o.pending=false; o.payment='aprovado'; o.history.push('Pagamento aprovado — pedido confirmado');
}
function expireOrder() {
  const o=state.order;
  if (!o || o.cancelled || !o.pending) return;
  o.items.forEach(item=>{products.find(p=>p.id===item.id).reserved-=item.qty;});
  o.cancelled=true; o.pending=false; o.history.push('Reserva expirada — pedido cancelado');
}

const statuses=['Confirmado','Em preparo','Saiu para entrega','Entregue'];
function orders() {
  if (!state.order) return '<div class="empty"><h1>Seu primeiro pedido começa aqui.</h1><p>Nenhum pedido nesta demonstração.</p><a class="btn" href="#catalogo">Escolher cupcakes</a></div>';
  const o=state.order;
  const status=o.cancelled?'Cancelado por expiração':o.pending?'Aguardando pagamento':statuses[state.status];
  return `<span class="eyebrow">Meus pedidos / ${o.id}</span><h1 class="screen-title">Acompanhe cada etapa.</h1><div class="two-col"><section class="panel"><span class="order-status">${status}</span><h2>Pedido ${o.id}</h2><p>Pagamento: ${o.payment}.</p>${o.pending?'<p>A confirmação depende do provedor. A reserva tem vencimento configurável na versão final.</p><a class="btn" href="#pagamento">Tentar ou consultar pagamento</a><p><button class="secondary" data-confirm>Simular aprovação posterior</button></p><button class="text-btn" data-expire>Simular expiração da reserva</button>':o.cancelled?'<p>A reserva foi liberada. Escolha novamente os produtos para fazer outra compra.</p>':`<ol class="timeline">${statuses.map((s,i)=>`<li class="${i<=state.status?'done':''}"><strong>${s}</strong><br><span class="muted">${i<=state.status?'Etapa registrada na demonstração':'Próxima etapa'}</span></li>`).join('')}</ol>`}<h3>Histórico</h3><ul>${o.history.map(s=>'<li>'+escapeHTML(s)+'</li>').join('')}</ul></section><aside class="panel"><h2>Resumo da compra</h2>${orderItems(o)}<div class="summary-line"><span>Entrega</span><span>${money(6)}</span></div><div class="summary-line total"><span>Total</span><span>${money(o.totalCents/100)}</span></div><p><strong>Endereço da compra</strong><br>${escapeHTML(o.address.rua)}, ${escapeHTML(o.address.numero)}<br>${escapeHTML(o.address.cidade)} / ${escapeHTML(o.address.uf)}</p><a href="#catalogo">Escolher mais doces</a><p class="muted">O protótipo mostra apenas o pedido mais recente; a versão final terá uma lista persistida.</p></aside></div>`;
}
function operation(){return `<span class="eyebrow">Área da loja · Demonstração</span><h1 class="screen-title">Cada pedido, um cuidado.</h1><p class="note">Esta visualização demonstra o papel do funcionário. Na aplicação final, exigirá autenticação e autorização.</p><div class="chips"><a class="btn" href="#operacao">Pedidos</a><a class="secondary" href="#produtos-loja">Catálogo</a></div>${state.order?`<article class="panel"><h2>Pedido ${state.order.id}</h2><p><span class="order-status">${state.order.cancelled?'Cancelado':state.order.pending?'Aguardando pagamento':statuses[state.status]}</span> · ${money(state.order.totalCents/100)}</p><p>${state.order.items.map(p=>`${p.qty} × ${escapeHTML(p.name)}`).join(' · ')}</p><button class="primary" data-advance ${state.order.pending||state.order.cancelled||state.status===3?'disabled':''}>${state.order.cancelled?'Pedido cancelado':state.status===3?'Pedido entregue':state.order.pending?'Aguardando aprovação':'Avançar para '+statuses[state.status+1]}</button><p><a href="#pedidos">Ver acompanhamento do cliente</a></p></article>`:'<div class="panel"><h2>Nenhum pedido para preparar</h2><p>Conclua uma compra demonstrativa para testar o andamento.</p><a href="#catalogo">Abrir cardápio</a></div>'}`;}
function manage(){return `<span class="eyebrow">Área da loja · Demonstração</span><h1 class="screen-title">Catálogo da casa</h1><p><a href="#operacao">Voltar aos pedidos</a></p><div class="panel"><div class="table-wrap"><table><caption>Produtos fictícios para avaliação da administração</caption><thead><tr><th>Produto</th><th>Preço</th><th>Categoria</th><th>Ação</th></tr></thead><tbody>${products.map(p=>`<tr><td>${escapeHTML(p.name)}</td><td>${money(p.price)}</td><td>${p.category}</td><td><a href="#editar/${p.id}">Editar</a></td></tr>`).join('')}</tbody></table></div></div>`;}
function edit(id) {
  const p=products.find(p=>p.id===Number(id));
  if (!p) return manage();
  return `<div class="narrow panel"><h1 class="screen-title">Editar produto</h1><form id="edit-form" data-id="${p.id}" novalidate>${[['name','Nome',p.name],['price','Preço em reais',p.price],['stock','Estoque físico',p.stock],['ingredients','Ingredientes',p.ingredients],['allergens','Alergênicos',p.allergens]].map(([name,label,value])=>`<div class="field"><label for="product-${name}">${label}</label><input id="product-${name}" name="${name}" value="${escapeHTML(value)}" ${['price','stock'].includes(name)?'type="number"':''} ${name==='price'?'min="0.01" max="999" step="0.01"':name==='stock'?'min="0" max="10000" step="1"':'maxlength="500"'} required aria-describedby="form-errors"></div>`).join('')}<div class="field"><label for="product-active">Disponibilidade para novas vendas</label><select id="product-active" name="active"><option value="true" ${p.active?'selected':''}>Ativo</option><option value="false" ${!p.active?'selected':''}>Inativo</option></select></div><p>Estoque reservado na simulação: ${p.reserved}. Estoque disponível: ${available(p)}.</p><p id="form-errors" class="error" role="alert" tabindex="-1"></p><p class="note">Alterações nesta demonstração. Não modificam preço e endereço de pedidos já criados.</p><button class="primary">Salvar demonstração</button> <a href="#produtos-loja">Cancelar</a></form></div>`;
}
function render(){const [route,id]=(location.hash.slice(1)||'catalogo').split('/');let html;switch(route){case 'catalogo':case 'cardapio':html=catalog();break;case 'produto':html=detail(id);break;case 'acesso':html=account();break;case 'cadastro':html=account(true);break;case 'carrinho':html=cart();break;case 'entrega':html=delivery();break;case 'revisao':html=review();break;case 'pagamento':html=payment();break;case 'pedidos':html=orders();break;case 'operacao':html=operation();break;case 'produtos-loja':html=manage();break;case 'editar':html=edit(id);break;default:html='<h1>Página não encontrada</h1><a href="#catalogo">Voltar ao cardápio</a>';}
main.innerHTML=html;document.querySelector('#count').textContent=count();main.focus({preventScroll:true});if(route==='cardapio')document.querySelector('#cardapio')?.scrollIntoView();else window.scrollTo(0,0);}

function formErrors(form, messages) {
  const container = document.querySelector('#form-errors');
  container.textContent=messages.join(' ');
  container.focus?.();
}
document.addEventListener('submit', e => {
  const f=e.target;
  if (!['search-form','add-form','account-form','address-form','edit-form'].includes(f.id)) return;
  e.preventDefault();
  const data=new FormData(f);
  if (f.id==='search-form') { state.search=String(data.get('busca')||'').trim(); render(); }
  if (f.id==='add-form') {
    const p=products.find(p=>p.id===Number(f.dataset.id));
    const q=Number(data.get('quantity'));
    if (!p || !Number.isInteger(q) || q<1 || q>20 || q+(state.cart[p.id]||0)>Math.min(20,available(p))) { formErrors(f,['Quantidade indisponível. Informe um número inteiro positivo dentro do estoque, com limite de 20 unidades por sabor.']); return; }
    state.cart[p.id]=(state.cart[p.id]||0)+q;
    document.querySelector('#count').textContent=count(); notice('Cupcake adicionado à sacola.');
  }
  if (f.id==='account-form') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.get('email')||''))) { formErrors(f,['Informe um e-mail válido para a demonstração.']); return; }
    state.logged=true; location.hash=count()?'entrega':'catalogo'; notice('Acesso demonstrativo concluído.');
  }
  if (f.id==='address-form') {
    const address=Object.fromEntries([...data].map(([k,v])=>[k,String(v).trim()]));
    const errors=[];
    if (['nome','rua','numero','bairro','cidade'].some(k=>!address[k])) errors.push('Preencha destinatário, rua, número, bairro e cidade.');
    if (!/^[0-9]{8}$/.test(address.cep||'')) errors.push('Informe o CEP com oito números, sem traço.');
    if (!/^[A-Za-z]{2}$/.test(address.uf||'')) errors.push('Informe a UF com duas letras.');
    if (address.cep==='00000000') errors.push('CEP fora da área na simulação. Use o endereço fictício sugerido.');
    if (errors.length) { formErrors(f,errors); return; }
    address.uf=address.uf.toUpperCase(); state.address=address; location.hash='revisao';
  }
  if (f.id==='edit-form') {
    const p=products.find(p=>p.id===Number(f.dataset.id));
    const name=String(data.get('name')||'').trim(), price=Number(data.get('price')), stock=Number(data.get('stock'));
    const ingredients=String(data.get('ingredients')||'').trim(), allergens=String(data.get('allergens')||'').trim();
    const errors=[];
    if (!p || !name || name.length>120) errors.push('Informe um nome com até 120 caracteres.');
    if (!Number.isFinite(price) || price<=0 || price>999 || Math.abs(price*100-Math.round(price*100))>0.000001) errors.push('Preço deve ser positivo, ter até duas casas e não ultrapassar R$ 999,00 no protótipo.');
    if (!Number.isInteger(stock) || stock<0 || stock>10000 || (p && stock<p.reserved)) errors.push('Estoque deve ser inteiro, entre zero e 10000 e não pode ser menor que a reserva.');
    if (!ingredients || !allergens) errors.push('Preencha ingredientes e alergênicos.');
    if (errors.length) { formErrors(f,errors); return; }
    Object.assign(p,{name,price,stock,ingredients,allergens,active:data.get('active')!=='false'});
    location.hash='produtos-loja'; notice('Produto alterado apenas no protótipo.');
  }
});
document.addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b)return;
  if(b.dataset.category){state.category=b.dataset.category;render();}
  if(b.dataset.remove){delete state.cart[b.dataset.remove];render();notice('Produto removido da sacola.');}
  if(b.dataset.qty){const id=b.dataset.qty,p=products.find(p=>p.id===Number(id));state.cart[id]=Math.max(0,Math.min(20,available(p),state.cart[id]+Number(b.dataset.delta)));if(!state.cart[id])delete state.cart[id];render();}
  if(b.dataset.pay){
    const o=state.order;if(!o||!o.pending||o.cancelled)return;
    if(b.dataset.pay==='refused'){o.payment='recusado';o.history.push('Tentativa recusada — pedido aguarda pagamento');document.querySelector('#payment-feedback').textContent='Pagamento recusado na simulação. O mesmo pedido foi mantido. Tente novamente enquanto a reserva estiver válida.';return;}
    if(b.dataset.pay==='approved')approveOrder();else{o.payment='pendente';o.history.push('Pagamento em processamento');}
    location.hash='pedidos';notice('Situação atualizada na simulação. Nenhuma cobrança realizada.');
  }
  if(b.hasAttribute('data-confirm')){approveOrder();render();}
  if(b.hasAttribute('data-expire')){expireOrder();render();notice('Reserva liberada. Pedido cancelado na simulação.');}
  if(b.hasAttribute('data-advance')&&state.order&&!state.order.pending&&!state.order.cancelled&&state.status<3){state.status++;state.order.history.push(statuses[state.status]);render();notice('Andamento atualizado na demonstração.');}
});
window.addEventListener('hashchange',()=>{render();});render();
