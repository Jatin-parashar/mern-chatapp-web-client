import "./App.css";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "./app/store";
import { SocketContextProvider } from "./socket/SocketContext";
import {
  AuthBootstrap,
  LoginPage,
  RegisterPage,
  ChatPage,
  NotFoundPage,
} from "./pages";
import { ThemeProvider } from "./components/theme/theme-provider";
import { Layout } from "./components/theme/Layout";


function App() {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          index: true,
          element: accessToken ? (
            <SocketContextProvider>
              <ChatPage />
            </SocketContextProvider>
          ) : (
            <Navigate to="/login" />
          ),
        },
        {
          path: "login",
          element: accessToken ? <Navigate to="/" /> : <LoginPage />,
        },
        {
          path: "register",
          element: accessToken ? <Navigate to="/" /> : <RegisterPage />,
        },
        {
          path: "*",
          element: <NotFoundPage />,
        },
      ],
    },
  ]);

  return (
    <ThemeProvider>
      <AuthBootstrap />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
