"use client";
import React from "react";
import { AuthProvider } from "../context/AuthContext";
import AuthContextDefault from "../context/AuthContext";
import type { AuthContextType } from "../context/AuthContext";

// Keep the `UserProvider` API for backwards compatibility by delegating to AuthProvider
export const UserContext = AuthContextDefault as React.Context<
  AuthContextType | undefined
>;

export default function UserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
