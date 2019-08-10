import axios from 'axios';

const setAuthToken = token => {
  if (token) {                      //if there's a token in the local storage
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }
};

export default setAuthToken;