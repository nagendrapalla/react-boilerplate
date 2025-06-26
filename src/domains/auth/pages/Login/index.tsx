import { LockIcon, UserIcon, Loader2, XIcon } from "lucide-react";
import { z } from "zod";
import { useForm, type FieldApi } from "@tanstack/react-form";
import "./styles.css";
import { Button, Card, CardContent, CardHeader, Input } from "ti-react-template/components";
import { useNavigate } from "@tanstack/react-router";
import { getAxios, postAxios } from "@/shared/api/apiClient";
import { redirectByRole } from "@/shared/utlis/routeUtils";
import { useSetAuth, useSetName, useSetRole, useSetUserName } from "@/domains/auth/store/authAtom";
import { setItem } from "@/shared/utlis/localStorage";
import { useState } from "react";   
import { toast } from "react-toastify";
// import CryptoJS from "crypto-js";
;

type LoginFormData = {
  username: string;
  password: string;
  rememberMe?: boolean;
};

function FieldInfo<TFieldName extends keyof LoginFormData>({
  field,
  showErrors,
}: Readonly<{
  field: FieldApi<LoginFormData, TFieldName>;
  showErrors: boolean;
}>): JSX.Element {
  return (
    <>
      {showErrors && field.state.meta.errors?.length > 0 && (
        <span className="field-error">{field.state.meta.errors.join(", ")}</span>
      )}
    </>
  );
}

const loginFormData = {
  title: "Please login to your account",
  fields: [
    {
      id: "username" as const,
      label: "HCTRA ID",
      icon: <UserIcon className="field-icon" />,
      type: "text",
    },
    {
      id: "password" as const,
      label: "Password",
      icon: <LockIcon className="field-icon" />,
      type: "password",
    },
  ],
};

const loginSchema = z.object({
  username: z.string().min(1, "HCTRA ID is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

/**
 * Fetches user details and stores them in local storage
 * Returns a boolean indicating whether the operation was successful
 */
const fetchAndStoreUserDetails = async (setName: (name: string) => void): Promise<boolean> => {
  
  try {
    const userDetailsResponse = await getAxios("/api/v0/user/userdetails");
    const userDetails = userDetailsResponse.data;
    
    // Store user details in local storage
    setItem("userId", userDetails.id);
    setItem("name", userDetails.fullName);
     
    // Update the name atom state
    setName(userDetails.fullName);
    
    return true;
  } catch (error) {
    console.error("Failed to fetch user details:", error);
    // Don't break the page - just log the error
    return false;
  }
};

export function Login(): JSX.Element {
  const navigate = useNavigate();
  const setAuth = useSetAuth();
  const setRole = useSetRole();
  const setName = useSetName();
  const setUserName = useSetUserName();
  const [showErrors, setShowErrors] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  // const symmetricKey = import.meta.env.VITE_SECRET_KEY as string;
  const form = useForm<LoginFormData>({
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
    onSubmit: async ({ value }) => {
      try {
        setIsLoading(true);
        setAuthError(null);

        // Use environment variable from Maven profiles to determine which authentication method to use
        // This is set in pom.xml for each profile (tidev, tiawsdev, tiawsuat, hctdev, hctuat)
        const isProductionEnv = process.env.VITE_USE_LDAP === 'true';
        
        let response;
        
        if (isProductionEnv) {
          // HCTRA LDAP Authentication
          const formData = new FormData();
          formData.append("j_username", value.username);
          formData.append("j_password", value.password);
          
          response = await postAxios(
            "/api/j_security_check",
            formData,
            {withCredentials: true}
          );
        } else {
          // Local Authentication
          response = await postAxios(
            "/api/authenticate",
            {
              username: value.username,
              password: value.password,
            }
          );
        }

        if (response.status === 200) {

          // setItem("name",response.data.name);
          setItem("userName",response.data.username);
          
          // Fetch and store user details, but don't block flow if it fails
          await fetchAndStoreUserDetails(setName);
          
          setAuth(true);
          
          // Normalize role to ensure it's always ROLE_Student or ROLE_Instructor
          const role = response.data.roles[0] === "student" ? "ROLE_Student" : response.data.roles[0];
          setRole(role);
          setItem("role", role);
          
          // setName(response.data.name);
          setUserName(response.data.username);
          toast.success("Login successful");
          const redirectTo = redirectByRole(role);
          navigate({ to: redirectTo });
        } else if (response.status === 401) {
          setAuthError("Invalid username or password");
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        toast.error(error as string);
      } finally {
        setIsLoading(false);
      }
    },
    validators: {
      onChange: loginSchema
    },
  });

  return (
    <div className="login-container">
      <div className="login-background-wrapper">
        <div className="login-background">
          <div className="login-logo-wrapper">
            <img
              className="login-logo"
              alt="Hctra emblem"
              src="/training/images/hctra-emblem.svg"
            />
            <span className="login-title">CSR</span>
          </div>
        </div>
        <div className="login-card-wrapper">
          <Card className="login-card">
            <CardHeader className="login-card-header">
              <h2 className="login-card-title">{loginFormData.title}</h2>
            </CardHeader>
            <div className="login-card-divider" />
            <CardContent className="login-card-content">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowErrors(true);
                  const errors = Object.values(form.state.errors).filter(Boolean);
                  if (errors.length === 0) {
                    void form.handleSubmit();
                  }
                }}
                className="login-form"
              >
                {authError && (
                  <div className="error-card">
                    <div className="error-card-content">
                      <span className="error-message">{authError}</span>
                      <button 
                        type="button"
                        className="error-close-button"
                        onClick={() => setAuthError(null)}
                        aria-label="Close error message"
                      >
                        <XIcon size={16} />
                      </button>
                    </div>
                  </div>
                )}
                {loginFormData.fields.map((field) => (
                  <form.Field
                    key={field.id}
                    name={field.id}
                    children={(fieldApi) => (
                      <div className="field-wrapper">
                        <div className="field-label-wrapper">
                          <div className="field-icon">{field.icon}</div>
                          <label className="field-label">
                            {field.label}
                          </label>
                        </div>
                        <div className="field-wrapper">
                          <Input
                            type={field.type}
                            id={field.id}
                            name={field.id}
                            value={fieldApi.state.value}
                            onBlur={fieldApi.handleBlur}
                            onChange={(e) =>
                              fieldApi.handleChange(e.target.value)
                            }
                          />
                        </div>
                        <FieldInfo field={fieldApi} showErrors={showErrors} />
                      </div>
                    )}
                  />
                ))}
                {/* <form.Field
                  name="rememberMe"
                  children={(fieldApi) => (
                    <div className="remember-me-wrapper">
                      <Checkbox
                        id="rememberMe"
                        checked={fieldApi.state.value}
                        onCheckedChange={(checked) =>
                          fieldApi.handleChange(!!checked)
                        }
                      />
                      <label htmlFor="rememberMe">Remember me</label>
                    </div>
                  )}
                /> */}
                <Button
                  type="submit"
                  className="login-button mt-5"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
