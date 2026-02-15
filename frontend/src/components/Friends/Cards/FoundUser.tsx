import { UserPlus, Hourglass } from "lucide-react";
import type User from "../../../lib/schemas/userSchema";
import { useFriendsStore } from "../../../store/useFriendsStore";
import Loader from "../../Loader";

interface FoundUserProps {
  user: User;
  requested: boolean;
}

const FoundUser = ({ user, requested }: FoundUserProps) => {
  const { sendRequest, isSendingFriendRequest } = useFriendsStore();

  const sendFriendRequest = () => {
    if (requested) return;

    sendRequest(user._id);
  };

  return (
    <div className="flex justify-between items-center w-full px-2.5 py-3 border-b border-spec-1-dark">
      <div className="flex justify-start items-center gap-5">
        <img
          className="min-w-16 max-w-18 w-full min-h-16 max-h-18 h-full rounded-full"
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
      <button
        className="bg-spec-1-dark/45 hover:bg-spec-1-dark/20 p-1.5 rounded-md cursor-pointer text-label-text transition-colors duration-100 ease-in-out"
        onClick={sendFriendRequest}
      >
        {isSendingFriendRequest === user._id ? (
          <Loader />
        ) : requested ? (
          <Hourglass />
        ) : (
          <UserPlus />
        )}
      </button>
    </div>
  );
};

export default FoundUser;
