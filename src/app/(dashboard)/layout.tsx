import React from "react";
import ClientGuard from "./ClientGuard";
interface DashboardLayoutProps {
  children: React.ReactNode;
}
const DashboardLayout = ({ children }:DashboardLayoutProps) => {
  
  return <ClientGuard>{children}</ClientGuard>;
};

export default DashboardLayout;
