/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import toast from "react-hot-toast";
import AxiosInstance from "../lib/axiosInstance.ts";
import type User from "../lib/schemas/userSchema.ts";
import type messageSchema from "../lib/schemas/messageSchema.ts";
import { useAuthStore } from "./useAuthStore.ts";

interface ChatProps {
  users: User[] | null;
  selectedChat: User | null;
  selectedImage: string | null;
  messages: messageSchema[] | null;
  isGettingUsers: boolean;
  isSendingMessage: boolean;
  isGettingMessages: boolean;
  getUsers: () => Promise<void>;
  selectChat: (data: any) => void;
  closeChat: () => void;
  selectImage: (data: any) => void;
  closeImage: () => void;
  sendMessage: (data: any) => Promise<void>;
  getMessages: (data: any) => Promise<void>;
  deleteMessage: (data: any) => Promise<void>;
  setMessageSeen: (messageId: string) => Promise<void>;
  subscribeMessages: () => void;
  unsubscribeMessages: () => void;
}

export const useChatStore = create<ChatProps>((set, get) => ({
  users: null,
  selectedChat: null,
  selectedImage: null,
  messages: null,
  isGettingUsers: false,
  isGettingMessages: false,
  isSendingMessage: false,

  getUsers: async () => {
    set({ isGettingMessages: true });

    try {
      const response = await AxiosInstance.get("/messages/users");
      set({ users: response.data });
    } catch (error: any) {
      toast.error(error.response.data.error);
      console.error("Error fetching users");
    } finally {
      set({ isGettingMessages: false });
    }
  },

  selectChat: async (data) => {
    set({ selectedChat: data });
  },

  closeChat: () => {
    set({ selectedChat: null });
  },

  selectImage: (data) => {
    set({ selectedImage: data });
  },

  closeImage: () => {
    set({ selectedImage: null });
  },

  sendMessage: async (data: any) => {
    set({ isSendingMessage: true });

    try {
      await AxiosInstance.post("/messages/send-message", data);
    } catch (error: any) {
      toast.error(error.response.data.error);
      console.error(error);
    } finally {
      set({ isSendingMessage: false });
    }
  },

  getMessages: async (data) => {
    set({ isGettingMessages: true });

    try {
      const response = await AxiosInstance.post("/messages/get-messages", data);
      set({ messages: response.data });
    } catch (error: any) {
      toast.error(error.response.data.error);
      console.error(error);
    } finally {
      set({ isGettingMessages: false });
    }
  },

  deleteMessage: async (data) => {
    try {
      await AxiosInstance.delete("/messages/delete-message", { data });
    } catch (error: any) {
      toast.error(error.response.data.error);
      console.error(error);
    }
  },

  setMessageSeen: async (messageId: string) => {
    try {
      await AxiosInstance.post("/messages/set-seen", { id: messageId });
      set({
        messages: (get().messages || []).map((msg) =>
          msg._id === messageId ? { ...msg, is_seen: true } : msg
        ),
      });
    } catch (error: any) {
      toast.error(error.response.data.error);
      console.error(error);
    }
  },

  subscribeMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (message) => {
      set({ messages: [...(get().messages || []), message] });

      const currentUser = useAuthStore.getState().user;
      if (message.receiverId === currentUser?._id && !message.is_seen) {
        get().setMessageSeen(message._id);
      }
    });

    socket.on("deleteMessage", (messageToDelete) => {
      set({
        messages: [
          ...(get().messages?.filter((message) => message._id !== messageToDelete._id) ||
            []),
        ],
      });
    });

    socket.on("messageSeen", ({ messageId }) => {
      set({
        messages: (get().messages || []).map((msg) =>
          msg._id === messageId ? { ...msg, is_seen: true } : msg
        ),
      });
    });
  },

  unsubscribeMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
    socket?.off("deleteMessage");
    socket?.off("messageSeen");
  },
}));
