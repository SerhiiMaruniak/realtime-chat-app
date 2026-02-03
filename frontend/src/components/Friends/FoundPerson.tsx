import { useEffect, useState } from "react";
import { Clock, UserPlus2 } from "lucide-react";

import type User from "../../lib/schemas/userSchema";
import { useFriendsStore } from "../../store/useFriendsStore";
import { useAuthStore } from "../../store/useAuthStore";

interface PersonProps {
  user: User;
}

const FoundPerson = ({ user }: PersonProps) => {
  const { user: sender } = useAuthStore();
  const { friends, friendRequests, sendRequest } = useFriendsStore();

  const [status, setStatus] = useState<"none" | "pending" | "friends">("none");

  const fullName = `${user.firstName} ${user.lastName}`;

  useEffect(() => {
    if (!sender?._id) return;

    const alreadyFriends = friends?.some((f) => f._id === user._id);
    if (alreadyFriends) {
      setStatus("friends");
      return;
    }

    const foundReq = friendRequests?.find(
      (req) =>
        (req.senderId === sender._id && req.receiverId === user._id) ||
        (req.receiverId === sender._id && req.senderId === user._id),
    );

    if (!foundReq) {
      setStatus("none");
    } else if (foundReq.senderId === sender._id) {
      setStatus("pending");
    }
  }, [friends, friendRequests, sender?._id, user._id]);

  let actionButton = null;

  if (status === "none") {
    actionButton = (
      <button
        className="duration-150 transition-all p-1 hover:bg-spec-1-dark rounded-sm cursor-pointer"
        title="Add friend"
        aria-label="Add friend"
        onClick={() => sendRequest(user._id)}
      >
        <UserPlus2 className="text-label-text" />
      </button>
    );
  }

  if (status === "pending") {
    actionButton = (
      <div className="p-1" title="Pending..." aria-label="Pending">
        <Clock className="text-label-text" />
      </div>
    );
  }

  return (
    <li className="border-b border-spec-1-dark px-3 py-3.5 w-full flex justify-between items-center">
      <div className="flex justify-start items-center gap-2.5">
        <img
          src={user.photoUrl ? user.photoUrl : "avatar_placeholder.png"}
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
          <p className="text-label-text text-sm">#{user._id.slice(-5)}</p>
        </div>
      </div>

      {actionButton}
    </li>
  );
};

export default FoundPerson;
