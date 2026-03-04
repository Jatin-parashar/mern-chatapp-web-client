import { Outlet } from "react-router";
import { PageThemeToggle } from "./PageThemeToggle";

export function Layout() {
  return (
    <>
      <PageThemeToggle />
      <Outlet />
    </>
  );
}