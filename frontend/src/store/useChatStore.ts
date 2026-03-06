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
  hasMore: boolean;
  lastId: string | null;
  contextMenu: {
    message: string;
    offsetX: number;
    offsetY: number;
  } | null;
  isGettingUsers: boolean;
  isSendingMessage: boolean;
  isGettingMessages: boolean;
  selectChat: (data: User) => void;
  resetPagination: () => void;
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
  getMessages: (id: string | null, loadMore?: boolean) => Promise<void>;
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
  hasMore: true,
  lastId: null,
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

  selectChat: (data) => {
    const { selectedChat } = get();

    if (selectedChat?._id === data._id) return;

    const updatedUnread = (get().unreadMessages || []).filter(
      (m) => m.senderId !== data._id,
    );

    localStorage.setItem("unreadMessages", JSON.stringify(updatedUnread));

    set({
      selectedChat: data,
      messages: null,
      unreadMessages: updatedUnread,
    });

    get().resetPagination();
  },

  resetPagination: () => set({ hasMore: true, lastId: null }),

  closeChat: () => set({ selectedChat: null }),

  selectImage: (data) => set({ selectedImage: data }),

  closeImage: () => set({ selectedImage: null }),

  sendMessage: async (data) => {
    set({ isSendingMessage: true });
    try {
      await AxiosInstance.post("/messages/send-message", data);
    } catch (error: any) {
      toast.error(error.response?.data?.error);
    } finally {
      set({ isSendingMessage: false });
    }
  },

  editMessage: async (data) => {
    try {
      await AxiosInstance.put(`/messages/edit-message/${data.id}`, data);
    } catch (error: any) {
      toast.error(error.response?.data?.error);
    }
  },

  getMessages: async (id, loadMore = false) => {
    if (!id) return;

    const { lastId } = get();

    if (loadMore && !lastId && (get().messages?.length ?? 0) > 0) return;

    set({ isGettingMessages: true });

    try {
      const response = await AxiosInstance.get(
        `/messages/get-messages/${id}`,
        loadMore ? { params: { lastId } } : undefined,
      );

      if (loadMore) {
        set({
          messages: [...(response.data.messages ?? []), ...(get().messages ?? [])],
        });
      } else {
        set({
          messages: response.data.messages,
        });
      }

      set({
        hasMore: response.data.hasMore,
        lastId: response.data.lastId,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error);
    } finally {
      set({ isGettingMessages: false });
    }
  },

  deleteMessage: async (id) => {
    try {
      await AxiosInstance.delete(`/messages/delete-message/${id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error);
    }
  },

  setMessageSeen: async (messageId) => {
    try {
      await AxiosInstance.put(`/messages/set-seen/${messageId}`);

      const updated = (get().messages || []).map((msg) =>
        msg._id === messageId ? { ...msg, is_seen: true } : msg,
      );

      set({ messages: updated });
    } catch (error: any) {
      toast.error(error.response?.data?.error);
    }
  },

  showContextMenu: (data) => set({ contextMenu: data }),

  subscribeMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.off("editMessage");
    socket.off("deleteMessage");
    socket.off("messageSeen");

    socket.on("newMessage", (message) => {
      const { selectedChat, messages, unreadMessages } = get();
      const currentUserId = useAuthStore.getState().user?._id;

      const isForMe = message.receiverId === currentUserId;

      const isCurrentChat =
        selectedChat &&
        (message.senderId === selectedChat._id ||
          message.receiverId === selectedChat._id);

      if (isCurrentChat) {
        set({
          messages: [...(messages || []), message],
        });
      }

      if (isForMe && !isCurrentChat) {
        const updatedUnread = [...(unreadMessages || []), message];

        set({ unreadMessages: updatedUnread });
        localStorage.setItem("unreadMessages", JSON.stringify(updatedUnread));
      }
    });

    socket.on("editMessage", (messageToEdit) => {
      set({
        messages: (get().messages || []).map((m) =>
          m._id === messageToEdit._id ? messageToEdit : m,
        ),
      });
    });

    socket.on("deleteMessage", (messageToDelete) => {
      set({
        messages: (get().messages || []).filter((m) => m._id !== messageToDelete._id),
      });
    });

    socket.on("messageSeen", ({ messageId }) => {
      set({
        messages: (get().messages || []).map((msg) =>
          msg._id === messageId ? { ...msg, is_seen: true } : msg,
        ),
      });
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
