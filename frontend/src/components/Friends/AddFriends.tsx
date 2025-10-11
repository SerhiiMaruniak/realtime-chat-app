import { useCallback, useState } from "react";
import { Search } from "lucide-react";

import FoundPerson from "./FoundPerson";
import type User from "../../lib/schemas/userSchema";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import Loader from "../Loader";

const AddFriends = () => {
  const [filteredUsers, setFilteredUsers] = useState<User[] | [] | null>(null);
  const [filter, setFilter] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  const { user: authUser } = useAuthStore();
  const { users, isGettingUsers } = useChatStore();

  const handleSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      setInputError(null);
      e.preventDefault();
      if (filter === "") return;

      let id: string | null = null;

      if (filter.startsWith("#")) {
        if (filter.slice(1).length === 5) {
          id = filter.slice(1);
        } else {
          setInputError("Enter a correct ID or a username");
          return;
        }
      }

      if (!users) return;

      const output = users.filter((user) => {
        if (!id) {
          const fullName = (user.firstName + " " + user.lastName).toLowerCase();
          const searchTerm = filter.toLowerCase().trim();

          return fullName.includes(searchTerm) && user._id !== authUser?._id;
        }

        return id === user._id.slice(-5) && user._id !== authUser?._id;
      });

      setFilteredUsers(output);
    },
    [filter, users, authUser?._id]
  );

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <form className="relative w-full mb-4 p-0.5" onSubmit={handleSearch} noValidate>
        <div>
          <input
            type="text"
            className={`w-full pl-1.5 pr-10 py-2 duration-100 transition-all bg-secondary_dark placeholder:text-label-text rounded-sm text-sm text-input-text 
                ${
                  inputError
                    ? "outline outline-red-400"
                    : "focus:outline outline-label-text"
                } 
                `}
            placeholder="Search by username or id #00000"
            onChange={(e) => setFilter(e.target.value)}
          />

          {inputError && (
            <p className="absolute text-red-400 text-sm mt-1">{inputError}</p>
          )}
        </div>

        <button
          type="submit"
          className="duration-100 transition-all absolute top-1/2 -translate-y-1/2 right-0.5 cursor-pointer hover:bg-secondary_dark p-1 rounded-sm"
        >
          {isGettingUsers ? (
            <Loader className="text-label-text" />
          ) : (
            <Search className="text-label-text" />
          )}
        </button>
      </form>

      <div className="flex flex-col flex-1 min-h-0 w-full">
        {filteredUsers && (
          <>
            <h1 className="text-label-text text-lg font-semibold mb-3 flex-shrink-0">
              Found {filteredUsers.length} user(s):
            </h1>
            <ul className="flex-1 overflow-y-auto min-h-0">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => <FoundPerson user={user} key={user._id} />)
              ) : (
                <li className="text-center mt-4 text-label-text text-md">
                  There's no one with this username or an ID
                </li>
              )}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default AddFriends;
