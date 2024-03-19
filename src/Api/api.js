import axios from 'axios';
import API_URL from './api.constant';

export default function getApi() {
  return axios.create(localStorage.getItem('recap@localUserProfile') ? {
    baseURL: `${API_URL}`,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('recap@localUserProfile')}`,
    },
  } : {
    baseURL: `${API_URL}`,
  });
}
