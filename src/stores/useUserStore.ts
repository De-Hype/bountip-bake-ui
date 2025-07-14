import authService from "@/services/authServices";
import { UserType } from "@/types/userTypes";
import { create } from "zustand";

type GetUserResponse = {
  status: boolean;
  data: { user: UserType };
  message?: string;
};


type UserStore = {
  user: UserType | null;
  loading: boolean;
  error: string | null;
  fetchUserData: () => Promise<void>;
};

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  loading: false,
  error: null,
  fetchUserData: async () => {
    set({ loading: true, error: null });

    try {
      const res = await authService.getUser() as GetUserResponse;

      console.log(res, "This is the logged-in user");

      if (res?.status && res?.data?.user) {
        set({
          user: res.data.user,
          loading: false,
        });
      } else {
        set({
          loading: false,
          error: res?.message || "Unknown error occurred",
        });
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      set({
        loading: false,
        error: "Failed to fetch user data",
      });
    }
  },
}));
