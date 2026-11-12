import { createContext, useContext } from "react";

/** Toasts: const toast = useToast(); toast.success("Saved"); toast.error(message); */
export const ToastContext = createContext(null);
export const useToast = () => {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used inside <ToastProvider>");
  return value;
};

/** The signed-in administrator and a sign-out action. */
export const AuthContext = createContext(null);
export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside the admin shell");
  return value;
};

/**
 * The element modal layers render into. It sits inside the console root (so the console's scoped styles apply)
 * but outside the inert-able page frame (so a drawer stays interactive while everything behind it is inert).
 */
export const OverlayContext = createContext(null);
export const useOverlayRoot = () => useContext(OverlayContext);
