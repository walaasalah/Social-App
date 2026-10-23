import { createContext } from "react";
export const NotificationsContext = createContext({
  unreadCount: 0,
  refreshCount: async () => {},
  decreaseCount: () => {},
  clearCount: () => {},
});
