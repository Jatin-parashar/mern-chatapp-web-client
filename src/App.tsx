import "./App.css";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { useSelector } from "react-redux";
import { useEffect, useMemo, lazy, Suspense } from "react";
import type { RootState } from "./app/store";
import { SocketContextProvider } from "./socket/SocketContext";
import { ThemeProvider } from "./components/theme/theme-provider";
import { Layout } from "./components/theme/Layout";
import { Toaster } from "./components/ui/sonner";
import { requestNotificationPermission } from "./utils/notifications";
import PageLoader from "./components/layout/PageLoader";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));


function App() {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    if (accessToken) {
      requestNotificationPermission();
    }
  }, [accessToken]);

  const router = useMemo(() => createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          index: true,
          element: accessToken ? (
            <Suspense fallback={<PageLoader />}>
              <SocketContextProvider>
                <ChatPage />
              </SocketContextProvider>
            </Suspense>
          ) : (
            <Navigate to="/login" />
          ),
        },
        {
          path: "login",
          element: accessToken ? <Navigate to="/" /> : (
            <Suspense fallback={<PageLoader />}>
              <LoginPage />
            </Suspense>
          ),
        },
        {
          path: "register",
          element: accessToken ? <Navigate to="/" /> : (
            <Suspense fallback={<PageLoader />}>
              <RegisterPage />
            </Suspense>
          ),
        },
        {
          path: "*",
          element: (
            <Suspense fallback={<PageLoader />}>
              <NotFoundPage />
            </Suspense>
          ),
        },
      ],
    },
  ]), [accessToken]);

  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster position="bottom-left" />
    </ThemeProvider>
  );
}

export default App;
