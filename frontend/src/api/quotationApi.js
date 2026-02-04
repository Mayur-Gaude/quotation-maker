import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api/quotations"
});

export const getQuotations = params => API.get("/", { params });
export const getQuotation = id => API.get(`/${id}`);
export const createQuotation = data => API.post("/", data);
export const updateQuotation = (id, data) => API.put(`/${id}`, data);
export const deleteQuotation = id => API.delete(`/${id}`);
export const finalizeQuotation = id => API.patch(`/${id}/finalize`);
export const downloadPDF = id => API.get(`/${id}/pdf`, { responseType: "blob" });
export const downloadExcel = id =>
    API.get(`/${id}/excel`, { responseType: "blob" });
