// ========================================
// OBSERVER: EL SUJETO AVISA, LOS OBSERVADORES REACCIONAN
// ========================================
// Relación uno a muchos: cuando el sujeto cambia, todos sus observadores
// se enteran. El sujeto no sabe qué hace cada uno con el aviso.
export class Subject {
  #observers = new Set();

  // Devuelve la función para darse de baja.
  // Olvidarla causa fugas de memoria.
  subscribe(observer) {
    this.#observers.add(observer);
    return () => this.#observers.delete(observer);
  }

  async notify(data) {
    // allSettled: si un observador falla, los demás reciben el aviso igual
    const results = await Promise.allSettled(
      [...this.#observers].map(async (observer) => observer.update(data))
    );
    for (const result of results) {
      if (result.status === 'rejected') {
        console.error('Un observador falló:', result.reason.message);
      }
    }
  }
}
