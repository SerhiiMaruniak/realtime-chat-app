import { useState } from "react";
import { useFriendsStore } from "../../store/useFriendsStore";
import Loader from "../Loader";
import FoundUser from "./Cards/FoundUser";
import { UserIdSchema } from "../../lib/schemas/schemas";
import toast from "react-hot-toast";
import HandleZodError from "../../lib/handleZodError";

const AddFriends = () => {
  const [inputValue, setInputValue] = useState<string>("");
  const { users, getUsers, isGettingUsers, getRequests, totalPages, currentPage } =
    useFriendsStore();

  const [lastPayload, setLastPayload] = useState<{
    user_id: string;
    username: string;
  } | null>(null);

  const findFriend = () => {
    if (inputValue === "") return;

    const query = inputValue.trim();
    if (query.startsWith("@")) {
      const rawId = query.slice(1);
      const result = UserIdSchema.safeParse({ user_id: rawId });

      if (result.success) {
        const payload = { user_id: result.data.user_id, username: "" };
        setLastPayload(payload);
        getUsers({ ...payload, page: 1 });
      } else {
        const error = HandleZodError({ errors: result.error.issues, input: "user_id" });
        toast.error(error);
      }
    } else {
      const payload = { user_id: "", username: query };
      setLastPayload(payload);
      getUsers({ ...payload, page: 1 });
    }

    getRequests("sent");
  };

  const goToPage = (page: number) => {
    if (!lastPayload) return;
    const p = Math.max(1, page);
    getUsers({ ...lastPayload, page: p });
  };

  return (
    <div className="w-full h-full flex flex-col justify-between items-start gap-4 p-8 overflow-auto">
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
            <p>Find a Friend</p>
          </button>
        </div>
      </div>
      <div className="flex flex-col flex-1 justify-start items-center gap-4 w-full h-full overflow-auto">
        {isGettingUsers ? (
          <Loader className="mx-auto my-auto text-spec-1-dark" size={48} />
        ) : users && users.length > 0 ? (
          users.map((user) => {
            return <FoundUser user={user} key={user._id} />;
          })
        ) : (
          <p className="text-label-text">No users found</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="w-full flex items-center justify-center gap-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="duration-150 px-3 py-1 rounded bg-spec-1-dark text-label-text cursor-pointer hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:opacity-40"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }).map((_, idx) => {
            const page = idx + 1;
            return (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`duration-150 px-3 py-1 rounded cursor-pointer hover:opacity-75 ${currentPage === page ? "bg-label-text text-white" : "bg-spec-1-dark text-label-text"}`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="duration-150 px-3 py-1 rounded bg-spec-1-dark text-label-text cursor-pointer hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AddFriends;
