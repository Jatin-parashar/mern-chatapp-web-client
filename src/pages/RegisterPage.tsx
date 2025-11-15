import { useRegisterMutation, useLazyCheckUsernameAvailabilityQuery } from "../features/auth/authApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "../features/auth/authSlice";
import { useLazyGetUserByIdQuery } from "../features/user/userApi";
import { updateUser } from "../features/user/userSlice";
import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Loader2, UserPlus, Mail, Lock, User, MessageSquare, Camera, Sparkles, Check, X, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

interface ValidationErrors {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
}

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [register, { data: userAuthResult, isLoading, isError, error, isSuccess }] = useRegisterMutation();
  const [fetchUserById, { data: userInfoResult, isSuccess: userFetched }] = useLazyGetUserByIdQuery();
  const [checkUsername, { data: usernameCheck }] = useLazyCheckUsernameAvailabilityQuery();

  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Validation functions
  const validateName = (value: string): string | undefined => {
    if (!value.trim()) return "Name is required";
    if (value.length < 3) return "Name must be at least 3 characters";
    if (value.length > 30) return "Name cannot exceed 30 characters";
    if (!/^[A-Za-z\s]+$/.test(value)) return "Name must contain only letters";
    return undefined;
  };

  const validateUsername = (value: string): string | undefined => {
    if (!value.trim()) return "Username is required";
    if (value.length < 3) return "Username must be at least 3 characters";
    if (value.length > 20) return "Username cannot exceed 20 characters";
    if (!/^[a-z0-9._]+$/.test(value)) return "Username can only contain lowercase letters, numbers, dots, and underscores";
    return undefined;
  };

  const validateEmail = (value: string): string | undefined => {
    if (!value.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email format";
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters";
    if (value.length > 20) return "Password cannot exceed 20 characters";
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/.test(value)) {
      return "Password must have uppercase, lowercase, number, and special character";
    }
    return undefined;
  };

  const handleBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    let error: string | undefined;
    switch (field) {
      case 'name':
        error = validateName(value);
        break;
      case 'username':
        error = validateUsername(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
    }
    
    setValidationErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = () => {
    setTouched({ name: true, username: true, email: true, password: true });
    
    const errors: ValidationErrors = {
      name: validateName(name),
      username: validateUsername(username),
      email: validateEmail(email),
      password: validatePassword(password),
    };
    
    setValidationErrors(errors);
    
    if (Object.values(errors).some(e => e !== undefined)) {
      return;
    }
    
    if (usernameStatus !== 'available') {
      return;
    }
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('username', username);
    formData.append('password', password);
    if (status) formData.append('status', status);
    if (selectedFile) formData.append('profilePic', selectedFile);
    
    register(formData);
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert("Please select an image file");
        return;
      }
      
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const debouncedUsernameCheck = useCallback((value: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    const usernameError = validateUsername(value);
    if (usernameError) {
      setUsernameStatus('idle');
      return;
    }

    setUsernameStatus('checking');
    debounceRef.current = setTimeout(() => {
      checkUsername(value);
    }, 500);
  }, [checkUsername]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setUsername(value);
    
    const error = validateUsername(value);
    if (error) {
      setUsernameStatus('idle');
      if (touched.username) {
        setValidationErrors(prev => ({ ...prev, username: error }));
      }
      return;
    }
    
    setValidationErrors(prev => ({ ...prev, username: undefined }));
    debouncedUsernameCheck(value);
  };

  useEffect(() => {
    if (usernameCheck?.data) {
      const available = usernameCheck.data?.available;
      setUsernameStatus(available ? 'available' : 'unavailable');
    }
  }, [usernameCheck]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isSuccess && userAuthResult?.data) {
      const { user, accessToken, refreshToken } = userAuthResult.data;
      
      dispatch(setCredentials({
        email: user.email,
        accessToken,
      }));
      
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
  const isFormValid = usernameStatus === 'available' && 
                      Object.values(validationErrors).every(e => !e);

  const getErrorMessage = (error: any): string => {
    if (error?.data?.message) return error.data.message;
    if (error?.message) return error.message;
    return "Registration failed. Please try again.";
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-linear-to-br from-purple-50 via-white to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-purple-600 via-pink-600 to-indigo-600 relative">
        <div className="absolute inset-0 bg-black/10" />
        
        <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }} />
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-8 xl:px-16 text-white">
          <div className="max-w-lg space-y-6">
            <h2 className="text-3xl xl:text-4xl font-bold leading-tight">
              Start your journey with us today
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Instant Messaging</h3>
                  <p className="text-sm text-white/80">Send messages, photos, and files in real-time</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Video Calls</h3>
                  <p className="text-sm text-white/80">Crystal clear video and audio quality</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Secure & Private</h3>
                  <p className="text-sm text-white/80">End-to-end encryption for all conversations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-start lg:items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto h-screen">
        <div className="w-full max-w-md space-y-3 py-2 lg:py-0">
          {/* Logo for mobile */}
          <div className="lg:hidden flex justify-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                ChatApp
              </span>
            </div>
          </div>

          <div className="space-y-1 text-center lg:text-left">
            <h2 className="text-xl font-bold tracking-tight">Create your account</h2>
            <p className="text-xs text-muted-foreground">
              Join thousands of users connecting worldwide
            </p>
          </div>

          <div className="space-y-4">
            {/* Profile Picture */}
            <div className="flex justify-center py-2">
              <div
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Avatar className="w-16 h-16 border-2 border-white dark:border-slate-800 shadow-lg">
                  <AvatarImage src={profilePreview || undefined} />
                  <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-600 text-white">
                    <User className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePicChange}
                className="hidden"
                disabled={isProcessing}
              />
            </div>

            <div className="space-y-2">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    placeholder="Enter your name"
                    className={`pl-10 h-10 ${touched.name && validationErrors.name ? 'border-red-500' : ''}`}
                    onBlur={(e) => handleBlur('name', e.target.value)}
                    disabled={isProcessing}
                  />
                </div>
                {touched.name && validationErrors.name && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                    <AlertCircle className="w-3 h-3" />
                    <span>{validationErrors.name}</span>
                  </div>
                )}
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="username"
                    value={username}
                    onChange={handleUsernameChange}
                    onBlur={(e) => handleBlur('username', e.target.value)}
                    type="text"
                    placeholder="Choose a username"
                    className={`pl-10 pr-10 h-10 ${
                      usernameStatus === 'available' ? 'border-green-500 focus-visible:ring-green-500' :
                      usernameStatus === 'unavailable' || (touched.username && validationErrors.username) ? 'border-red-500 focus-visible:ring-red-500' : ''
                    }`}
                    disabled={isProcessing}
                  />
                  {usernameStatus === 'checking' && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                  {usernameStatus === 'available' && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                  )}
                  {usernameStatus === 'unavailable' && (
                    <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                  )}
                </div>
                {touched.username && validationErrors.username && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                    <AlertCircle className="w-3 h-3" />
                    <span>{validationErrors.username}</span>
                  </div>
                )}
                {username.length > 2 && !validationErrors.username && (
                  <div className="flex items-center gap-2 text-xs">
                    {usernameStatus === 'checking' && (
                      <span className="text-muted-foreground">Checking availability...</span>
                    )}
                    {usernameStatus === 'available' && (
                      <>
                        <Check className="w-3 h-3 text-green-500" />
                        <span className="text-green-600 dark:text-green-400">Username is available!</span>
                      </>
                    )}
                    {usernameStatus === 'unavailable' && (
                      <>
                        <X className="w-3 h-3 text-red-500" />
                        <span className="text-red-600 dark:text-red-400">Username is already taken</span>
                      </>
                    )}
                  </div>
                )}
              </div>

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
                    className={`pl-10 h-10 ${touched.email && validationErrors.email ? 'border-red-500' : ''}`}
                    onBlur={(e) => handleBlur('email', e.target.value)}
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
                <Label htmlFor="password" className="text-sm">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="Create a strong password"
                    className={`pl-10 h-10 ${touched.password && validationErrors.password ? 'border-red-500' : ''}`}
                    onBlur={(e) => handleBlur('password', e.target.value)}
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

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm">
                  Status <span className="text-xs text-muted-foreground">(optional)</span>
                </Label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    type="text"
                    placeholder="What's on your mind?"
                    className="pl-10 h-10"
                    disabled={isProcessing}
                  />
                </div>
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
              className="w-full h-8 text-sm bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
              disabled={isProcessing || !isFormValid}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </>
              )}
            </Button>

            <div className="text-center text-sm pt-1">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-500"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}