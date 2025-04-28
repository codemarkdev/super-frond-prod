import axios from "axios";

const apiRequest = async ({ method, path, data = {} , responseType = 'json' }) => {
  try {
    const headers = {
      'Content-Type': responseType === 'json' ? 'application/json' : 'application/pdf',
      'Accept': responseType === 'json' ? 'application/json' : 'application/pdf',
    };

    const response = await axios({
      method,
      url: `${process.env.VUE_APP_API}${path}`,
      data,
      headers,
      responseType: responseType === 'json' ? 'json' : 'blob' 
    });

    return response;
  } catch (error) {
    console.error("Error en la petición API:", {
      mensaje: error.message,
      url: `${process.env.VUE_APP_API}${path}`,
      data: error.response?.data,
      status: error.response?.status
    });

    return error.response || error;
  }
};

export default apiRequest;