import { atom, useAtomValue, useSetAtom } from "jotai";
import { z } from "zod";
import { getItem, setItem } from "@/shared/utlis/localStorage";
import { getCookie } from "@/shared/utlis/cookieUtils";

// Define role schema with Zod
export const roleSchema = z.enum(["ROLE_Student", "ROLE_Instructor"]).readonly();
export type Role = z.infer<typeof roleSchema>;

// User schema for API response
export const userSchema = z.object({
  role: roleSchema,
  name: z.string(),
});

export type User = z.infer<typeof userSchema>;

// Parse role from localStorage with validation
const getInitialRole = (): Role | null => {
  const storedRole = getItem("role");
  if (!storedRole) return null;
  try {
    return roleSchema.parse(storedRole);
  } catch {
    return null;
  }
};

// Simple auth check
export const hasAccessToken = () => {
  return getCookie("access_token") !== null;
};

// Initialize auth state from both token and stored data
const getInitialAuthState = () => {
  const hasToken = hasAccessToken() ;
  const hasStoredRole = !!getItem("role");
  const hasStoredName = !!getItem("name");
  const hasStoredUserName = !!getItem("userName");
  return hasToken && hasStoredRole && hasStoredName && hasStoredUserName;
};

// Auth atom
const authAtom = atom(getInitialAuthState());

// Role atom with initial value from localStorage
const roleAtom = atom<Role | null>(getInitialRole());

// Name atom with initial value from localStorage
const nameAtom = atom<string>((getItem("name") as string) ?? "");

const userNameAtom=atom<string>((getItem("userName") as string) ?? "")

// Auth hooks
export const useIsAuthenticated = () => useAtomValue(authAtom);
export const useSetAuth = () => useSetAtom(authAtom);

// Logout function
export const useLogout = () => {
  const setAuth = useSetAtom(authAtom);
  const setRole = useSetAtom(roleAtom);
  const setName = useSetAtom(nameAtom);
  const setUserName = useSetAtom(userNameAtom);
  
  return () => {
    try {
      console.log('Logging out user...');
      
      // Clear auth cookie
      document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      console.log('Auth cookie cleared');
      
      // Get all localStorage keys
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          keys.push(key);
        }
      }
      
      // Remove each item individually
      keys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`Removed localStorage item: ${key}`);
      });
      
      console.log(`Cleared ${keys.length} items from localStorage`);
      
      // Reset atom states
      setAuth(false);
      setRole(null);
      setName("");
      setUserName("");
      console.log('Atom states reset');
      
      // Clear React Query cache
      const queryClient = (window as any).__REACT_QUERY_GLOBAL_CLIENT__;
      if (queryClient && typeof queryClient.clear === 'function') {
        queryClient.clear();
        console.log('React Query cache cleared');
      }
      
      console.log('Logout successful');
      return { success: true };
    } catch (error) {
      console.error("Error during logout:", error);
      return { success: false, error };
    }
  };
};

// Login function
export const useLogin = () => {
  const setAuth = useSetAuth();
  return () => setAuth(true);
};

// Readonly hooks for consuming auth state
export const useRole = () => useAtomValue(roleAtom);
export const useName = () => useAtomValue(nameAtom);
export const useUserName=()=>useAtomValue(userNameAtom);

export const useSetRole = () => {
  const setRole = useSetAtom(roleAtom);
  return (role: Role) => {
    setItem("role", role);
    setRole(role);
  };
};

export const useSetName = () => {
  const setName = useSetAtom(nameAtom);
  return (name: string) => {
    setItem("name", name);
    setName(name);
  };
};

export const useSetUserName=()=>{
  const setUserName=useSetAtom(userNameAtom);
  return (userName:string)=>{
    setItem("userName",userName);
    setUserName(userName);
  }
}

// Type-safe auth utilities
export const getRedirectPath = (role: Role): string => {
  return role === "ROLE_Instructor" ? "/training/tutor" : "/training/student";
};

// Global logout function that can be called from anywhere
export const globalLogout = () => {
  try {
    console.log('Global logout initiated...');
    
    // Create a loading element
    const loadingContainer = document.createElement('div');
    loadingContainer.id = 'auth-loading-container';
    loadingContainer.style.position = 'fixed';
    loadingContainer.style.top = '0';
    loadingContainer.style.left = '0';
    loadingContainer.style.width = '100%';
    loadingContainer.style.height = '100%';
    loadingContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    loadingContainer.style.display = 'flex';
    loadingContainer.style.flexDirection = 'column';
    loadingContainer.style.alignItems = 'center';
    loadingContainer.style.justifyContent = 'center';
    loadingContainer.style.zIndex = '9999';
    
    // Add loading spinner
    const spinner = document.createElement('div');
    spinner.style.border = '4px solid rgba(0, 0, 0, 0.1)';
    spinner.style.borderLeft = '4px solid #3b82f6';
    spinner.style.borderRadius = '50%';
    spinner.style.width = '50px';
    spinner.style.height = '50px';
    spinner.style.animation = 'spin 1s linear infinite';
    
    // Add loading text
    const loadingText = document.createElement('p');
    loadingText.textContent = 'Logging out...';
    loadingText.style.marginTop = '16px';
    loadingText.style.fontSize = '16px';
    loadingText.style.fontWeight = '500';
    loadingText.style.color = '#4b5563';
    
    // Add animation style
    const style = document.createElement('style');
    style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
    
    // Append elements
    loadingContainer.appendChild(spinner);
    loadingContainer.appendChild(loadingText);
    document.head.appendChild(style);
    document.body.appendChild(loadingContainer);
    
    // Clear auth cookie
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    console.log('Auth cookie cleared');
    
    // Clear ALL localStorage data
    localStorage.clear();
    console.log('All localStorage data cleared');
    
    // Clear React Query cache if available
    const queryClient = (window as any).__REACT_QUERY_GLOBAL_CLIENT__;
    if (queryClient && typeof queryClient.clear === 'function') {
      queryClient.clear();
      console.log('React Query cache cleared');
    }
    
    console.log('Global logout successful, redirecting to login page...');
    
    // Redirect immediately instead of waiting
    window.location.href = '/training';
  } catch (error) {
    console.error("Error during global logout:", error);
    // Fallback redirect
    window.location.href = '/training';
  }
};
