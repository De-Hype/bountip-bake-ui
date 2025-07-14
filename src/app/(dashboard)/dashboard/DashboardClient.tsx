"use client";
import { useUserStore } from "@/stores/useUserStore"
import { useEffect } from "react"

const DashboardClient = () => {
    const {fetchUserData}= useUserStore()
    useEffect(() => {
      fetchUserData()
    }, [fetchUserData])
    
  return (
    <div>DashboardClient</div>
  )
}

export default DashboardClient