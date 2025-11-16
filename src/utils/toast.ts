import { toast } from "sonner";

export const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, { description });
  },
  
  error: (message: string, description?: string) => {
    toast.error(message, { description });
  },
  
  info: (message: string, description?: string) => {
    toast.info(message, { description });
  },
  
  warning: (message: string, description?: string) => {
    toast.warning(message, { description });
  },
  
  loading: (message: string) => {
    return toast.loading(message);
  },
  
  dismiss: (toastId: string | number) => {
    toast.dismiss(toastId);
  },
};

export const authToasts = {
  loginSuccess: (name: string) => 
    showToast.success("Welcome back!", `Logged in as ${name}`),
  
  loginError: (error?: string) => 
    showToast.error("Login failed", error || "Please check your credentials"),
  
  registerSuccess: (name: string) => 
    showToast.success("Account created!", `Welcome ${name}`),
  
  registerError: (error?: string) => 
    showToast.error("Registration failed", error || "Please try again"),
  
  logoutSuccess: () => 
    showToast.success("Logged out", "See you soon!"),
  
  sessionExpired: () => 
    showToast.warning("Session expired", "Please login again"),
};

export const validationToasts = {
  invalidFile: (reason: string) => 
    showToast.error("Invalid file", reason),
  
  formError: (message: string) => 
    showToast.error("Form validation failed", message),
};