import axios from "axios";
import { API_URL } from "../config";

const api = axios.create({

    baseURL: API_URL

});

api.interceptors.request.use((config)=>{

    const token = localStorage.getItem("token");

    if(token){

        config.headers.Authorization = `Bearer ${token}`;

    }

    return config;

});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const requestUrl = error.config?.url || "";
        const isCredentialRequest = /\/auth\/(login|register)(?:\?|$)/.test(requestUrl);

        // An invalid password is not an expired session. Only clear auth for
        // 401s from protected endpoints so stale sessions recover cleanly.
        if (status === 401 && !isCredentialRequest && localStorage.getItem("token")) {
            window.dispatchEvent(new Event("krishi:auth-expired"));
        }
        return Promise.reject(error);
    }
);

export default api;
