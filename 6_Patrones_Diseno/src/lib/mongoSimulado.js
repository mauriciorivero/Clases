// ========================================
// SIMULADOR DEL DRIVER OFICIAL DE MONGODB
// ========================================
// Imita la parte del paquete `mongodb` que usaremos en esta clase, con los
// mismos nombres de método: connect(), db(), collection(), find(), insertOne()...
// Guarda los datos en memoria, así que no necesitas cuenta de Atlas ni internet.
//
// Cuando llegues a la clase de MongoDB, cambia esta línea:
//   import { MongoClient } from '../lib/mongoSimulado.js';
// por esta otra (después de `npm install mongodb`):
//   import { MongoClient } from 'mongodb';
// y el resto del código sigue funcionando igual.

import { randomBytes } from 'node:crypto';

const DELAY_MS = 20; // simula el viaje de red hasta Atlas
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// "Servidor" de Atlas: las colecciones viven aquí, iguales para todos los clientes
const server = new Map();

const getDocs = (dbName, collectionName) => {
  const key = `${dbName}.${collectionName}`;
  if (!server.has(key)) server.set(key, []);
  return server.get(key);
};

// Solo existe en el simulador: deja documentos de prueba en una colección
export function seedMongo(dbName, collectionName, docs) {
  server.set(`${dbName}.${collectionName}`, structuredClone(docs));
}

export class MongoClient {
  // Cuenta cuántas conexiones se han abierto. Sirve para comprobar el Singleton.
  static connections = 0;

  constructor(uri) {
    if (!uri) throw new Error('La cadena de conexión (uri) es obligatoria');
    this.uri = uri;
  }

  async connect() {
    await sleep(DELAY_MS);
    MongoClient.connections++;
    return this; // el driver real también devuelve el cliente
  }

  db(name) {
    return { collection: (collectionName) => new Collection(getDocs(name, collectionName)) };
  }

  async close() {}
}

// Un filtro simple de igualdad: { campo: valor }
const matches = (filter) => (doc) => Object.entries(filter).every(([field, value]) => doc[field] === value);

class Collection {
  #docs;

  constructor(docs) {
    this.#docs = docs;
  }

  find(filter = {}) {
    const found = this.#docs.filter(matches(filter)).map((doc) => ({ ...doc }));
    return { toArray: async () => { await sleep(DELAY_MS); return found; } };
  }

  async findOne(filter = {}) {
    await sleep(DELAY_MS);
    const doc = this.#docs.find(matches(filter));
    return doc ? { ...doc } : null;
  }

  async insertOne(doc) {
    await sleep(DELAY_MS);
    const insertedId = randomBytes(12).toString('hex'); // parecido a un ObjectId
    this.#docs.push({ _id: insertedId, ...doc });
    return { acknowledged: true, insertedId };
  }

  async updateOne(filter, { $set }) {
    await sleep(DELAY_MS);
    const doc = this.#docs.find(matches(filter));
    if (doc) Object.assign(doc, $set);
    return { matchedCount: doc ? 1 : 0, modifiedCount: doc ? 1 : 0 };
  }

  async deleteOne(filter) {
    await sleep(DELAY_MS);
    const index = this.#docs.findIndex(matches(filter));
    if (index >= 0) this.#docs.splice(index, 1);
    return { deletedCount: index >= 0 ? 1 : 0 };
  }
}
