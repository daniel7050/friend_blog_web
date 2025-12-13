"use client";

import { useGlobalErrorHandler } from "../hooks/useGlobalErrorHandler";

export default function GlobalErrorHandlerWrapper() {
  useGlobalErrorHandler();
  return null;
}
