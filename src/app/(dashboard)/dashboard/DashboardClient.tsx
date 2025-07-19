"use client";
import { useQuery } from "@tanstack/react-query";
import authService from "@/services/authServices";

const DashboardClient = () => {
  const { isLoading, isError } = useQuery({
    queryKey: ["userData"],
    queryFn: () => authService.getUser(),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <div>Loading user data...</div>;
  if (isError) return <div>Error loading user data.</div>;

  return <div>DashboardClient</div>;
};

export default DashboardClient;
