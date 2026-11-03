import { CheckoutFacade } from './checkoutFacade.js';
import { ProductService } from '../05-adapter-repository/productService.js';
import { createProductRepository } from '../06-factory-method/repositoryFactory.js';
import { orderEvents, registerOrderListeners } from '../03-observer/orderEvents.js';

registerOrderListeners();

const productService = new ProductService(await createProductRepository());
const product = await productService.addProduct({ name: 'Teclado', price: 45 });

const checkout = new CheckoutFacade({ productService, events: orderEvents });

// Una sola llamada para el controlador
const order = await checkout.placeOrder({
  productId: product.id,
  email: 'ana@correo.com',
  paymentMethod: 'creditCard',
  paymentInfo: { cardNumber: '4111111111111111' }
});
console.log('Pedido:', order);

// Si algo falla dentro, el controlador recibe un solo error
try {
  await checkout.placeOrder({ productId: 999, email: 'ana@correo.com', paymentMethod: 'paypal', paymentInfo: {} });
} catch (error) {
  console.log('Error:', error.message);
}
