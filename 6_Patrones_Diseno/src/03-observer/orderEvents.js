import { EventEmitter } from 'node:events';

// ========================================
// OBSERVER EN EL BACKEND: EL MÓDULO NATIVO `events`
// ========================================
// Node.js ya trae el patrón: emit() es "notificar" y on() es "suscribirse".
// Es un Singleton por módulo: todos los archivos que lo importen comparten
// el mismo emisor.
export const orderEvents = new EventEmitter();

// Cada suscriptor reacciona al pedido sin que el código que lo crea
// sepa que existe.
export function registerOrderListeners() {
  orderEvents.on('order:created', (order) => {
    console.log(`  · Correo de confirmación enviado a ${order.email}`);
  });
  orderEvents.on('order:created', (order) => {
    console.log(`  · Inventario descontado del producto ${order.productId}`);
  });
  orderEvents.on('order:created', (order) => {
    console.log(`  · Auditoría: pedido ${order.id} registrado`);
  });
}
