import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import QuotationList from "../pages/QuotationList";
import CreateQuotation from "../pages/CreateQuotation";
import EditQuotation from "../pages/EditQuotation";
import ViewQuotation from "../pages/ViewQuotation";
import SavedItems from "../pages/SavedItems";
import Settings from "../pages/Settings";

import Login from "../auth/Login";
import Register from "../auth/Register";
import ProtectedRoute from "../guards/ProtectedRoute";
import AuthLayout from "../layouts/AuthLayout";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AuthLayout>
                <QuotationList />
              </AuthLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <AuthLayout>
                <CreateQuotation />
              </AuthLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute>
              <AuthLayout> 
                <EditQuotation />
              </AuthLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/items"
          element={
            <ProtectedRoute>
              <AuthLayout>
                <SavedItems />
              </AuthLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AuthLayout>
                <Settings />
              </AuthLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/view/:id"
          element={
            <ProtectedRoute>
              <AuthLayout> 
                <ViewQuotation />
              </AuthLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;