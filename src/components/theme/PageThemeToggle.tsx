import { useLocation } from "react-router";
import { ModeToggle } from "./mode-toggle";

export function PageThemeToggle() {
  const location = useLocation();
  
  if (location.pathname === "/") {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <ModeToggle />
    </div>
  );
}