import NotificationsProvider from "./Components/Context/NotificationsProvider";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import TokenContextProvider from "./Components/Context/TokenContext.tsx";
import UserContextProvider from "./Components/Context/UserContext.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TokenContextProvider>
      <QueryClientProvider client={queryClient}>
        <UserContextProvider>
          <NotificationsProvider>
            <App />
          </NotificationsProvider>
        </UserContextProvider>
      </QueryClientProvider>
    </TokenContextProvider>
  </StrictMode>,
);
