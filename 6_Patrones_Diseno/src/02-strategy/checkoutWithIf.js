// ========================================
// ANTES DE ESTRATEGIA: UNA CADENA DE if / else
// ========================================
// Cada método de pago nuevo obliga a EDITAR esta función. Con diez métodos
// se vuelve enorme, difícil de probar y fácil de romper.
export function pay(method, amount, info) {
  if (method === 'creditCard') {
    return { ok: true, reference: `CC-${info.cardNumber.slice(-4)}`, amount };
  } else if (method === 'paypal') {
    return { ok: true, reference: `PP-${info.email}`, amount };
  } else if (method === 'bitcoin') {
    return { ok: true, reference: `BTC-${info.wallet.slice(0, 6)}`, amount };
  } else {
    throw new Error(`Método de pago no soportado: ${method}`);
  }
}
