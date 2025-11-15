import { useLoginMutation } from "../features/auth/authApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "../features/auth/authSlice";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useLazyGetUserByIdQuery } from "../features/user/userApi";
import { updateUser } from "../features/user/userSlice";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Loader2, LogIn, Mail, Lock, Sparkles, AlertCircle } from "lucide-react";

interface ValidationErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { data: userAuthResult, isLoading, isError, error, isSuccess }] = useLoginMutation();
  const [fetchUserById, { data: userInfoResult, isSuccess: userFetched }] = useLazyGetUserByIdQuery();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Client-side validation
  const validateEmail = (value: string): string | undefined => {
    if (!value.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email format";
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters";
    return undefined;
  };

  const handleBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    let error: string | undefined;
    if (field === 'email') {
      error = validateEmail(value);
    } else if (field === 'password') {
      error = validatePassword(value);
    }
    
    setValidationErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = () => {
    // Mark all fields as touched
    setTouched({ email: true, password: true });
    
    // Validate all fields
    const errors: ValidationErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    
    setValidationErrors(errors);
    
    // Check if there are any errors
    if (Object.values(errors).some(e => e !== undefined)) {
      return;
    }
    
    login({ email, password });
  };

  useEffect(() => {
    if (isSuccess && userAuthResult?.data) {
      const { user, accessToken, refreshToken } = userAuthResult.data;
      
      dispatch(setCredentials({
        email: user.email,
        accessToken,
      }));
      
      // Store refresh token in localStorage
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      fetchUserById(user._id);
    }
  }, [isSuccess, userAuthResult, dispatch, fetchUserById]);

  useEffect(() => {
    if (userFetched && userInfoResult?.data?.user) {
      dispatch(updateUser(userInfoResult.data.user));
      navigate("/");
    }
  }, [userFetched, userInfoResult, dispatch, navigate]);

  const isProcessing = isLoading || (isSuccess && !userFetched);

  const getErrorMessage = (error: any): string => {
    if (error?.data?.message) return error.data.message;
    if (error?.message) return error.message;
    return "Invalid credentials. Please try again.";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600 relative">
        <div className="absolute inset-0 bg-black/10" />
        
        {/* Animated background elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }} />
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-8 xl:px-16 text-white">
          <div className="max-w-lg space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Sparkles className="w-7 h-7" />
              </div>
              <h1 className="text-3xl xl:text-4xl font-bold">ChatApp</h1>
            </div>
            
            <h2 className="text-3xl xl:text-4xl font-bold leading-tight">
              Connect with your friends in real-time
            </h2>
            
            <p className="text-base xl:text-lg text-white/90">
              Experience seamless communication with crystal-clear video calls, instant messaging, and more.
            </p>
            
            <div className="grid grid-cols-3 gap-6 pt-6">
              <div className="space-y-1">
                <div className="text-2xl xl:text-3xl font-bold">10K+</div>
                <div className="text-xs xl:text-sm text-white/80">Active Users</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl xl:text-3xl font-bold">50K+</div>
                <div className="text-xs xl:text-sm text-white/80">Messages Daily</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl xl:text-3xl font-bold">99.9%</div>
                <div className="text-xs xl:text-sm text-white/80">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto h-screen">
        <div className="w-full max-w-md space-y-6">
          {/* Logo for mobile */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                ChatApp
              </span>
            </div>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="Enter your email"
                    className={`pl-10 h-11 ${touched.email && validationErrors.email ? 'border-red-500' : ''}`}
                    onBlur={(e) => handleBlur('email', e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isProcessing}
                  />
                </div>
                {touched.email && validationErrors.email && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                    <AlertCircle className="w-3 h-3" />
                    <span>{validationErrors.email}</span>
                  </div>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm">Password</Label>
                  <button
                    type="button"
                    className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="Enter your password"
                    className={`pl-10 h-11 ${touched.password && validationErrors.password ? 'border-red-500' : ''}`}
                    onBlur={(e) => handleBlur('password', e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isProcessing}
                  />
                </div>
                {touched.password && validationErrors.password && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                    <AlertCircle className="w-3 h-3" />
                    <span>{validationErrors.password}</span>
                  </div>
                )}
              </div>
            </div>

            {isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {getErrorMessage(error)}
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleSubmit}
              className="w-full h-11 text-sm sm:text-base bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign in
                </>
              )}
            </Button>

            <div className="text-center text-xs sm:text-sm pt-2">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link
                to="/register"
                className="font-semibold text-indigo-600 hover:text-indigo-500"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}