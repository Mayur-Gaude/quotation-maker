import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import QuotationList from "../pages/QuotationList";
import CreateQuotation from "../pages/CreateQuotation";
import EditQuotation from "../pages/EditQuotation";
import ViewQuotation from "../pages/ViewQuotation";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<QuotationList />} />
        <Route path="/create" element={<CreateQuotation />} />
        <Route path="/edit/:id" element={<EditQuotation />} />
        <Route path="/view/:id" element={<ViewQuotation />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
