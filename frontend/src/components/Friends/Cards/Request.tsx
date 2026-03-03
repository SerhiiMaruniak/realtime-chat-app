import { UserCheck, UserX } from "lucide-react";
import { useFriendsStore } from "../../../store/useFriendsStore";
import type requestSchema from "../../../lib/schemas/friendRequestSchema";

const Request = ({ request }: { request: requestSchema }) => {
  const sender = typeof request.senderId === "string" ? null : request.senderId;

  const { manageRequest } = useFriendsStore();

  const managFriendeRequest = (action: "accept" | "decline") => {
    manageRequest({ id: request._id, action });
  };

  return (
    <div
      key={request._id}
      className="flex justify-between items-center w-full px-2.5 py-3 border-b border-spec-1-dark"
    >
      <div className="flex justify-start items-center gap-5 flex-1">
        <img
          className="min-w-12 max-w-18 w-full min-h-12 max-h-18 h-full rounded-full"
          src={
            sender && sender.photoUrl !== "" ? sender.photoUrl : "avatar_placeholder.png"
          }
          alt="Found user's avatar"
        />
        <div className="flex flex-col justify-start items-start">
          <h1 className="text-label-brighter-text text-lg font-semibold">
            {sender ? sender.username : "Unknown"}
          </h1>
          <p className="text-label-text">@{sender ? sender.user_id : ""}</p>
        </div>
      </div>
      <div className="flex justify-end items-center flex-2 gap-4">
        <button
          onClick={() => managFriendeRequest("accept")}
          className="bg-spec-1-dark/45 hover:bg-spec-1-dark/20 p-1.5 rounded-md cursor-pointer text-label-text transition-colors duration-100 ease-in-out disabled:cursor-not-allowed"
        >
          <UserCheck />
        </button>
        <button
          onClick={() => managFriendeRequest("decline")}
          className="bg-spec-1-dark/45 hover:bg-spec-1-dark/20 p-1.5 rounded-md cursor-pointer text-label-text transition-colors duration-100 ease-in-out disabled:cursor-not-allowed"
        >
          <UserX />
        </button>
      </div>
    </div>
  );
};

export default Request;
