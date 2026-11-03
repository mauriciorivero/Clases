import { logger } from '../01-singleton/logger.js';
import { authStrategies } from '../02-strategy/authStrategies.js';

// Registra la petición y, cuando la cadena termina, la respuesta
export async function logRequest(req, res, next) {
  logger.info(`${req.method} ${req.path}`);
  await next();
  logger.info(`${req.method} ${req.path} → ${res.status}`);
}

// Atrapa los errores de los eslabones que siguen y los vuelve una respuesta
export async function errorHandler(req, res, next) {
  try {
    await next();
  } catch (error) {
    res.send(error.status ?? 500, { error: error.message });
  }
}

// Fábrica de middlewares: delega en una ESTRATEGIA de autenticación
export function authenticate(strategyName) {
  const strategy = authStrategies[strategyName];
  return async (req, res, next) => {
    const user = strategy(req.headers);
    if (!user) {
      return res.send(401, { error: 'No autorizado' }); // corta la cadena
    }
    req.user = user;
    await next();
  };
}

export async function validateProduct(req, res, next) {
  const { name, price } = req.body ?? {};
  if (!name || !(price > 0)) {
    return res.send(400, { error: 'name y price son obligatorios' });
  }
  await next();
}
