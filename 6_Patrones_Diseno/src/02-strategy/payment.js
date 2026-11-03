import { readFileSync } from 'node:fs';
import { paymentStrategies } from './paymentStrategies.js';

// La estrategia por defecto sale de config.json y se lee con `fs`, como en la clase 4
const config = JSON.parse(readFileSync(new URL('./config.json', import.meta.url), 'utf-8'));

// Contexto: no sabe CÓMO se paga, solo delega en la estrategia elegida
export class Payment {
  #strategy;

  constructor(strategyName = 'creditCard') {
    this.setStrategy(strategyName);
  }

  // Se puede cambiar en tiempo de ejecución, según lo que elija el usuario
  setStrategy(strategyName) {
    // Object.hasOwn evita que "constructor" cuele una función ajena
    if (!Object.hasOwn(paymentStrategies, strategyName)) {
      throw new Error(`Estrategia de pago desconocida: "${strategyName}"`);
    }
    this.#strategy = paymentStrategies[strategyName];
    return this;
  }

  process(amount, info) {
    return this.#strategy.pay(amount, info);
  }
}

// Instancia lista para usar con la estrategia configurada
export const defaultPayment = new Payment(config.payment.strategy);
