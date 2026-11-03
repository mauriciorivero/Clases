// ========================================
// DECORATOR: AGREGAR COMPORTAMIENTO A UNA INSTANCIA, NO A TODA LA CLASE
// ========================================
export class Sandwich {
  constructor(type, price) {
    this.type = type;
    this.price = price;
  }

  order() {
    return `${this.type} · $${this.price.toFixed(2)}`;
  }
}

// El decorador envuelve a un sándwich y, por defecto, delega todo en él
class SandwichDecorator {
  constructor(sandwich) {
    this.sandwich = sandwich;
  }

  get type() { return this.sandwich.type; }
  get price() { return this.sandwich.price; }
  order() { return `${this.type} · $${this.price.toFixed(2)}`; }
}

// Cada decorador cambia solo lo que le interesa
export class Deluxe extends SandwichDecorator {
  get type() { return `${super.type} Lujoso`; }
  get price() { return super.price + 1.75; }
}

export class Exquisite extends SandwichDecorator {
  get type() { return `${super.type} Exquisito`; }
  get price() { return super.price + 10.75; }
}
