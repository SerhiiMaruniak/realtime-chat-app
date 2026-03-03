/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import toast from "react-hot-toast";
import AxiosInstance from "../lib/axiosInstance.ts";
import type User from "../lib/schemas/userSchema.ts";
import type requestSchema from "../lib/schemas/friendRequestSchema.ts";
import { useAuthStore } from "./useAuthStore.ts";

interface FriendsProps {
  users: User[] | null;
  friends: User[] | null;
  friendRequests: requestSchema[] | [];
  isGettingUsers: boolean;
  totalPages: number;
  currentPage: number;
  isGettingFriends: boolean;
  isGettingFriendRequests: boolean;
  isSendingFriendRequest: string | null;
  isManagingRequest: string | null;
  isDeletingFriend: string | null;
  getUsers: (payload: {
    username: string;
    user_id: string;
    page?: number;
  }) => Promise<void>;
  getFriends: () => Promise<void>;
  getRequests: (type: "sent" | "received") => Promise<void>;
  sendRequest: (id: string) => Promise<void>;
  manageRequest: (data: { id: string; action: string }) => Promise<void>;
  updateFriend: (data: User) => void;
  deleteFriend: (id: string) => Promise<void>;
  subscribeFriends: () => void;
  unsubscribeFriends: () => void;
}

export const useFriendsStore = create<FriendsProps>((set) => ({
  users: null,
  friends: null,
  friendRequests: [],
  isGettingUsers: false,
  isGettingFriends: false,
  isGettingFriendRequests: false,
  isSendingFriendRequest: null,
  isManagingRequest: null,
  isDeletingFriend: null,
  totalPages: 1,
  currentPage: 1,

  getUsers: async (payload) => {
    set({ isGettingUsers: true });

    try {
      const { user_id, username, page } = payload;

      let searchParams = "";
      if (user_id) {
        searchParams = `?id=${user_id}&page=${page || 1}`;
      } else {
        searchParams = `?username=${username}&page=${page || 1}`;
      }

      const response = await AxiosInstance.get(`/friends/get-users${searchParams}`);

      set({
        users: response.data.users,
        totalPages: response.data.totalPages || 1,
        currentPage: response.data.page || 1,
      });
    } catch (error: any) {
      toast.error(error.response.data.error);
      console.error(error);
    } finally {
      set({ isGettingUsers: false });
    }
  },

  getFriends: async () => {
    set({ isGettingFriends: true });

    try {
      const response = await AxiosInstance.get("/friends/friends");
      set({ friends: response.data });
    } catch (error: any) {
      toast.error(error.response.data.error);
      console.error(error);
    } finally {
      set({ isGettingFriends: false });
    }
  },

  getRequests: async (type) => {
    set({ isGettingFriendRequests: true });

    try {
      const response = await AxiosInstance.get(`/friends/requests`, {
        params: { type },
      });
      set({ friendRequests: response.data });
    } catch (error: any) {
      console.error(error);
    } finally {
      set({ isGettingFriendRequests: false });
    }
  },

  sendRequest: async (id) => {
    set({ isSendingFriendRequest: id });

    try {
      const response = await AxiosInstance.post(`/friends/send-request/${id}`);
      set((state) => ({
        friendRequests: [...(state.friendRequests || []), response.data],
      }));
      toast.success("Sent friend request successfully");
    } catch (error: any) {
      toast.error(error.response.data.error);
      console.error(error);
    } finally {
      set({ isSendingFriendRequest: null });
    }
  },

  manageRequest: async (data) => {
    set({ isManagingRequest: data.id });

    try {
      await AxiosInstance.put(`/friends/manage-request/${data.id}`, data);
      // Optimistically remove the request from state; socket will handle friend list
      set((state) => ({
        friendRequests: [
          ...(state.friendRequests.filter((req) => req._id !== data.id) || []),
        ],
      }));
    } catch (error: any) {
      toast.error(error.response.data.error);
      console.error(error);
    } finally {
      set({ isManagingRequest: null });
    }
  },

  updateFriend: (friend) =>
    set((state) => ({
      friends:
        state.friends && state.friends.map((f) => (f._id === friend._id ? friend : f)),
    })),

  deleteFriend: async (id) => {
    set({ isDeletingFriend: id });

    try {
      const response = await AxiosInstance.delete(`/friends/delete-friend/${id}`);
      toast.success(response.data.message);
    } catch (error: any) {
      toast.error(error.response.data.error);
      console.error(error);
    } finally {
      set({ isDeletingFriend: null });
    }
  },

  subscribeFriends: () => {
    const socket = useAuthStore.getState().socket;
    console.log(socket);

    socket?.on("addFriend", (newRequest) => {
      console.debug("socket addFriend event", newRequest);
      set((state) => {
        const exists = state.friendRequests.some((req) => req._id === newRequest._id);
        return {
          friendRequests: exists
            ? state.friendRequests
            : [...(state.friendRequests || []), newRequest],
        };
      });
    });

    socket?.on("acceptRequest", (newFriend, friendRequest) => {
      console.debug("socket acceptRequest event", newFriend, friendRequest);
      set((state) => ({
        friends: [...(state.friends || []), newFriend],
        friendRequests: [
          ...(state.friendRequests.filter(
            (request) => request._id !== friendRequest._id,
          ) || []),
        ],
      }));
    });

    socket?.on("declineRequest", (friendRequest) => {
      console.debug("socket declineRequest event", friendRequest);
      set((state) => ({
        friendRequests: [
          ...(state.friendRequests.filter(
            (request) => request._id !== friendRequest._id,
          ) || []),
        ],
      }));
    });

    socket?.on("deleteFriend", (friendId) => {
      set((state) => ({
        friends: [...(state.friends?.filter((friend) => friend._id !== friendId) || [])],
      }));
    });
  },

  unsubscribeFriends: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("addFriend");
    socket?.off("acceptRequest");
    socket?.off("declineRequest");
    socket?.off("deleteFriend");
  },
}));
