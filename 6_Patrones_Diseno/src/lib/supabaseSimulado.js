// ========================================
// SIMULADOR DE @supabase/supabase-js
// ========================================
// Imita la parte del cliente de Supabase que usaremos en esta clase, con los
// mismos nombres de método y la misma forma de respuesta: { data, error }.
// Guarda los datos en memoria, así que no necesitas cuenta ni internet.
//
// Cuando llegues a la clase de Supabase, cambia esta línea:
//   import { createClient } from '../lib/supabaseSimulado.js';
// por esta otra (después de `npm install @supabase/supabase-js`):
//   import { createClient } from '@supabase/supabase-js';
// y el resto del código sigue funcionando igual.

const DELAY_MS = 20; // simula el viaje de red hasta la base de datos
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// "Servidor" de Supabase: las tablas viven aquí, igual para todos los clientes
const server = new Map();

// Solo existe en el simulador: deja datos de prueba en una tabla
export function seedSupabase(table, rows) {
  server.set(table, structuredClone(rows));
}

export function createClient(url, key) {
  if (!url || !key) throw new Error('supabaseUrl y supabaseKey son obligatorios');
  return {
    from(table) {
      if (!server.has(table)) server.set(table, []);
      return new QueryBuilder(server.get(table));
    }
  };
}

// Los métodos se encadenan y la consulta se ejecuta al hacer `await`
class QueryBuilder {
  #rows;
  #action = 'select';
  #values = [];
  #filters = [];
  #order = null;
  #limit = Infinity;
  #single = false;

  constructor(rows) {
    this.#rows = rows;
  }

  select() { return this; } // en el simulador siempre devolvemos las filas afectadas
  insert(values) { this.#action = 'insert'; this.#values = [].concat(values); return this; }
  update(values) { this.#action = 'update'; this.#values = values; return this; }
  delete() { this.#action = 'delete'; return this; }
  eq(column, value) { this.#filters.push((row) => row[column] === value); return this; }
  order(column, { ascending = true } = {}) { this.#order = { column, ascending }; return this; }
  limit(count) { this.#limit = count; return this; }
  single() { this.#single = true; return this; }

  // Al ser "thenable", `await builder` ejecuta la consulta
  then(resolve, reject) {
    return this.#execute().then(resolve, reject);
  }

  async #execute() {
    await sleep(DELAY_MS);
    const matches = (row) => this.#filters.every((test) => test(row));
    let data;

    if (this.#action === 'insert') {
      let nextId = this.#rows.reduce((max, row) => Math.max(max, row.id ?? 0), 0) + 1;
      data = this.#values.map((values) => ({ id: nextId++, ...values }));
      this.#rows.push(...data);
    } else if (this.#action === 'update') {
      data = this.#rows.filter(matches);
      data.forEach((row) => Object.assign(row, this.#values));
    } else if (this.#action === 'delete') {
      data = this.#rows.filter(matches);
      this.#rows.splice(0, this.#rows.length, ...this.#rows.filter((row) => !matches(row)));
    } else {
      data = this.#rows.filter(matches);
    }

    if (this.#order) {
      const { column, ascending } = this.#order;
      data = [...data].sort((a, b) => (a[column] > b[column] ? 1 : -1) * (ascending ? 1 : -1));
    }
    data = data.slice(0, this.#limit).map((row) => ({ ...row }));

    if (this.#single) {
      if (data.length !== 1) {
        // mismo código de error que usa PostgREST cuando .single() no encuentra una fila
        return { data: null, error: { code: 'PGRST116', message: `La consulta devolvió ${data.length} filas, se esperaba 1` } };
      }
      return { data: data[0], error: null };
    }
    return { data, error: null };
  }
}
