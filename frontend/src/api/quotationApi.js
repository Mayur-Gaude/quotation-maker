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

export const getDashboardStats = () =>
    API.get("/quotations/stats/dashboard");

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

export const markQuotationSent = id =>
    API.patch(`/quotations/${id}/mark-sent`);

export const duplicateQuotation = id =>
    API.post(`/quotations/${id}/duplicate`);

export const downloadPDF = (id, currencySymbol) =>
    API.get(`/quotations/${id}/pdf`, {
        responseType: "blob",
        params: currencySymbol ? { currency: currencySymbol } : {}
    });

export const downloadExcel = (id) =>
    API.get(`/quotations/${id}/excel`, {
        responseType: "blob"
    });

/** Shared axios instance (auth interceptor) for other API modules */
export { API as apiClient };