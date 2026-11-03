// El servicio contiene las reglas del negocio. Depende de la ABSTRACCIÓN
// (cualquier repositorio con findAll/findById/create), no de Supabase ni
// de MongoDB.
export class ProductService {
  constructor(repository) {
    this.repository = repository;
  }

  listProducts() {
    return this.repository.findAll();
  }

  async getProduct(id) {
    const product = await this.repository.findById(id);
    if (!product) {
      // `status` le sirve a la capa HTTP para responder 404 en lugar de 500
      const error = new Error(`Producto ${id} no encontrado`);
      throw Object.assign(error, { status: 404 });
    }
    return product;
  }

  addProduct({ name, price }) {
    if (!name || !(price > 0)) throw new Error('Datos de producto inválidos');
    return this.repository.create({ name, price });
  }
}
