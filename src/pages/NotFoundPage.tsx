import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { appTitle } from "@/utils/constants";
import { Helmet } from "react-helmet";

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | {appTitle}</title>
        <meta name="description" content="The page you're looking for doesn't exist" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-violet-950 dark:to-slate-950 overflow-hidden relative p-4 sm:p-6">
      {/* Animated background elements */}
      <div className="absolute top-10 sm:top-20 left-10 sm:left-20 w-48 sm:w-72 h-48 sm:h-72 bg-purple-300/30 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 sm:bottom-20 right-10 sm:right-20 w-48 sm:w-72 h-48 sm:h-72 bg-indigo-300/30 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '700ms' }} />
      
      <div className="relative z-10 w-full max-w-2xl mx-auto text-center">
        <div className="space-y-4 sm:space-y-6">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-linear-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {appTitle}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              404
            </h1>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              Oops! Page Not Found
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto px-4">
              The page you're looking for seems to have wandered off. Let's get you back on track!
            </p>
          </div>

          <div className="flex justify-center pt-2 sm:pt-4 px-4">
            <Button
              size="default"
              className="w-full sm:w-auto bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white h-10 sm:h-11 text-sm sm:text-base"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}