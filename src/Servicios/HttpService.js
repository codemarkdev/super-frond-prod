const RUTA_GLOBAL = "http://localhost:3000/";

const HttpService = {
  async login(datos) {
    try {
      const respuesta = await fetch(RUTA_GLOBAL + "users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
      });
      
      const resultado = await respuesta.json();
      
      return {
        statusCode: respuesta.status,
        data: resultado
      };
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  },
};

export default HttpService;