import { createContext, type Dispatch, type SetStateAction } from "react";

type CounterContextType = {
  Counter: number;
  setCounter: Dispatch<SetStateAction<number>>;
};

export const CounterContext = createContext<CounterContextType | null>(null);
