

"use client";

// import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
//import { toast } from "sonner";
//import { useRouter } from "next/navigation";
import { auth } from "@/utils/firebase/firebaseConfig";
//import authService from "@/services/authServices";
import Image from "next/image";
//import { useRef } from "react";
import AssetsFiles from "@/assets";
import { ApiResponseType } from "@/types/httpTypes";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import authService from "@/services/authServices";
import { toast } from "sonner";

interface GoogleSignInProps {
  mode: "signup" | "signin";
}



const GoogleSignIn = ({ mode }: GoogleSignInProps) => {
//   const router = useRouter();
//   const googleLoginRef = useRef<HTMLDivElement>(null);

//   const handleGoogleLogin = async (firebaseId: string) => {
//     console.log(firebaseId, "This is the firebase");
//     const response = await authService.googleLogin(firebaseId) as ApiResponseType;
//     console.log(response, "This is our response");
//     if (response.status) {
//       toast.success("Google sign-in successful");
//       router.push("/dashboard");
//       return;
//     }

//     toast.error("Error occurred while google sign in");
//   };

 



  // function googleSignIn() {
  //   const provider = new GoogleAuthProvider();
  //   signInWithPopup(auth, provider)
  //     .then((result) => {
  //       // User signed in
  //       const user = result.user;
        
  //       console.log(JSON.stringify(user));

  //     })
  //     .catch((error) => {
  //       console.error(error);
  //     });
  // }


  function googleSignIn() {
    const provider = new GoogleAuthProvider();
    // Optional: Add custom parameters if needed
    // provider.setCustomParameters({
    //   prompt: ‘select_account’
    // });
    signInWithPopup(auth, provider)
      .then(async (result) => {
        // User signed in successfully
        const user = result.user;
        console.log(`Signed in user:`,user);
        const idToken = await user.getIdToken();
        const response = (await authService.googleLogin(
          idToken
        )) as ApiResponseType;
            console.log(response, "This is our response");
            if (response.status) {
              toast.success("Google sign-in successful");
              // router.push("/dashboard");
              return;
            }        console.log(idToken, "This the id token");
        // Do something with the user info (e.g., redirect, update UI)
      })
      .catch((error) => {
        console.error(`Sign-in error:`, error);
      });
  }



  return (
    <>
   
      <button
        type="button"
        className="flex items-center justify-center gap-2 border py-3.5 rounded-[10px] border-[#E6E6E6] hover:bg-gray-50 transition-colors w-full"
        onClick={googleSignIn}
      >
        <Image src={AssetsFiles.GoogleIcon} alt="Google Icon" />
        <span className="text-[#1E1E1E] text-[17px] font-normal">
          {mode === "signup" ? "Sign Up With Google" : "Login With Google"}
        </span>
      </button>


      </>
  );
};

export default GoogleSignIn;