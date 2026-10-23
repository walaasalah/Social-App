import { useContext, type ReactNode } from "react";
import { Navigate } from "react-router";
import { TokenContext } from "../Context/TokenContext";

export default function AuthProtectedRoute({
  children,
}: {
  children: ReactNode;
}) {
  const token = useContext(TokenContext)?.Token;
  return token ? <Navigate to="/" replace /> : children;
}
