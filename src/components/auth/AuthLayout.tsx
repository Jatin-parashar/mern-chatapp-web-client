import { type ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { appTitle } from "../../utils/constants";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  heroTitle: string;
  heroDescription?: string;
  features?: Array<{ title: string; desc: string }>;
}

export const AuthLayout = ({ children, title, subtitle, heroTitle, heroDescription, features }: AuthLayoutProps) => (
  <div className="h-screen w-full flex overflow-hidden bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
    <div className="hidden md:flex md:w-2/5 lg:w-1/2 bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600 relative">
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "700ms" }} />

      <div className="relative z-10 flex flex-col justify-center items-center w-full px-8 xl:px-16 text-white">
        <div className="max-w-lg space-y-6">
          {!features && (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Sparkles className="w-7 h-7" />
              </div>
              <h1 className="text-3xl xl:text-4xl font-bold">{appTitle}</h1>
            </div>
          )}
          <h2 className="text-3xl xl:text-4xl font-bold leading-tight">{heroTitle}</h2>
          {heroDescription && <p className="text-base xl:text-lg text-white/90">{heroDescription}</p>}
          {features && (
            <div className="space-y-4">
              {features.map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
                    <p className="text-sm text-white/80">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

    <div className="w-full md:w-3/5 lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto min-h-screen">
      <div className="w-full max-w-md space-y-6">
        <div className="md:hidden flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{appTitle}</span>
          </div>
        </div>

        <div className="space-y-2 text-center lg:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        {children}
      </div>
    </div>
  </div>
);
