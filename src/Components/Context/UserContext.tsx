import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

import { TokenContext } from "./TokenContext";
import type { UserProfileType } from "../../types/Users.type.ts";
import { GetMyProfile } from "../../Services/Profile.services.ts";

export type UserContextType = {
  UserDetails: UserProfileType | null;
  setUserDetails: Dispatch<SetStateAction<UserProfileType | null>>;
};

export const UserContext = createContext<UserContextType | null>(null);

export default function UserContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [UserDetails, setUserDetails] = useState<UserProfileType | null>(null);

  const tokenContext = useContext(TokenContext);
  const token = tokenContext?.Token;

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setUserDetails(null);
      return;
    }
    async function GetUserProfile() {
      try {
        const { data } = await GetMyProfile();
        if (!cancelled) setUserDetails(data.data.user);
      } catch (error) {
        if (!cancelled) {
          setUserDetails(null);
          console.error(error);
        }
      }
    }
    GetUserProfile();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <UserContext.Provider value={{ UserDetails, setUserDetails }}>
      {children}
    </UserContext.Provider>
  );
}
