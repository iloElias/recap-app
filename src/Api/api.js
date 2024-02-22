import axios from "axios";
import API_URL from "./api.constant";

export default function getApi() {
    const userToken = localStorage.getItem('recap@localUserProfile') ?? null;

    return axios.create(userToken ? {
        baseURL: `${API_URL}`,
        headers: {
            Authorization: `Bearer ${userToken}`,
        }
    } : {
        baseURL: `${API_URL}`,
    });
}