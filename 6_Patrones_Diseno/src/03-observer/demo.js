import { CategoryDropdown, FilterDropdown } from './dropdowns.js';
import { orderEvents, registerOrderListeners } from './orderEvents.js';

// --- 1. Listas desplegables que dependen de una categoría ---
// En el navegador, loadItems sería un fetch('/api/filtros?...'); aquí devuelve datos fijos
const catalog = {
  Pinturas: { colors: ['rojo', 'azul'], price: ['< $20', '> $20'], brand: ['Pintuco'] },
  Herramientas: { colors: ['negro'], price: ['< $50', '> $50'], brand: ['Bosch', 'Stanley'] }
};
const loadItems = async (filterType, category) => catalog[category][filterType];

const categories = new CategoryDropdown();
const colors = new FilterDropdown('colors', loadItems);
const price = new FilterDropdown('price', loadItems);
const brand = new FilterDropdown('brand', loadItems);

categories.subscribe(colors);
const unsubscribePrice = categories.subscribe(price);
categories.subscribe(brand);

await categories.select('Pinturas');
console.log('Categoría "Pinturas":', colors.items, price.items, brand.items);

unsubscribePrice(); // el filtro de precio deja de escuchar
await categories.select('Herramientas');
console.log('Categoría "Herramientas":', colors.items, price.items, brand.items);

// --- 2. Eventos de pedidos con el módulo nativo `events` ---
registerOrderListeners();

function createOrder(data) {
  const order = { id: 101, ...data };
  console.log(`Pedido ${order.id} guardado en la base de datos`);
  orderEvents.emit('order:created', order); // no sabe quién escucha
  return order;
}

createOrder({ productId: 7, email: 'ana@correo.com' });
console.log('emit() es síncrono: los suscriptores ya terminaron aquí');
