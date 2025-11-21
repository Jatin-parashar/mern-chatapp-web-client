import { useLoginMutation } from "../features/auth/authApi";
import { useDispatch } from "react-redux";
import { setCredentials } from "../features/auth/authSlice";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useLazyGetUserByIdQuery } from "../features/user/userApi";
import { updateUser } from "../features/user/userSlice";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Loader2, LogIn, Mail, Lock, Sparkles } from "lucide-react";
import { authToasts, showToast } from "../utils/toast";
import type { AuthData } from "@/types";
import { appTitle } from "@/utils/constants";
import { Helmet } from "react-helmet";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const [fetchUserById] = useLazyGetUserByIdQuery();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await login({ email: email.trim(), password }).unwrap();
      const { user, accessToken, refreshToken } = result.data as AuthData;

      dispatch(setCredentials({ email: user.email, accessToken }));
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

      const userResult = await fetchUserById(user._id).unwrap();
      if (userResult.data?.user) {
        dispatch(updateUser(userResult.data.user));
        authToasts.loginSuccess(userResult.data.user.name);
        navigate("/");
      }
    } catch (error: any) {
      showToast.error(error?.data?.message || "Login failed");
    }
  };



  const isProcessing = isLoading;

  return (
    <>
      <Helmet>
        <title>Login - {appTitle}</title>
        <meta name="description" content="Sign in to your account and start chatting with friends" />
        <link rel="canonical" href={`${window.location.origin}/login`} />
        <meta property="og:title" content={`Login - ${appTitle}`} />
        <meta property="og:description" content="Sign in to your account and start chatting with friends" />
        <meta property="og:url" content={`${window.location.origin}/login`} />
      </Helmet>
      <div className="h-screen w-full flex overflow-hidden bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600 relative">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "700ms" }}
        />

        <div className="relative z-10 flex flex-col justify-center items-center w-full px-8 xl:px-16 text-white">
          <div className="max-w-lg space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Sparkles className="w-7 h-7" />
              </div>
              <h1 className="text-3xl xl:text-4xl font-bold">{appTitle}</h1>
            </div>

            <h2 className="text-3xl xl:text-4xl font-bold leading-tight">
              Welcome back to your conversations
            </h2>

            <p className="text-base xl:text-lg text-white/90">
              Sign in to continue chatting with your friends and stay connected.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto h-screen">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {appTitle}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold">Welcome back</h2>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10 h-11"
                  required
                  disabled={isProcessing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 h-11"
                  minLength={8}
                  required
                  disabled={isProcessing}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
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
          </form>

          <p className="text-center text-sm pt-2">
            <span className="text-muted-foreground">
              Don't have an account?{" "}
            </span>
            <Link
              to="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
