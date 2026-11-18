
const restaurantes = [
  {
    id: 1,
    nome: 'Sabor da Casa',
    slug: 'sabor-da-casa',
    descricao: 'Comida boa, feita com carinho!',
    ativo: true,
    produtos: [
      {
        id: 1,
        nome: 'Hambúrguer Clássico',
        descricao: 'Pão, carne artesanal, queijo, alface e tomate.',
        preco: 24.90,
        imagem: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300',
        categoria: 'Hambúrgueres',
        ativo: true
      },
      {
        id: 2,
        nome: 'Pizza de Calabresa',
        descricao: 'Molho, queijo, calabresa e cebola.',
        preco: 39.90,
        imagem: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300',
        categoria: 'Pizzas',
        ativo: true
      },
      {
        id: 3,
        nome: 'Refrigerante',
        descricao: 'Bebida gelada de 350 ml.',
        preco: 6.00,
        imagem: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=300',
        categoria: 'Bebidas',
        ativo: true
      }
    ]
  },
  {
    id: 2,
    nome: 'Pizzaria Central',
    slug: 'pizzaria-central',
    descricao: 'As melhores pizzas da cidade!',
    ativo: true,
    produtos: [
      {
        id: 1,
        nome: 'Pizza de Mussarela',
        descricao: 'Molho de tomate, mussarela e orégano.',
        preco: 35.90,
        imagem: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=300',
        categoria: 'Pizzas',
        ativo: true
      },
      {
        id: 2,
        nome: 'Pizza de Calabresa',
        descricao: 'Calabresa, cebola, queijo e molho especial.',
        preco: 39.90,
        imagem: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300',
        categoria: 'Pizzas',
        ativo: true
      },
      {
        id: 3,
        nome: 'Refrigerante 2L',
        descricao: 'Refrigerante gelado de 2 litros.',
        preco: 12.00,
        imagem: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=300',
        categoria: 'Bebidas',
        ativo: true
      }
    ]
  }
];

function listarRestaurantes() {
  return restaurantes.filter(restaurante => restaurante.ativo);
}

function buscarRestaurante(slug) {
  return restaurantes.find(
    restaurante =>
      restaurante.slug === slug && restaurante.ativo
  );
}

module.exports = {
  listarRestaurantes,
  buscarRestaurante
};

