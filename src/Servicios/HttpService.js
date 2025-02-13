import axios from "axios";

const apiRequest = async ({ method, path, data = {} }) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Usar la variable de entorno VUE_APP_API
    const response = await axios({
      method,
      url: `${process.env.VUE_APP_API}${path}`,
      data,
      headers,
    });

    return response;
  } catch (error) {
    console.error("Error en la petición API:", {
      mensaje: error.message,
      url: `${process.env.VUE_APP_API}${path}`,
      data: error.response?.data,
      status: error.response?.status
    });
    
    // Retornar el error para manejarlo en el componente
    return error.response || error;
  }
};

export default apiRequest;