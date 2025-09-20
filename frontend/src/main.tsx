import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import AuthWrapper from "./components/AuthWrapper";
import AppLayout from "./pages/AppLayout";
import WritePage from "./pages/WritePage";
import EntitiesPage from "./pages/EntitiesPage";
import CommitsPage from "./pages/CommitsPage";
import CRUDPage from "./pages/CRUDPage";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ThemeProvider>
        <AuthProvider>
          <AuthWrapper>
            <AppLayout />
          </AuthWrapper>
        </AuthProvider>
      </ThemeProvider>
    ),
    children: [
      { index: true, element: <WritePage /> },
      { path: "entities", element: <EntitiesPage /> },
      { path: "commits", element: <CommitsPage /> },
      { path: "crud", element: <CRUDPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
