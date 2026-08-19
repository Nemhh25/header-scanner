# Security Headers Scanner

Ferramenta que analisa os cabeçalhos HTTP de segurança de qualquer site público e retorna uma nota (A–F), com explicação individual de cada verificação e recomendações para o que estiver ausente ou mal configurado. Quinto e último projeto da trilha de portfólio — o projeto "diferenciado", centrado em Segurança da Informação em vez de segurança como boa prática acessória.

**🔗 Demo ao vivo:** https://header-scanner-three.vercel.app/
**🔗 API:** https://header-scanner.onrender.com

> A API roda em plano gratuito da Render, que hiberna após inatividade — a primeira análise depois de um tempo parado pode levar cerca de 1 minuto.

## Sobre o projeto

A maioria dos projetos de portfólio "usa boas práticas de segurança"; este projeto tem segurança como o próprio produto. Além de avaliar a segurança de sites de terceiros, o desafio de engenharia central foi proteger a própria ferramenta: uma aplicação cuja função é "buscar qualquer URL que o usuário fornecer" é, por definição, uma superfície clássica de ataque SSRF (Server-Side Request Forgery) se construída sem cuidado.

## Funcionalidades

- Análise de cabeçalhos HTTP de segurança de qualquer URL pública (CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy)
- Nota geral ponderada (A–F) com pontuação numérica, calculada a partir de um conjunto de regras configurável
- Explicação e recomendação individual para cada verificação, inclusive as que passaram
- Detecção e bloqueio de tentativas de escaneamento de endereços internos (SSRF)
- Limite de requisições por IP (rate limiting)
- Interface responsiva, com valores técnicos exibidos em fonte monoespaçada

## Tecnologias utilizadas

**Back-end**

- Node.js + Express + TypeScript, executado via `tsx` (mesmo runtime em desenvolvimento e produção)
- `ipaddr.js` para classificação e validação de endereços IP
- `express-rate-limit`
- `fetch` nativo do Node.js

**Front-end**

- React + TypeScript (Vite)
- CSS3 puro

## Arquitetura

```
header-scanner/
├── server/
│   └── src/
│       ├── lib/
│       │   ├── urlSafety.ts     # Validação e bloqueio de SSRF
│       │   ├── headerRules.ts    # Regras de análise (dado, não lógica)
│       │   └── analyzer.ts        # Aplica as regras e calcula a nota
│       └── routes/
│           └── scan.ts             # Rota principal, protegida por rate limit
└── client/
    └── src/
        └── App.tsx                  # Formulário e exibição do resultado
```

As regras de verificação (`headerRules.ts`) ficam separadas da lógica que as aplica (`analyzer.ts`) — um padrão de "regras como dado" que facilita adicionar ou ajustar critérios sem tocar na lógica de cálculo.

## Decisões de segurança

- **Prevenção de SSRF em duas camadas:** a URL fornecida é resolvida via DNS, e **todos** os endereços IP retornados são classificados com `ipaddr.js`; qualquer endereço fora da faixa `unicast` (pública) — privado, loopback, link-local, o que inclui o endereço clássico de metadados de nuvem (`169.254.169.254`) — é bloqueado antes de qualquer requisição real ser feita.
- **Redirecionamentos não são seguidos automaticamente** (`redirect: "manual"`) — um destino poderia redirecionar para um endereço interno depois da validação inicial já ter passado.
- **Timeout de 5 segundos** na requisição ao alvo, evitando que um servidor lento ou que nunca responde prenda recursos do back-end indefinidamente.
- **Rate limiting** (20 requisições por IP a cada 15 minutos) na rota de análise, para impedir que o serviço seja usado como proxy de escaneamento em massa.
- **Limitação reconhecida, não ignorada:** a validação não protege contra DNS rebinding (troca da resposta de DNS entre a validação e a requisição real) — uma proteção adicional existente em produtos comerciais de scanning, mas considerada complexidade desproporcional ao escopo deste projeto. Risco residual aceito conscientemente, não por desconhecimento.

## Sistema de pontuação

Cada cabeçalho tem um peso proporcional à sua importância. A nota final é a soma dos pesos das verificações aprovadas dividida pelo total possível:

| Cabeçalho                 | Peso |
| ------------------------- | ---- |
| Content-Security-Policy   | 20   |
| Strict-Transport-Security | 15   |
| X-Frame-Options           | 15   |
| X-Content-Type-Options    | 10   |
| Referrer-Policy           | 10   |
| Permissions-Policy        | 10   |

`X-XSS-Protection` é exibido de forma informativa, sem pontuar — é um cabeçalho obsoleto que navegadores modernos ignoram; a orientação atual é desativá-lo explicitamente (valor `0`), não configurá-lo, diferente do que tutoriais desatualizados ensinam.

## Testes realizados

- Validação da pontuação contra dois extremos reais: `github.com` (nota B, headers robustos) e `neverssl.com` (nota F, sem HTTPS nem headers de segurança)
- Confirmação do bloqueio de SSRF tentando escanear `localhost` e endereços de loopback
- Teste de responsividade em 375px, 768px e desktop
- Verificação do fluxo completo em produção

## Como rodar localmente

**Back-end:**

```bash
cd server
npm install
npm run dev
```

**Front-end** (em outro terminal):

```bash
cd client
npm install
npm run dev
```

Nenhuma variável de ambiente é necessária no back-end. O front-end precisa de um `.env` com `VITE_API_URL` apontando para o endereço da API.

## Próximos passos

- Histórico de scans por usuário, reaproveitando a autenticação construída no Projeto 4
- Análise de flags de cookies (`Secure`, `HttpOnly`, `SameSite`) quando presentes na resposta
- Link permanente e compartilhável para um resultado de scan
- Testes automatizados para as regras de análise (Vitest)

## Autor

**Nelson Lisboa**

- GitHub: [@Nemhh25](https://github.com/Nemhh25)
- LinkedIn: [Nelson Lisboa](https://www.linkedin.com/in/nelsonlisboa/)
- Email: nelsondossantos739@gmail.com
