# Countdown para Notion

Temporizador simples em HTML, CSS e JavaScript, pensado para ser hospedado no GitHub e publicado na Vercel para depois ser incorporado no Notion via embed.

## Funcionalidades

- seleção manual de minutos e segundos
- botões de tempo rápido
- iniciar, pausar e resetar
- alarme sonoro ao chegar em `0:00`
- solicitação de notificação do navegador
- tema claro/escuro
- layout responsivo e clean

## Como usar localmente

Como este projeto é estático, basta abrir o `index.html` no navegador ou servir a pasta com uma extensão como Live Server.

## Como publicar na Vercel

1. Suba estes arquivos para um repositório no GitHub.
2. Na Vercel, clique em **Add New > Project**.
3. Importe o repositório.
4. Como é um projeto estático, a Vercel costuma detectar automaticamente.
5. Deploy.

## Como incorporar no Notion

1. Copie a URL publicada na Vercel.
2. No Notion, digite `/embed`.
3. Cole a URL do projeto.

## Observações importantes

- O Notion não roda esse tipo de JavaScript como bloco nativo interno. Portanto, o funcionamento será por **embed da sua página publicada**.
- Sons automáticos podem depender de interação prévia do usuário com o embed por causa das regras do navegador.
- As notificações dependem de permissão do navegador/sistema.
