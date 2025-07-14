import {
  SignupData,
  ForgotPasswordData,
  PinLoginData,
  SigninData,
  VerifyEmailData,
  ResetPasswordData,
} from "@/types/authTypes";
import { HttpService } from "./httpService";
import { COOKIE_NAMES, getCookie } from "@/utils/cookiesUtils";

class AuthService {
  private request = new HttpService();
  private baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://seal-app-wzqhf.ondigitalocean.app/api/v1";

  async signup(data: SignupData) {
    return this.request.post("/auth/signup", data);
  }

  async verifyEmail({ email, otp }: VerifyEmailData) {
    return this.request.post("/auth/verify", { email, otp });
  }

  async signin(data: SigninData) {
    return this.request.post("/auth/login", {
      email: data.email,
      passCode: data.password,
      mode: "password",
    });
  }

  async signInViaPin(data: PinLoginData) {
    const cookie = getCookie<{ email: string }>(
      COOKIE_NAMES.BOUNTIP_LOGIN_USER
    );
    const email = cookie?.email;
    return this.request.post("/auth/login", {
      email: email,
      passCode: data.pin,
      mode: "pin",
    });
  }

  async pinLogin(data: PinLoginData) {
    return this.request.post(
      "/auth/set-pin",
      { pin: data.pin },
      COOKIE_NAMES.BOUNTIP_REGISTERED_USERS
    );
  }

  async forgotPassword(data: ForgotPasswordData) {
    return this.request.post("/auth/forgot-password", data);
  }

  async resetPassword(data: ResetPasswordData) {
    return this.request.post("/auth/reset-password", {
      otp: data.token,
      email: data.email,
      newPassword: data.password,
    });
  }

  async googleLogin (firebaseUserId:string){
    return this.request.post("/auth/google-login", { idToken:firebaseUserId });
  }

  async getUser (){
    return this.request.get("/auth", COOKIE_NAMES.BOUNTIP_LOGIN_USER_TOKENS)
  }
 
}

const authService = new AuthService();
export default authService;