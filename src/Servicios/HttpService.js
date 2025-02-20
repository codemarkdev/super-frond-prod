import axios from "axios";

const apiRequest = async ({ method, path, data = {} }) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

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

    return error.response || error;
  }
};

export default apiRequest;