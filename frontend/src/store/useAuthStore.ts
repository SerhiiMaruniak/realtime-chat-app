/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";

import axiosInstance from "../lib/axiosInstance.ts";
import type User from "../lib/schemas/userSchema.ts";
import { useFriendsStore } from "./useFriendsStore.ts";
import { useChatStore } from "./useChatStore.ts";

const BASE_URL = "http://localhost:4411";

interface AuthStore {
  user: User | null;
  socket: Socket | null;
  onlineUsers: string[];
  isSigningUp: boolean;
  isSigningIn: boolean;
  isCheckingAuth: boolean;
  isUpdatingProfile: boolean;
  isForgetingPassword: boolean;
  isResetingPassword: boolean;
  checkAuth: () => Promise<void>;
  signUp: (data: { username: string; email: string; password: string }) => Promise<void>;
  signIn: (data: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: {
    username?: string | undefined;
    profilePic: string | null;
  }) => Promise<void>;
  forgotPassword: (data: { email: string }) => Promise<void>;
  resetPassword: (data: { id: string | null; password: string }) => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  socket: null,
  onlineUsers: [],

  isSigningUp: false,
  isSigningIn: false,
  isCheckingAuth: false,
  isUpdatingProfile: false,
  isForgetingPassword: false,
  isResetingPassword: false,

  checkAuth: async () => {
    set({ isCheckingAuth: true });

    try {
      const response = await axiosInstance.get("/auth/check");
      set({ user: response.data });

      get().connectSocket();
      await useChatStore.getState().fetchUnreadMessages();
    } catch (error: any) {
      set({ user: null });
      console.error(error.message);
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signUp: async (data) => {
    set({ isSigningUp: true });

    try {
      const response = await axiosInstance.post("/auth/signup", data);
      set({ user: response.data });
      toast.success("Signed Up successfully!");

      get().connectSocket();
      await useChatStore.getState().fetchUnreadMessages();
    } catch (error: any) {
      toast.error(error.response.data.error);
      console.error(error);
    } finally {
      set({ isSigningUp: false });
    }
  },

  signIn: async (data) => {
    set({ isSigningIn: true });

    try {
      const response = await axiosInstance.post("/auth/signin", data);
      set({ user: response.data });
      toast.success("Signed In successfully!");

      get().connectSocket();
      await useChatStore.getState().fetchUnreadMessages();
    } catch (error: any) {
      toast.error(error.response.data.error);
      console.error(error);
    } finally {
      set({ isSigningIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ user: null });
      toast.success("Successfully logged out!");

      get().disconnectSocket();
      useChatStore.getState().unsubscribeMessages();
      useChatStore.setState({
        selectedChat: null,
        selectedImage: null,
        messages: null,
        unreadMessages: null,
        contextMenu: null,
        hasMore: true,
        lastId: null,
      });
      localStorage.removeItem("unreadMessages");
    } catch (error: any) {
      toast.error(error.response.data.error);
      console.error(error);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });

    try {
      const response = await axiosInstance.put("/auth/update-profile", data);
      set({ user: response.data });
      toast.success("Successfully updated profile!");
    } catch (error: any) {
      toast.error(error.response.data.error);
      console.error(error);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  forgotPassword: async (data) => {
    set({ isForgetingPassword: true });

    try {
      await axiosInstance.post("/auth/forgot-password", data);
      toast.success("Sent a link successfully!");
    } catch (error: any) {
      toast.error(error.response.data.error);
    } finally {
      set({ isForgetingPassword: false });
    }
  },

  resetPassword: async (data) => {
    set({ isResetingPassword: true });

    try {
      await axiosInstance.post(`/auth/reset-password?id=${data.id}`, {
        password: data.password,
      });
      toast.success("Successfully reseted password");
    } catch (error: any) {
      toast.error(error.response.data.error);
    } finally {
      set({ isResetingPassword: false });
    }
  },

  connectSocket: () => {
    const { user } = get();
    if (!user || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: user._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    socket.on("updateUser", (updatedUser) => {
      set({ user: updatedUser });

      useFriendsStore.getState().updateFriend(updatedUser);
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) {
      get().socket?.disconnect();
    }
  },
}));
