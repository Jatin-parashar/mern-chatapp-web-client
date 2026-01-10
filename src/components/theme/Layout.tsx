import { Outlet } from "react-router";
import { PageThemeToggle } from "./PageThemeToggle";
import AuthBootstrap from "../../pages/AuthBootstrap";

export function Layout() {
  return (
    <>
      <AuthBootstrap />
      <PageThemeToggle />
      <Outlet />
    </>
  );
}