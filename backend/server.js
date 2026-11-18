
const http = require('http');
const fs = require('fs');
const path = require('path');

const {
  listarRestaurantes,
  buscarRestaurante
} = require('./data/restaurantes');

const PORT = process.env.PORT || 3000;

function escaparHTML(valor) {
  return String(valor).replace(/[&<>"']/g, caractere => {
    const entidades = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    return entidades[caractere];
  });
}

function gerarCardapio(restaurante) {
  const produtos = restaurante.produtos.filter(
    produto => produto.ativo
  );

  const dadosProdutos = JSON.stringify(produtos)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

  const itens = produtos.map((produto, indice) => {
    const imagem = /^https?:\/\//i.test(produto.imagem)
      ? escaparHTML(produto.imagem)
      : '';

    return `
      <article class="produto">
        <img src="${imagem}" alt="${escaparHTML(produto.nome)}">
        <div class="info">
          <h3>${escaparHTML(produto.nome)}</h3>
          <p>${escaparHTML(produto.descricao)}</p>
          <strong>${Number(produto.preco).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })}</strong>
          <br>
          <button data-indice="${indice}">Adicionar</button>
        </div>
      </article>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#111827">
  <title>${escaparHTML(restaurante.nome)} | Cardápio</title>

  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: Arial, sans-serif;
      background: #f8fafc;
      color: #1e293b;
      padding-bottom: 100px;
    }

    header {
      background: #111827;
      color: white;
      padding: 28px 16px;
      text-align: center;
    }

    header h1 {
      color: #f59e0b;
      margin-bottom: 8px;
    }

    main {
      max-width: 850px;
      margin: auto;
      padding: 25px 16px;
    }

    h2 {
      margin-bottom: 20px;
    }

    .produto {
      display: flex;
      gap: 15px;
      align-items: center;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 15px;
      margin-bottom: 14px;
    }

    .produto img {
      width: 105px;
      height: 100px;
      object-fit: cover;
      border-radius: 9px;
    }

    .info {
      flex: 1;
    }

    .info h3 {
      margin-bottom: 7px;
    }

    .info p {
      color: #64748b;
      font-size: 13px;
      margin-bottom: 8px;
    }

    .info strong {
      color: #b45309;
    }

    button {
      background: #f59e0b;
      color: #111827;
      border: none;
      border-radius: 8px;
      padding: 11px 14px;
      font-weight: bold;
      margin-top: 9px;
      cursor: pointer;
    }

    .carrinho {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      background: #111827;
      color: white;
      padding: 17px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    @media (max-width: 420px) {
      .produto img {
        width: 85px;
        height: 85px;
      }
    }
  </style>
</head>

<body>
  <header>
    <h1>${escaparHTML(restaurante.nome)}</h1>
    <p>${escaparHTML(restaurante.descricao)}</p>
  </header>

  <main>
    <h2>Nosso cardápio</h2>
    ${itens}
  </main>

  <section class="carrinho">
    <div>
      <strong id="quantidade">0 itens</strong>
      <p id="total">Total: R$ 0,00</p>
    </div>
    <button id="ver-carrinho">Ver carrinho</button>
  </section>

  <script type="application/json" id="dados-produtos">${dadosProdutos}</script>

  <script>
    const produtos = JSON.parse(
      document.getElementById('dados-produtos').textContent
    );

    const carrinho = [];

    document.querySelectorAll('[data-indice]').forEach(botao => {
      botao.addEventListener('click', () => {
        const produto = produtos[Number(botao.dataset.indice)];

        if (!produto) return;

        carrinho.push(produto);
        atualizarCarrinho();
      });
    });

    function atualizarCarrinho() {
      const quantidade = carrinho.length;

      const total = carrinho.reduce(
        (soma, item) => soma + Number(item.preco),
        0
      );

      document.getElementById('quantidade').textContent =
        quantidade + (quantidade === 1 ? ' item' : ' itens');

      document.getElementById('total').textContent =
        'Total: ' + total.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });
    }

    document.getElementById('ver-carrinho').addEventListener('click', () => {
      if (carrinho.length === 0) {
        alert('Seu carrinho está vazio.');
        return;
      }

      const resumo = carrinho.map(item =>
        item.nome + ' - ' + Number(item.preco).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        })
      ).join('\\n');

      alert('SEU PEDIDO\\n\\n' + resumo + '\\n\\n' +
        document.getElementById('total').textContent);
    });
  </script>
</body>
</html>
`;
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET') {
    res.writeHead(405, {
      'Content-Type': 'application/json; charset=utf-8'
    });

    return res.end(JSON.stringify({
      ok: false,
      message: 'Método não permitido.'
    }));
  }

  const rota = req.url.split('?')[0];

  if (rota === '/api/health') {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8'
    });

    return res.end(JSON.stringify({
      ok: true,
      message: 'FRE-CARDAPIO está funcionando!'
    }));
  }

  if (rota === '/api/restaurantes') {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8'
    });

    return res.end(JSON.stringify(listarRestaurantes()));
  }

  const correspondencia = rota.match(
    /^\/restaurante\/([a-z0-9-]+)$/
  );

  if (correspondencia) {
    const restaurante = buscarRestaurante(correspondencia[1]);

    if (!restaurante) {
      res.writeHead(404, {
        'Content-Type': 'application/json; charset=utf-8'
      });

      return res.end(JSON.stringify({
        ok: false,
        message: 'Restaurante não encontrado.'
      }));
    }

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8'
    });

    return res.end(gerarCardapio(restaurante));
  }

  const paginas = {
    '/': 'index.html',
    '/cardapio': 'cardapio.html'
  };

  if (paginas[rota]) {
    const arquivo = path.join(
      __dirname,
      '../frontend',
      paginas[rota]
    );

    return fs.readFile(arquivo, (erro, conteudo) => {
      if (erro) {
        res.writeHead(500);
        return res.end('Erro ao carregar a página.');
      }

      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
      });

      res.end(conteudo);
    });
  }

  res.writeHead(404, {
    'Content-Type': 'application/json; charset=utf-8'
  });

  res.end(JSON.stringify({
    ok: false,
    message: 'Rota não encontrada.'
  }));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(
    `FRE-CARDAPIO rodando em http://127.0.0.1:${PORT}`
  );
});

