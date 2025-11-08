import './App.css';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { useSelector } from 'react-redux';
import type { RootState } from './app/store';
import { SocketContextProvider } from './socket/SocketContext';

// Placeholder components - to be created
const LoginPage = () => <div>Login Page - To be implemented</div>;
const RegisterPage = () => <div>Register Page - To be implemented</div>;
const ChatPage = () => <div>Chat Page - To be implemented</div>;
const NotFoundPage = () => <div>404 - Page Not Found</div>;
const AuthBootstrap = () => null; // Auth initialization component

function App() {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const router = createBrowserRouter([
    {
      path: '/',
      element: accessToken ? (
        <SocketContextProvider>
          <ChatPage />
        </SocketContextProvider>
      ) : (
        <Navigate to="/login" />
      ),
    },
    {
      path: '/login',
      element: accessToken ? <Navigate to="/" /> : <LoginPage />,
    },
    {
      path: '/register',
      element: accessToken ? <Navigate to="/" /> : <RegisterPage />,
    },
    {
      path: '*',
      element: <NotFoundPage />,
    },
  ]);

  return (
    <>
      <AuthBootstrap />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
