/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import toast from "react-hot-toast";
import AxiosInstance from "../lib/axiosInstance.ts";
import type User from "../lib/schemas/userSchema.ts";
import type requestSchema from "../lib/schemas/friendRequestSchema.ts";
import { useAuthStore } from "./useAuthStore.ts";

interface FriendsProps {
  friends: User[] | null;
  friendRequests: requestSchema[] | [];
  isGettingFriends: boolean;
  isSendingFriendRequest: boolean;
  isManagingRequest: string | null;
  isDeletingFriend: string | null;
  getFriends: () => Promise<void>;
  getRequests: () => Promise<void>;
  sendRequest: (id: string) => Promise<void>;
  manageRequest: (data: { id: string; action: string }) => Promise<void>;
  updateFriend: (data: User) => void;
  deleteFriend: (id: string) => Promise<void>;
  subscribeFriends: () => void;
  unsubscribeFriends: () => void;
}

export const useFriendsStore = create<FriendsProps>((set, get) => ({
  friends: null,
  friendRequests: [],
  isGettingFriends: false,
  isSendingFriendRequest: false,
  isManagingRequest: null,
  isDeletingFriend: null,

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

  getRequests: async () => {
    try {
      const response = await AxiosInstance.get("/friends/requests");
      set({ friendRequests: response.data });
    } catch (error: any) {
      console.error(error);
    }
  },

  sendRequest: async (id) => {
    set({ isSendingFriendRequest: true });

    try {
      await AxiosInstance.post(`/friends/send-request/${id}`);
      toast.success("Sent friend request successfully");
    } catch (error: any) {
      toast.error(error.response.data.error);
      console.error(error);
    } finally {
      set({ isSendingFriendRequest: false });
    }
  },

  manageRequest: async (data) => {
    set({ isManagingRequest: data.id });

    try {
      await AxiosInstance.put(`/friends/manage-request/${data.id}`, data);
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

    socket?.on("addFriend", (newRequest) => {
      set({ friendRequests: [...(get().friendRequests || []), newRequest] });
    });

    socket?.on("acceptRequest", (newFriend, friendRequest) => {
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
