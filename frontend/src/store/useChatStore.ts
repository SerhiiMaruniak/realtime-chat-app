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
  unreadMessages: messageSchema[] | null;
  contextMenu: {
    message: string;
    offsetX: number;
    offsetY: number;
  } | null;
  isGettingUsers: boolean;
  isSendingMessage: boolean;
  isGettingMessages: boolean;
  selectChat: (data: User) => void;
  closeChat: () => void;
  selectImage: (data: string) => void;
  closeImage: () => void;
  sendMessage: (data: {
    receiverId: string;
    content: string;
    attachments: string | null;
    replyId: string | null;
  }) => Promise<void>;
  editMessage: (data: { id: string; content: string }) => Promise<void>;
  getMessages: (data: string | null) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  setMessageSeen: (messageId: string) => Promise<void>;
  showContextMenu: (
    data: { offsetX: number; offsetY: number; message: string } | null,
  ) => void;
  subscribeMessages: () => void;
  unsubscribeMessages: () => void;
}

export const useChatStore = create<ChatProps>((set, get) => ({
  users: null,
  selectedChat: null,
  selectedImage: null,
  messages: null,
  unreadMessages: (() => {
    try {
      const raw = localStorage.getItem("unreadMessages");
      return raw ? (JSON.parse(raw) as messageSchema[]) : null;
    } catch {
      return null;
    }
  })(),
  contextMenu: null,
  isGettingUsers: false,
  isGettingMessages: false,
  isSendingMessage: false,

  selectChat: async (data) => {
    set({ selectedChat: data });

    const currentUser = useAuthStore.getState().user;
    const newUnread = (get().unreadMessages || []).filter(
      (m) => !(m.senderId === data._id && m.receiverId === currentUser?._id),
    );
    set({ unreadMessages: newUnread });

    try {
      localStorage.setItem("unreadMessages", JSON.stringify(newUnread));
    } catch (error: any) {
      toast.error(error.response.data.error);
      console.error(error);
    }
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

  editMessage: async (data) => {
    set({ isSendingMessage: true });

    try {
      await AxiosInstance.put(`/messages/edit-message/${data.id}`, data);
    } catch (error: any) {
      toast.error(error.response.data.error);
      console.error(error);
    } finally {
      set({ isSendingMessage: false });
    }
  },

  getMessages: async (id) => {
    set({ isGettingMessages: true });

    try {
      const response = await AxiosInstance.get(`/messages/get-messages/${id}`);
      set({ messages: response.data });
    } catch (error: any) {
      toast.error(error.response.data.error);
      console.error(error);
    } finally {
      set({ isGettingMessages: false });
    }
  },

  deleteMessage: async (id) => {
    try {
      await AxiosInstance.delete(`/messages/delete-message/${id}`);
    } catch (error: any) {
      toast.error(error.response.data.error);
      console.error(error);
    }
  },

  setMessageSeen: async (messageId: string) => {
    try {
      await AxiosInstance.put(`/messages/set-seen/${messageId}`);
      const updatedMessages = (get().messages || []).map((msg) =>
        msg._id === messageId ? { ...msg, is_seen: true } : msg,
      );
      const newUnread = (get().unreadMessages || []).filter((m) => m._id !== messageId);
      set({ messages: updatedMessages, unreadMessages: newUnread });
      try {
        localStorage.setItem("unreadMessages", JSON.stringify(newUnread));
      } catch (error: any) {
        toast.error(error.response.data.error);
        console.error(error);
      }
    } catch (error: any) {
      toast.error(error.response.data.error);
      console.error(error);
    }
  },

  showContextMenu: (data) => {
    set({ contextMenu: data });
  },

  subscribeMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.off("editMessage");
    socket.off("deleteMessage");
    socket.off("messageSeen");

    socket.on("newMessage", (message) => {
      const currentUser = useAuthStore.getState().user;
      const selectedChat = get().selectedChat;

      if (
        selectedChat &&
        (message.senderId === selectedChat._id || message.receiverId === selectedChat._id)
      ) {
        set({ messages: [...(get().messages || []), message] });

        if (message.receiverId === currentUser?._id && !message.is_seen) {
          get().setMessageSeen(message._id);
        }
      } else {
        if (message.receiverId === currentUser?._id && !message.is_seen) {
          const existing = get().unreadMessages || [];
          if (!existing.find((m) => m._id === message._id)) {
            const updated = [...existing, message];
            set({ unreadMessages: updated });
            try {
              localStorage.setItem("unreadMessages", JSON.stringify(updated));
            } catch (error: any) {
              toast.error(error.response.data.error);
              console.error(error);
            }
          }
        }
      }
    });

    socket.on("editMessage", (messageToEdit) => {
      const updatedMessages = (get().messages || []).map((message) =>
        message._id === messageToEdit._id ? messageToEdit : message,
      );

      set({ messages: updatedMessages });
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
      const updatedMessages = (get().messages || []).map((msg) =>
        msg._id === messageId ? { ...msg, is_seen: true } : msg,
      );
      const newUnread = (get().unreadMessages || []).filter((m) => m._id !== messageId);
      set({ messages: updatedMessages, unreadMessages: newUnread });
      try {
        localStorage.setItem("unreadMessages", JSON.stringify(newUnread));
      } catch (error: any) {
        toast.error(error.response.data.error);
        console.error(error);
      }
    });
  },
  unsubscribeMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
    socket?.off("editMessage");
    socket?.off("deleteMessage");
    socket?.off("messageSeen");
  },
}));
