
const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');

let servidor;
let baseURL;

test.before(async () => {
  const porta = 3100 + Math.floor(Math.random() * 1000);

  servidor = spawn(
    process.execPath,
    ['backend/server.js'],
    {
      env: {
        ...process.env,
        PORT: String(porta)
      },
      stdio: 'ignore'
    }
  );

  baseURL = `http://127.0.0.1:${porta}`;

  let iniciou = false;

  for (let tentativa = 0; tentativa < 50; tentativa++) {
    if (servidor.exitCode !== null) {
      throw new Error('O servidor encerrou antes de iniciar.');
    }

    try {
      const resposta = await fetch(`${baseURL}/api/health`);

      if (resposta.status === 200) {
        iniciou = true;
        break;
      }
    } catch {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  assert.equal(iniciou, true, 'O servidor não iniciou a tempo.');
});

test.after(() => {
  if (servidor && servidor.exitCode === null) {
    servidor.kill();
  }
});

test('GET /api/health deve retornar HTTP 200', async () => {
  const resposta = await fetch(`${baseURL}/api/health`);
  const dados = await resposta.json();

  assert.equal(resposta.status, 200);
  assert.equal(dados.ok, true);
});

test('GET /api/restaurantes deve listar dois restaurantes', async () => {
  const resposta = await fetch(`${baseURL}/api/restaurantes`);
  const dados = await resposta.json();

  assert.equal(resposta.status, 200);
  assert.ok(dados.some(r => r.slug === 'sabor-da-casa'));
  assert.ok(dados.some(r => r.slug === 'pizzaria-central'));
});

test('API pública não deve expor dados internos dos restaurantes', async () => {
  const resposta = await fetch(`${baseURL}/api/restaurantes`);
  const dados = await resposta.json();

  assert.equal(resposta.status, 200);

  for (const restaurante of dados) {
    assert.deepEqual(
      Object.keys(restaurante).sort(),
      ['descricao', 'nome', 'slug']
    );

    assert.equal('ativo' in restaurante, false);
    assert.equal('produtos' in restaurante, false);
  }
});

test('Cardápio do Sabor da Casa deve retornar HTTP 200', async () => {
  const resposta = await fetch(
    `${baseURL}/restaurante/sabor-da-casa`
  );

  const html = await resposta.text();

  assert.equal(resposta.status, 200);
  assert.match(html, /Sabor da Casa/);
  assert.match(html, /Hambúrguer Clássico/);
});

test('Cardápio da Pizzaria Central deve retornar HTTP 200', async () => {
  const resposta = await fetch(
    `${baseURL}/restaurante/pizzaria-central`
  );

  const html = await resposta.text();

  assert.equal(resposta.status, 200);
  assert.match(html, /Pizzaria Central/);
  assert.match(html, /Pizza de Mussarela/);
});

test('Restaurante inexistente deve retornar HTTP 404', async () => {
  const resposta = await fetch(
    `${baseURL}/restaurante/nao-existe`
  );

  const dados = await resposta.json();

  assert.equal(resposta.status, 404);
  assert.equal(dados.ok, false);
});

test('Método POST deve retornar HTTP 405', async () => {
  const resposta = await fetch(`${baseURL}/api/health`, {
    method: 'POST'
  });

  assert.equal(resposta.status, 405);
});

