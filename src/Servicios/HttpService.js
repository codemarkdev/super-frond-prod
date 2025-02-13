import axios from "axios";

const apiRequest = async ({ method, path, data = {} }) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const response = await axios({
      method,
      url: `${process.env.VUE_APP_API_URL}${path}`,
      data,
      headers,
    });

    return response;
  } catch (error) {
    return error; 
  }
};

export default apiRequest;
