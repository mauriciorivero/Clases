import { Logger, logger } from './logger.js';
import { getMongoClient, getSupabase } from './database.js';
import { MongoClient } from '../lib/mongoSimulado.js';

// --- 1. El logger: dos "componentes" distintos piden el logger ---
const fromOrders = Logger.getInstance();
const fromPayments = Logger.getInstance();

fromOrders.info('Pedido #1 creado');
fromPayments.info('Pago del pedido #1 aprobado');

console.log('¿Es la misma instancia?', fromOrders === fromPayments);
console.log('¿Y la que exporta el módulo?', fromOrders === logger);
console.log('Historial compartido:', logger.history.length, 'entradas');

try {
  new Logger();
} catch (error) {
  console.log('new Logger() →', error.message);
}

// --- 2. La base de datos: tres peticiones simultáneas ---
const [a, b, c] = await Promise.all([getMongoClient(), getMongoClient(), getMongoClient()]);
console.log('¿Mismo cliente de MongoDB?', a === b && b === c);
console.log('Conexiones abiertas:', MongoClient.connections);
console.log('¿Mismo cliente de Supabase?', getSupabase() === getSupabase());
