"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { COOKIE_NAMES, getCookie } from "@/utils/cookiesUtils";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // const token = getCookie<{
    //   accessToken: string;
    //   refreshToken: string;
    // }>("bountipLoginUserTokens");
    const token = getCookie<{
      accessToken: string;
      refreshToken: string;
    }>(COOKIE_NAMES.BOUNTIP_LOGIN_USER_TOKENS);
    const isNotOnboarded = getCookie(COOKIE_NAMES.BOUNTIP_REGISTERED_USERS)

    if (token?.accessToken) {
      router.push("/dashboard");
    } else if(isNotOnboarded){
      router.push("/onboarding")
    }
    
    else {
      router.push("/auth?signin");
    }
  }, [router]);

  return null; // Nothing to render
}
