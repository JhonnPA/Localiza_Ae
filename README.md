# Localiza-ae

Sistema de aluguel de carros feito para a disciplina de Manutenção de Software. Os
funcionários cadastram clientes, fazem reservas por categoria de carro e acompanham tudo
num calendário. O gerente, além disso, vê os relatórios de faturamento e cuida dos acessos dos
funcionários: cadastra, desativa e redefine senha.

O site é em React com Vite e a API em Express com PostgreSQL. Os dois ficam no mesmo
projeto e usam o mesmo `package.json`.

## Rodando o projeto

Você vai precisar do Node.js 20 ou mais novo e do Docker Desktop aberto.

```bash
cp .env.example .env     # troque PGPASSWORD e JWT_SECRET por valores aleatórios
npm install
docker compose up -d     # cria o banco com as tabelas e as categorias
npm run create-manager -- gerente@empresa.com "Nome do Gerente"   # a senha é pedida depois
npm run dev              # API na porta 3001 e site em http://localhost:5173
```

O banco começa sem nenhum usuário. O primeiro gerente sai do `create-manager` acima e,
depois disso, os funcionários são cadastrados por ele na tela "Funcionários". A senha que o
gerente define é provisória, e o funcionário é obrigado a trocar no primeiro login.

Se precisar zerar o banco (isso apaga todos os dados):

```bash
docker compose down -v && docker compose up -d
```

Se o seu banco foi criado antes da tela de funcionários, rode as migrações uma vez, em
ordem (não apagam nada):

```bash
docker exec -i localiza-ae-db psql -U localiza -d localiza_ae < server/scripts/migrations/001-user-access.sql
docker exec -i localiza-ae-db psql -U localiza -d localiza_ae < server/scripts/migrations/002-token-version.sql
```

## Comandos

| Comando                  | O que faz                                         |
| ------------------------ | ------------------------------------------------- |
| `npm run dev`            | Sobe a API e o site juntos                        |
| `npm run create-manager` | Cria um gerente                                   |
| `npm run demo-data`      | Carrega clientes e reservas de exemplo            |
| `npm run build`          | Confere os tipos e gera a versão final em `dist/` |
| `npm run lint`           | Roda o ESLint                                     |
| `npm run format`         | Formata o código com o Prettier                   |
| `npm run format:check`   | Só confere se está tudo formatado                 |

## Segurança

As senhas ficam salvas como hash bcrypt e precisam ter pelo menos 8 caracteres. No login,
cada conta aguenta 10 tentativas erradas a cada 15 minutos vindas do mesmo IP, e cada IP
aguenta 50 no total. A troca de senha tem trava parecida, de 5 tentativas a cada 15
minutos.

A API não sobe se o `JWT_SECRET` for o do `.env.example` ou tiver menos de 32 caracteres.
O banco só aceita conexão da própria máquina (`127.0.0.1`), e o faturamento é calculado na
API, numa rota que só o gerente acessa.

Quando o gerente desativa um funcionário, ele perde o acesso na hora, porque a API confere
no banco, a cada requisição, se o usuário continua ativo. Trocar a senha também derruba as
sessões abertas em outros aparelhos. Se o gerente redefinir uma senha, a API gera uma
provisória que aparece uma vez só. Pela tela ele só mexe em funcionários, e gerente novo
sai do `create-manager`.

## Como as pastas estão organizadas

```
shared/domain.js      termos do negócio usados pelo site e pela API (status, perfis, locais)
public/categories/    fotos das categorias de carro
server/
  index.js            monta a API (rotas e tratamento de erros)
  config.js           lê o .env
  db.js               conexão com o PostgreSQL
  session.js          gera o token de login
  database/           SQL das tabelas e dados iniciais (o Docker roda na criação do banco)
  middlewares/        login, limite de tentativas e tratamento de erros
  routes/             recebe a requisição, valida e responde
  repositories/       consultas SQL
  scripts/            create-manager, dados de exemplo e migrações
src/
  api/                chamadas à API e token da sessão
  domain/             tipos e regras de negócio (custo da reserva, estoque)
  store/              estado global (Zustand)
  hooks/              lógica reaproveitada entre telas
  components/         componentes reaproveitados
  pages/              telas
```

As fotos dos carros são do [Unsplash](https://unsplash.com/license), que permite o uso
gratuito.
