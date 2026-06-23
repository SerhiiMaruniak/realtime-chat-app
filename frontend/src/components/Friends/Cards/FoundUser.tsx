import { memo } from "react";
import { UserPlus, Hourglass } from "lucide-react";
import type User from "../../../lib/schemas/userSchema";
import { useFriendsStore } from "../../../store/useFriendsStore";
import Loader from "../../Loader";

interface FoundUserProps {
  user: User;
}

const getId = (item: string | { _id: string }) =>
  typeof item === "string" ? item : (item?._id ?? "");

const FoundUser = memo(({ user }: FoundUserProps) => {
  const {
    friends,
    sendRequest,
    sentFriendRequests,
    friendRequests,
    isSendingFriendRequest,
  } = useFriendsStore();

  const requested =
    sentFriendRequests.some((req) => getId(req.receiverId) === user._id) ||
    friendRequests.some((req) => getId(req.senderId) === user._id);
  const isFriend = friends?.some((friend) => friend._id === user._id) ?? false;

  const sendFriendRequest = () => {
    if (requested) return;

    sendRequest(user._id);
  };

  return (
    <div className="flex justify-between items-center w-full px-2.5 py-3 border-b border-spec-1">
      <div className="flex justify-start items-center gap-5 flex-1">
        <img
          className="min-w-12 max-w-18 w-full min-h-12 max-h-18 h-full rounded-full"
          src={user.photoUrl !== "" ? user.photoUrl : "avatar_placeholder.png"}
          alt="Found user's avatar"
        />
        <div className="flex flex-col justify-start items-start">
          <h1 className="text-label-brighter-text text-lg font-semibold">
            {user.username}
          </h1>
          <p className="text-label-text">@{user.user_id}</p>
        </div>
      </div>
      <div className="flex justify-end items-center flex-2">
        {!isFriend && (
          <button
            className="bg-spec-1/45 hover:bg-spec-1/20 p-1.5 rounded-md cursor-pointer text-label-text transition-colors duration-100 ease-in-out disabled:cursor-not-allowed"
            onClick={sendFriendRequest}
            disabled={requested || isSendingFriendRequest === user._id}
            aria-label={
              requested
                ? "Request already sent"
                : isSendingFriendRequest === user._id
                  ? "Sending request"
                  : "Send friend request"
            }
          >
            {isSendingFriendRequest === user._id ? (
              <Loader />
            ) : requested ? (
              <Hourglass />
            ) : (
              <UserPlus />
            )}
          </button>
        )}
      </div>
    </div>
  );
});

FoundUser.displayName = "FoundUser";

export default FoundUser;
