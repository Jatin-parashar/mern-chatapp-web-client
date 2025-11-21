import { useRegisterMutation, useLazyCheckUsernameAvailabilityQuery } from "../features/auth/authApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "../features/auth/authSlice";
import { useLazyGetUserByIdQuery } from "../features/user/userApi";
import { updateUser } from "../features/user/userSlice";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Loader2, UserPlus, Mail, Lock, User, MessageSquare, Camera, Sparkles, Check, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { authToasts, showToast } from "../utils/toast";
import type { AuthData } from "@/types";
import { appTitle } from "@/utils/constants";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const [fetchUserById] = useLazyGetUserByIdQuery();
  const [checkUsername, { data: usernameCheck }] = useLazyCheckUsernameAvailabilityQuery();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleUsernameChange = (value: string) => {
    const lowercase = value.toLowerCase();
    setUsername(lowercase);
    
    if (lowercase.length < 3) {
      setUsernameStatus('idle');
      return;
    }
    
    setUsernameStatus('checking');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => checkUsername(lowercase), 500);
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      showToast.error("File size must be less than 5MB");
      e.target.value = '';
      return;
    }
    
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setProfilePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (usernameStatus !== 'available') {
      showToast.error("Please choose an available username");
      return;
    }
    
    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('email', email.trim());
    formData.append('username', username.trim());
    formData.append('password', password);
    if (status.trim()) formData.append('status', status.trim());
    if (selectedFile) formData.append('profilePic', selectedFile);
    
    try {
      const result = await register(formData).unwrap();
      const { user, accessToken, refreshToken } = result.data as AuthData;
      
      dispatch(setCredentials({ email: user.email, accessToken }));
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      
      const userResult = await fetchUserById(user._id).unwrap();
      if (userResult.data?.user) {
        dispatch(updateUser(userResult.data.user));
        authToasts.registerSuccess(userResult.data.user.name);
        navigate("/");
      }
    } catch (error: any) {
      showToast.error(error?.data?.message || "Registration failed");
    }
  };

  useEffect(() => {
    if (usernameCheck?.data?.available !== undefined) {
      setUsernameStatus(usernameCheck.data.available ? 'available' : 'unavailable');
    }
  }, [usernameCheck]);



  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const isProcessing = isLoading;

  return (
    <div className="h-screen w-full flex overflow-hidden bg-linear-to-br from-purple-50 via-white to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
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
              {[
                { title: "Instant Messaging", desc: "Send messages, photos, and files in real-time" },
                { title: "Video Calls", desc: "Crystal clear video and audio quality" },
                { title: "Secure & Private", desc: "End-to-end encryption for all conversations" },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                    <p className="text-sm text-white/80">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-start lg:items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto h-screen">
        <div className="w-full max-w-md space-y-4 py-4 lg:py-0">
          <div className="lg:hidden flex justify-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {appTitle}
              </span>
            </div>
          </div>

          <div className="space-y-1 text-center lg:text-left">
            <h2 className="text-2xl font-bold">Create your account</h2>
            <p className="text-sm text-muted-foreground">Join thousands of users connecting worldwide</p>
          </div>

          <div className="flex justify-center py-2">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar className="w-20 h-20 border-2 border-white dark:border-slate-800 shadow-lg">
                <AvatarImage src={profilePreview || undefined} />
                <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-600 text-white">
                  <User className="w-8 h-8" />
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
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleProfilePicChange}
              className="hidden"
              disabled={isProcessing}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="pl-10 h-10"
                  minLength={3}
                  maxLength={30}
                  pattern="[A-Za-z\s]+"
                  required
                  disabled={isProcessing}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="Choose a username"
                  className={`pl-10 pr-10 h-10 ${
                    usernameStatus === 'available' ? 'border-green-500' :
                    usernameStatus === 'unavailable' ? 'border-red-500' : ''
                  }`}
                  minLength={3}
                  maxLength={20}
                  pattern="[a-z0-9._]+"
                  required
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
              {username.length > 2 && (
                <p className="text-xs flex items-center gap-1.5">
                  {usernameStatus === 'checking' && <span className="text-muted-foreground">Checking...</span>}
                  {usernameStatus === 'available' && (
                    <span className="text-green-600 dark:text-green-400">Available!</span>
                  )}
                  {usernameStatus === 'unavailable' && (
                    <span className="text-red-600 dark:text-red-400">Username taken</span>
                  )}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10 h-10"
                  required
                  disabled={isProcessing}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="pl-10 h-10"
                  minLength={8}
                  maxLength={20}
                  pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+"
                  title="Must include uppercase, lowercase, number, and special character"
                  required
                  disabled={isProcessing}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">
                Status <span className="text-xs text-muted-foreground">(optional)</span>
              </Label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  placeholder="What's on your mind?"
                  className="pl-10 h-10"
                  disabled={isProcessing}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-10 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              disabled={isProcessing || usernameStatus !== 'available'}
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
          </form>

          <p className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
