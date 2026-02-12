// import axios from "axios";

// const API = axios.create({
//     // It will use the variable if it exists, otherwise it defaults to localhost
//     baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/quotations"
//     // baseURL: "http://localhost:5000/api/quotations"
// });

// export const getQuotations = params => API.get("/", { params });
// export const getQuotation = id => API.get(`/${id}`);
// export const createQuotation = data => API.post("/", data);
// export const updateQuotation = (id, data) => API.put(`/${id}`, data);
// export const deleteQuotation = id => API.delete(`/${id}`);
// export const finalizeQuotation = id => API.patch(`/${id}/finalize`);
// export const downloadPDF = id => API.get(`/${id}/pdf`, { responseType: "blob" });
// export const downloadExcel = id =>
//     API.get(`/${id}/excel`, { responseType: "blob" });

import axios from "axios";

const API = axios.create({
    baseURL:
        import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

// 🔐 Attach JWT automatically
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const getQuotations = (params) =>
    API.get("/quotations/", { params });

export const getQuotation = (id) =>
    API.get(`/quotations/${id}`);

export const createQuotation = (data) =>
    API.post("/quotations/", data);

export const updateQuotation = (id, data) =>
    API.put(`/quotations/${id}`, data);

export const deleteQuotation = (id) =>
    API.delete(`/quotations/${id}`);

export const finalizeQuotation = (id) =>
    API.patch(`/quotations/${id}/finalize`);

export const downloadPDF = (id) =>
    API.get(`/quotations/${id}/pdf`, {
        responseType: "blob"
    });

export const downloadExcel = (id) =>
    API.get(`/quotations/${id}/excel`, {
        responseType: "blob"
    });