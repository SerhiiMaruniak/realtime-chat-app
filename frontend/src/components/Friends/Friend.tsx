import type User from "../../lib/schemas/userSchema";
import { UserX } from "lucide-react";
import { useFriendsStore } from "../../store/useFriendsStore";

interface FriendProps {
  friend: User;
}

const Friend = ({ friend }: FriendProps) => {
  const { deleteFriend } = useFriendsStore();

  const fullName = `${friend.firstName} ${friend.lastName}`;

  return (
    <li className="border-b border-spec-1-dark px-3 py-3.5 w-full flex justify-between items-center">
      <div className="flex justify-start items-center gap-2.5">
        <img
          src={friend?.photoUrl ? friend.photoUrl : "avatar_placeholder.png"}
          alt="avatar"
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h1
            className="text-label-brighter-text lg:text-lg text-md max-w-32 sm:max-w-42 truncate"
            title={fullName}
          >
            {fullName}
          </h1>
          <p className="text-label-text text-sm">#{friend._id.slice(-5)}</p>
        </div>
      </div>
      <div className="flex justify-end items-center">
        <button
          className="duration-150 transition-all p-1 hover:bg-spec-1-dark rounded-sm cursor-pointer"
          title="Delete Friend"
          aria-label="Delete Friend"
          onClick={() => deleteFriend(friend._id)}
        >
          <UserX className="text-label-text" />
        </button>
      </div>
    </li>
  );
};

export default Friend;
