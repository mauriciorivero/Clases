import { Deluxe, Exquisite, Sandwich } from './sandwich.js';
import { withCache, withRetry, withTiming } from './functionDecorators.js';
import { createClient, seedSupabase } from '../lib/supabaseSimulado.js';

// --- 1. Decorar UNA instancia sin tocar la clase ni las demás ---
const turkey = new Sandwich('Pavo', 6.49);
const blt = new Sandwich('BLT', 7.55);

const deluxeTurkey = new Deluxe(turkey);
const exquisiteBlt = new Exquisite(new Deluxe(blt)); // los decoradores se apilan

console.log(turkey.order());        // el original no cambió
console.log(deluxeTurkey.order());
console.log(exquisiteBlt.order());
console.log(new Sandwich('Pavo', 6.49).order()); // las demás instancias tampoco

// --- 2. Decorar funciones: consultar productos en Supabase ---
const supabase = createClient('https://demo.supabase.co', 'clave-de-prueba');
seedSupabase('products', [
  { id: 1, name: 'Teclado', category: 'perifericos' },
  { id: 2, name: 'Mouse', category: 'perifericos' }
]);

async function findProducts(category) {
  const { data, error } = await supabase.from('products').select('*').eq('category', category);
  if (error) throw new Error(error.message);
  return data;
}

// El orden importa: withTiming envuelve a withCache, así mide también los aciertos de caché
const findProductsFast = withTiming(withCache(findProducts), 'findProducts');

console.log('\nPrimera consulta (va a la base de datos):');
await findProductsFast('perifericos');
console.log('Segunda consulta (sale de la caché):');
await findProductsFast('perifericos');

// --- 3. Reintentos para una función que falla a veces ---
let calls = 0;
const flaky = async () => {
  if (++calls < 3) throw new Error('conexión perdida');
  return 'datos recibidos';
};

console.log('\nFunción inestable con reintentos:');
console.log(await withRetry(flaky)());
