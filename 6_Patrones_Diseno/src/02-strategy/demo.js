import { defaultPayment, Payment } from './payment.js';
import { authStrategies } from './authStrategies.js';

// --- 1. Estrategia por defecto (config.json dice "paypal") ---
console.log(defaultPayment.process(120, { email: 'ana@correo.com' }));

// --- 2. Una instancia nueva usa tarjeta de crédito ---
const payment = new Payment();
console.log(payment.process(80, { cardNumber: '4111111111111111' }));

// --- 3. Cambiamos de estrategia en tiempo de ejecución ---
payment.setStrategy('bitcoin');
console.log(payment.process(80, { wallet: 'bc1qxy2kgdygjrsqtzq2n0yrf' }));

// --- 4. Nombres que no existen se rechazan ---
for (const name of ['efectivo', 'constructor']) {
  try {
    payment.setStrategy(name);
  } catch (error) {
    console.log(error.message);
  }
}

// --- 5. Estrategias de autenticación ---
console.log(authStrategies.bearer({ authorization: 'Bearer token-valido' }));
console.log(authStrategies.apiKey({ 'x-api-key': 'otra-clave' }));
