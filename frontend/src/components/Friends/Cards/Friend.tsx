import { UserMinus } from "lucide-react";
import type User from "../../../lib/schemas/userSchema";
import { useFriendsStore } from "../../../store/useFriendsStore";
import Loader from "../../Loader";
import { useChatStore } from "../../../store/useChatStore";

const Friend = ({ friend }: { friend: User }) => {
  const { isDeletingFriend, deleteFriend } = useFriendsStore();
  const { selectChat } = useChatStore();

  const handleDeleteFriend = () => {
    deleteFriend(friend._id);
  };

  return (
    <div
      onClick={() => selectChat(friend)}
      key={friend._id}
      className="flex justify-between items-center w-full px-2.5 py-3 border-b border-spec-1-dark hover:bg-secondary_dark rounded-md cursor-pointer transition-colors duration-100"
    >
      <div className="flex justify-start items-center gap-5 flex-1">
        <img
          className="min-w-12 max-w-18 w-full min-h-12 max-h-18 h-full rounded-full"
          src={
            friend && friend.photoUrl !== "" ? friend.photoUrl : "avatar_placeholder.png"
          }
          alt="Friend's avatar"
        />
        <div className="flex flex-col justify-start items-start">
          <h1 className="text-label-brighter-text text-lg font-semibold">
            {friend ? friend.username : "Unknown"}
          </h1>
          <p className="text-label-text">@{friend ? friend.user_id : ""}</p>
        </div>
      </div>
      <div className="flex justify-end items-center flex-2 gap-4">
        <button
          onClick={handleDeleteFriend}
          className="bg-spec-1-dark/45 hover:bg-spec-1-dark/20 p-1.5 rounded-md cursor-pointer text-label-text transition-colors duration-100 ease-in-out disabled:cursor-not-allowed"
        >
          {isDeletingFriend === friend._id ? <Loader /> : <UserMinus />}
        </button>
      </div>
    </div>
  );
};

export default Friend;
