// ========================================
// DECORADORES DE FUNCIONES: LO QUE MÁS VERÁS EN EL BACKEND
// ========================================
// Reciben una función y devuelven otra que hace lo mismo y algo más.
// La función original no se modifica.

export const withLogging = (fn, label = fn.name) => async (...args) => {
  console.log(`→ ${label}(${args.map((a) => JSON.stringify(a)).join(', ')})`);
  const result = await fn(...args);
  console.log(`← ${label} terminó`);
  return result;
};

export const withTiming = (fn, label = fn.name) => async (...args) => {
  const start = performance.now();
  try {
    return await fn(...args);
  } finally {
    const ms = (performance.now() - start).toFixed(0);
    console.log(`  ${label} tardó ${ms} ms`);
  }
};

export const withCache = (fn, ttlMs = 5000) => {
  const cache = new Map();
  return async (...args) => {
    const key = JSON.stringify(args);
    const hit = cache.get(key);
    if (hit && hit.expiresAt > Date.now()) return hit.value;

    const value = await fn(...args);
    cache.set(key, { value, expiresAt: Date.now() + ttlMs });
    return value;
  };
};

export const withRetry = (fn, attempts = 3) => async (...args) => {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn(...args);
    } catch (error) {
      lastError = error;
      console.log(`  intento ${attempt} de ${attempts} falló: ${error.message}`);
    }
  }
  throw lastError;
};
