import { Subject } from './subject.js';

// Sujeto: la lista de categorías. Cuando el usuario elige una, avisa.
export class CategoryDropdown extends Subject {
  selected = null;

  select(category) {
    this.selected = category;
    return this.notify(category);
  }
}

// Observador: cada filtro recarga sus opciones cuando cambia la categoría.
// `loadItems` es quien pide los datos: un fetch en el navegador o una
// consulta en el servidor.
export class FilterDropdown {
  items = [];

  constructor(filterType, loadItems) {
    this.filterType = filterType;
    this.loadItems = loadItems;
  }

  async update(category) {
    this.items = await this.loadItems(this.filterType, category);
  }
}
