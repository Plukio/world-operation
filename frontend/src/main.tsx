import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import AuthWrapper from "./components/AuthWrapper";
import AppLayout from "./pages/AppLayout";
import WritePage from "./pages/WritePage";
import EntitiesPage from "./pages/EntitiesPage";
import CommitsPage from "./pages/CommitsPage";
import FirebaseTestPage from "./pages/FirebaseTestPage";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthProvider>
        <AuthWrapper>
          <AppLayout />
        </AuthWrapper>
      </AuthProvider>
    ),
    children: [
      { index: true, element: <WritePage /> },
      { path: "entities", element: <EntitiesPage /> },
      { path: "commits", element: <CommitsPage /> },
      { path: "firebase-test", element: <FirebaseTestPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
