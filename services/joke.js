
const { default: axios } = require("axios");
const DELIVER_JOKES_API_URL = process.env.DELIVER_JOKES_API_URL;

exports.getJokeTypes_srv = async () => {
  try {
    const response = await axios.get(`${DELIVER_JOKES_API_URL}/jokes/types`);

    return response.data;
  } catch (err) {
    console.error("Error fetching joke types:", err);
    throw err;
  }
};
