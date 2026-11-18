
const test = require('node:test');
const assert = require('node:assert/strict');

const {
  listarRestaurantes,
  buscarRestaurante
} = require('../backend/data/restaurantes');

test('deve listar os restaurantes ativos', () => {
  const restaurantes = listarRestaurantes();

  assert.ok(restaurantes.length >= 2);
  assert.ok(restaurantes.every(restaurante => restaurante.ativo));
});

test('deve encontrar o Sabor da Casa pelo slug', () => {
  const restaurante = buscarRestaurante('sabor-da-casa');

  assert.ok(restaurante);
  assert.equal(restaurante.nome, 'Sabor da Casa');
});

test('deve encontrar a Pizzaria Central pelo slug', () => {
  const restaurante = buscarRestaurante('pizzaria-central');

  assert.ok(restaurante);
  assert.equal(restaurante.nome, 'Pizzaria Central');
});

test('deve retornar undefined para restaurante inexistente', () => {
  const restaurante = buscarRestaurante('restaurante-inexistente');

  assert.equal(restaurante, undefined);
});

test('cada restaurante deve possuir produtos cadastrados', () => {
  const restaurantes = listarRestaurantes();

  for (const restaurante of restaurantes) {
    assert.ok(Array.isArray(restaurante.produtos));
    assert.ok(restaurante.produtos.length > 0);
  }
});

