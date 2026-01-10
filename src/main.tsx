import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { persistor, store } from "./app/store.ts";
import { PersistGate } from "redux-persist/integration/react";
import { ErrorBoundary } from "./components/ErrorBoundary";

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </ErrorBoundary>,
)
