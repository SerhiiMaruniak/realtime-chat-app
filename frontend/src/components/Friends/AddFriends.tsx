import { useState } from "react";
import { useFriendsStore } from "../../store/useFriendsStore";
import Loader from "../Loader";
import FoundUsers from "./Cards/FoundUsers";
import { UserIdSchema } from "../../lib/schemas/schemas";
import toast from "react-hot-toast";
import HandleZodError from "../../lib/handleZodError";

const AddFriends = () => {
  const [inputValue, setInputValue] = useState<string>("");
  const { users, getUsers, isGettingUsers } = useFriendsStore();

  const findFriend = () => {
    if (inputValue === "") return;

    const query = inputValue.trim();
    if (query.startsWith("@")) {
      const rawId = query.slice(1);
      const result = UserIdSchema.safeParse({ user_id: rawId });

      if (result.success) {
        getUsers({ user_id: result.data.user_id, username: "" });
      } else {
        const error = HandleZodError({ errors: result.error.issues, input: "user_id" });
        toast.error(error);
      }
    } else {
      getUsers({ user_id: "", username: query });
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-start items-start gap-14 p-[52px]">
      <div className="w-full h-auto flex flex-col justify-start items-start gap-[22px]">
        <div className="w-full flex flex-col justify-start items-start gap-2.5">
          <h1 className="text-3xl text-label-brighter-text font-semibold">Add Friend</h1>
          <p className="text-lg text-label-text">
            You can find friends by the username or an ID
          </p>
        </div>
        <div className="w-full relative">
          <input
            onChange={(e) => setInputValue(e.target.value)}
            value={inputValue}
            className="w-full h-11 px-2.5 py-3 rounded-sm bg-spec-1-dark outline-label-text focus:outline placeholder:text-label-text text-white text-sm transition-all duration-150"
            placeholder="johndoe or @john_doe"
            type="text"
          />
          <button
            onClick={findFriend}
            className="w-28 absolute right-2.5 top-1.5 bottom-1.5 rounded-sm bg-label-text hover:bg-secondary_dark text-sm border-none outline-none text-white cursor-pointer transition-colors duration-150 ease-in-out"
          >
            {isGettingUsers ? <Loader /> : <p>Find a Friend</p>}
          </button>
        </div>
      </div>
      <div className="flex flex-col flex-1 justify-start items-start w-full">
        {users?.map((user) => (
          <FoundUsers user={user} />
        ))}
      </div>
    </div>
  );
};

export default AddFriends;
