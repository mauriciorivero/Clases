// ========================================
// REPOSITORY + ADAPTER: UNA SOLA FORMA DE PEDIR PRODUCTOS
// ========================================
// Contrato que toda implementación debe cumplir. JavaScript no tiene interfaces,
// así que usamos una clase base que lanza un error si falta un método.
export class ProductRepository {
  async findAll() { throw new Error('findAll() no implementado'); }
  async findById(id) { throw new Error('findById() no implementado'); }
  async create(product) { throw new Error('create() no implementado'); }
}
