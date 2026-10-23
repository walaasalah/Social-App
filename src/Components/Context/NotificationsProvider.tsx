import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { TokenContext } from "./TokenContext";
import { GetUnreadCount } from "../../Services/Notifications.service";

import { NotificationsContext } from "./NotificationsContext.tsx";

export default function NotificationsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const token = useContext(TokenContext)?.Token;
  const [count, setCount] = useState(0);
  const generation = useRef(0);
  const refreshCount = useCallback(async () => {
    if (!token) return;
    const request = ++generation.current;
    try {
      const unread = await GetUnreadCount();
      if (request === generation.current) setCount(unread);
    } catch {
      /* Keep the last count when background refresh fails. */
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const requests = generation;
    const initialRequest = ++requests.current;
    let active = true;
    GetUnreadCount()
      .then((value) => {
        if (active && initialRequest === requests.current) setCount(value);
      })
      .catch(() => {});
    const timer = window.setInterval(() => {
      void refreshCount();
    }, 30000);
    const onFocus = () => {
      void refreshCount();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      active = false;
      requests.current++;
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [token, refreshCount]);

  return (
    <NotificationsContext.Provider
      value={{
        unreadCount: token ? count : 0,
        refreshCount,
        decreaseCount: () => {
          generation.current++;
          setCount((value) => Math.max(0, value - 1));
        },
        clearCount: () => {
          generation.current++;
          setCount(0);
        },
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
