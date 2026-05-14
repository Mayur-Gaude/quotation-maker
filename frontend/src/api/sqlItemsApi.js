import { apiClient } from "./quotationApi";

export const getSqlItems = () => apiClient.get("/sqlitems");

export const createSqlItem = body => apiClient.post("/sqlitems", body);

export const updateSqlItem = (id, body) => apiClient.put(`/sqlitems/${id}`, body);

export const deleteSqlItem = id => apiClient.delete(`/sqlitems/${id}`);
