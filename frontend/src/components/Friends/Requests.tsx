import { useEffect } from "react";
import { useFriendsStore } from "../../store/useFriendsStore";
import Request from "./Cards/Request";
import Loader from "../Loader";

const Requests = () => {
  const { friendRequests, isGettingFriendRequests, getRequests } = useFriendsStore();

  useEffect(() => {
    getRequests("received");
  }, [getRequests]);

  return (
    <div className="w-full h-full flex flex-col justify-between items-start gap-4 p-8 overflow-auto">
      <div className="w-full flex flex-col justify-start items-start gap-2.5 border-b border-spec-1-dark pb-4">
        <h1 className="text-3xl text-label-brighter-text font-semibold">
          Friend Requests
        </h1>
        <p className="text-lg text-label-text">Received: {friendRequests.length}</p>
      </div>
      <div className="flex flex-col flex-1 justify-start items-center gap-4 w-full h-full overflow-auto">
        {isGettingFriendRequests ? (
          <Loader className="mx-auto my-auto text-spec-1-dark" size={48} />
        ) : friendRequests && friendRequests.length > 0 ? (
          friendRequests.map((request) => <Request request={request} key={request._id} />)
        ) : (
          <p className="text-label-text">No users found</p>
        )}
      </div>
    </div>
  );
};

export default Requests;
