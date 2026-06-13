import { useFriendsStore } from "../../store/useFriendsStore";
import Friend from "./Cards/Friend";
import Loader from "../Loader";

const AllFriends = () => {
  const { friends, isGettingFriends } = useFriendsStore();

  return (
    <div className="w-full h-full flex flex-col justify-between items-start gap-4 p-4.5 sm:p-8 overflow-auto">
      <div className="w-full flex flex-col justify-start items-start gap-2.5 border-b border-spec-1 pb-4">
        <h1 className="text-2xl sm:text-3xl text-label-brighter-text font-semibold">
          Friends
        </h1>
      </div>
      <div className="flex flex-col flex-1 justify-start items-center gap-4 w-full h-full overflow-auto">
        {isGettingFriends ? (
          <Loader className="mx-auto my-auto text-spec-1" size={48} />
        ) : friends && friends.length > 0 ? (
          friends.map((friend) => <Friend friend={friend} key={friend._id} />)
        ) : (
          <p className="text-label-text">You don't have friends</p>
        )}
      </div>
    </div>
  );
};

export default AllFriends;
