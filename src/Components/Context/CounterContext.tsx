import React, { createContext, useState, type ReactNode } from "react";
import { CounterContext } from "./CounterContext";

export default function CounterContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [Counter, setCounter] = useState(0);
  return (
    <>
      <CounterContext.Provider value={{ Counter, setCounter }}>
        {children}
      </CounterContext.Provider>
    </>
  );
}
