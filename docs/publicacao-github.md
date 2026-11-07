# Situação 2 — Versionamento e publicação do projeto

Git é o sistema de versionamento instalado no computador. GitHub é o serviço onde a conta pessoal e o repositório podem ser acessados pelos tutores e professores. Para esta entrega, é necessário publicar o código e fornecer o link real do repositório; preparar arquivos localmente não conclui a publicação.

## 1 Criar ou usar sua conta

Se ainda não tiver conta, acesse https://github.com/signup e conclua pessoalmente o cadastro e a verificação de e-mail. Não envie senhas, códigos de verificação ou tokens pelo chat.

Se já tiver uma conta, utilize-a. Escolha um nome de usuário que possa ser mantido como identidade profissional. Adicione ao perfil uma apresentação breve e as informações que desejar tornar públicas.

## 2 Criar um repositório vazio

No GitHub, abra https://github.com/new e use, como sugestão:

- Nome: `doce-atelie-cupcakes`.
- Descrição: `Projeto Integrador de Engenharia de Software com Node.js, PostgreSQL, UML e protótipo web responsivo.`
- Visibilidade: público, se desejar acesso aberto para avaliação e portfólio; caso escolha privado, conceda acesso aos avaliadores.
- Não inicialize com README, `.gitignore` ou licença: o projeto local já possui os dois primeiros, e a licença deve ser escolhida conscientemente pelo autor.

Copie a URL HTTPS real do repositório criado. A aplicação local não fica disponível na internet somente por enviar o código ao GitHub.

## 3 Identificar a autoria dos commits

No terminal integrado do VS Code, na pasta do projeto, configure a identidade **somente deste repositório**:

```powershell
git config user.name "SEU NOME OU NOME PROFISSIONAL"
git config user.email "SEU EMAIL DE COMMITS"
```

Substitua os textos antes de executar. Para privacidade, é possível usar o endereço `noreply` fornecido em GitHub → Settings → Emails. Copie exatamente o endereço exibido lá; não invente um endereço a partir do nome de usuário.

Essas configurações atribuem os commits; elas não criam conta nem autenticam o GitHub.

## 4 Criar o commit e enviar

O repositório local é iniciado na branch `main` durante a preparação. Confira antes:

```powershell
git status
```

Se estiver em uma cópia do projeto que ainda não é um repositório, execute `git init -b main` uma única vez.

```powershell
git add .
git diff --cached --stat
git commit -m "Adiciona projeto integrador de cupcakes gourmet"
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```

A URL acima é um modelo: substitua pela URL real. Se `origin` já existir, use `git remote -v` para conferir o destino antes de alterar. Não recrie o remoto nem use envio forçado para resolver um erro sem investigar.

O Git poderá abrir o fluxo de autenticação do GitHub. Conclua o login pessoalmente. Senha de conta não deve ser colocada na URL do remoto ou nos arquivos do projeto.

## 5 Conferir a entrega

Abra o repositório no navegador e confirme:

- README explica propósito, tecnologias, instalação e limites da implementação.
- Pastas `src`, `public`, `database`, `docs` e `tests` estão presentes.
- `.env.example` contém somente instruções e valores de exemplo.
- `.env`, `node_modules`, configurações do editor e backups do banco não foram publicados.
- Workflow de verificações terminou com sucesso na aba Actions.
- O avaliador consegue acessar o repositório conforme a visibilidade escolhida.

Entregue o link real do repositório e, quando solicitado, o link do perfil. Não há um endereço de publicação confirmado até concluir o envio.

## 6 Continuar o histórico de evolução

Crie commits pequenos para cada melhoria concluída, com mensagens que descrevam a mudança. Para uma etapa posterior:

```powershell
git switch -c melhoria/nome-da-melhoria
# Implemente e confira a alteração.
npm run check
npm test
git add .
git commit -m "Descreve a melhoria implementada"
git push -u origin melhoria/nome-da-melhoria
```

Abra um pull request para revisar e integrar a melhoria em `main`. Atualize o README para distinguir comportamentos implementados, simulados e planejados.

## Evidência acadêmica sugerida

No relatório da disciplina, informe a URL do repositório, a identificação do autor, as tecnologias utilizadas e uma descrição fiel do estado do projeto. Após publicar, registre também o commit ou a tag entregue para tornar a versão avaliada identificável. Não informe autenticação real, integração de pagamento ou aplicação publicada como concluídas enquanto forem apenas simulações ou pendências.

Referências: [Adicionar código local ao GitHub](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github) e [criação de conta](https://docs.github.com/en/get-started/start-your-journey/creating-an-account-on-github).
