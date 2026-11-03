// ========================================
// CHAIN OF RESPONSIBILITY: UNA CADENA DE ESLABONES
// ========================================
// Cada middleware decide si atiende la petición, la modifica o se la pasa al
// siguiente llamando a next(). Así funcionan los middlewares de Express.
export function createPipeline(...middlewares) {
  return async function handle(req) {
    const res = {
      status: 200,
      body: null,
      send(status, body) {
        this.status = status;
        this.body = body;
      }
    };

    const dispatch = async (index) => {
      const middleware = middlewares[index];
      if (middleware) await middleware(req, res, () => dispatch(index + 1));
    };

    try {
      await dispatch(0);
    } catch (error) {
      res.send(500, { error: error.message });
    }
    return res;
  };
}
