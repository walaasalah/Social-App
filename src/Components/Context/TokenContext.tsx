import { useState, type ReactNode } from "react";
import { TokenContext } from "./TokenContext";

export default function TokenContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [Token, setToken] = useState<string | null>(
    localStorage.getItem("userToken"),
  );

  return (
    <TokenContext.Provider value={{ Token, setToken }}>
      {children}
    </TokenContext.Provider>
  );
}
