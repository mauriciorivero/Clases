// ========================================
// SINGLETON EN EL BACKEND: UN CLIENTE POR BASE DE DATOS
// ========================================
// Abrir una conexión nueva en cada petición agota las conexiones que permite
// MongoDB Atlas. Se crea UNA vez y todas las peticiones la reutilizan.
import { MongoClient } from '../lib/mongoSimulado.js';
import { createClient } from '../lib/supabaseSimulado.js';

const DEFAULT_MONGO_URI = 'mongodb+srv://usuario:clave@cluster.mongodb.net';

let supabase = null;
let mongoPromise = null;

export function getSupabase() {
  if (!supabase) {
    supabase = createClient(
      process.env.SUPABASE_URL ?? 'https://demo.supabase.co',
      process.env.SUPABASE_KEY ?? 'clave-de-prueba'
    );
  }
  return supabase;
}

export function getMongoClient() {
  // Guardamos la PROMESA, no el cliente: si llegan 3 peticiones a la vez,
  // las tres esperan la misma conexión en vez de abrir tres.
  if (!mongoPromise) {
    const uri = process.env.MONGODB_URI ?? DEFAULT_MONGO_URI;
    mongoPromise = new MongoClient(uri).connect().catch((error) => {
      mongoPromise = null; // si falla, la próxima petición puede reintentar
      throw error;
    });
  }
  return mongoPromise;
}
