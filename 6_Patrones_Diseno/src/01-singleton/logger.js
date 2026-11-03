// ========================================
// SINGLETON: UNA SOLA INSTANCIA PARA TODA LA APLICACIÓN
// ========================================
export class Logger {
  static #instance = null;
  #entries = [];

  constructor() {
    // Si ya existe una instancia, no dejamos crear otra con `new`
    if (Logger.#instance) {
      throw new Error('Usa Logger.getInstance() en lugar de new Logger()');
    }
  }

  // Carga perezosa (lazy loading): se crea la primera vez que alguien la pide
  static getInstance() {
    if (!Logger.#instance) {
      Logger.#instance = new Logger();
    }
    return Logger.#instance;
  }

  log(level, message) {
    this.#entries.push({ level, message, at: new Date().toISOString() });
    console.log(`[${level}] ${message}`);
  }

  info(message) { this.log('INFO', message); }
  error(message) { this.log('ERROR', message); }

  get history() { return [...this.#entries]; }
}

// En ES Modules, Node.js ejecuta cada archivo UNA sola vez y guarda el
// resultado en caché. Exportar una instancia ya es un Singleton: todos
// reciben el mismo objeto.
export const logger = Logger.getInstance();
