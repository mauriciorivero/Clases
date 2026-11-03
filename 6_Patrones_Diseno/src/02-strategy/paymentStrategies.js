// ========================================
// ESTRATEGIA: UN OBJETO POR CADA FORMA DE HACER LO MISMO
// ========================================
// Todas cumplen el mismo contrato: { name, pay(amount, info) }.
// Agregar un método de pago nuevo = agregar un objeto. No se toca nada más.

export const creditCard = {
  name: 'Tarjeta de crédito',
  pay(amount, { cardNumber }) {
    if (!/^\d{16}$/.test(cardNumber)) {
      throw new Error('Número de tarjeta inválido');
    }
    return { ok: true, reference: `CC-${cardNumber.slice(-4)}`, amount };
  }
};

export const paypal = {
  name: 'PayPal',
  pay(amount, { email }) {
    if (!email?.includes('@')) throw new Error('Correo de PayPal inválido');
    return { ok: true, reference: `PP-${email}`, amount };
  }
};

export const bitcoin = {
  name: 'Bitcoin',
  pay(amount, { wallet }) {
    if (!wallet) throw new Error('Falta la dirección de la billetera');
    return { ok: true, reference: `BTC-${wallet.slice(0, 6)}`, amount };
  }
};

export const bankAccount = {
  name: 'Cuenta bancaria',
  pay(amount, { accountNumber }) {
    if (!accountNumber) throw new Error('Falta el número de cuenta');
    return { ok: true, reference: `BANK-${accountNumber.slice(-4)}`, amount };
  }
};

// Catálogo de estrategias disponibles, por nombre
export const paymentStrategies = { creditCard, paypal, bitcoin, bankAccount };
