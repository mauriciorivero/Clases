import { Payment } from '../02-strategy/payment.js';

// ========================================
// FACADE: UNA PUERTA SIMPLE A UN SISTEMA COMPLICADO
// ========================================
// El controlador solo llama a placeOrder(). Por dentro coordinamos cuatro
// subsistemas: catálogo, pagos, pedidos y notificaciones.
export class CheckoutFacade {
  #orders = [];

  constructor({ productService, events }) {
    this.productService = productService;
    this.events = events;
  }

  async placeOrder({ productId, email, paymentMethod, paymentInfo }) {
    // 1. Catálogo: el producto debe existir
    const product = await this.productService.getProduct(productId);

    // 2. Pago: una estrategia NUEVA por pedido, para que las peticiones
    //    simultáneas no se mezclen
    const payment = new Payment(paymentMethod);
    const receipt = payment.process(product.price, paymentInfo);

    // 3. Pedido: lo guardamos
    const order = {
      id: this.#orders.length + 1,
      productId,
      email,
      total: product.price,
      receipt: receipt.reference
    };
    this.#orders.push(order);

    // 4. Notificaciones: avisamos a quien esté escuchando (Observer)
    this.events.emit('order:created', order);

    return order;
  }
}
