import { createContext } from "react";
import type { Dispatch, SetStateAction } from "react";

export type HomeContextValue = "Chat" | "All_Friends" | "Requests" | "Add_Friends";

interface HomeContextProps {
  setHomeContextValue: Dispatch<SetStateAction<HomeContextValue>>;
  value: HomeContextValue;
}

export const HomeContext = createContext<HomeContextProps | null>(null);
