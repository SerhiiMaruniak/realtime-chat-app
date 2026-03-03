import { useState, useEffect, useRef, useCallback } from "react";
import { LogOut, Settings, UserPlus2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ChatMiniature from "./ChatMiniature";
import { useFriendsStore } from "../../store/useFriendsStore";
import { useAuthStore } from "../../store/useAuthStore";
import Loader from "../Loader";
import { useChatStore } from "../../store/useChatStore";

const MIN_WIDTH = 120;
const MAX_WIDTH = 400;

const Sidebar = () => {
  const getInitialSidebarWidth = () => {
    const width = localStorage.getItem("sidebarWidth");

    return width ? parseInt(width) : MAX_WIDTH;
  };

  const [filteredFriends, setFilteredFriends] = useState("");
  const [isResizing, setIsResizing] = useState(false);

  const sidebarRef = useRef<HTMLDivElement>(null);
  // TODO: fix sidebar jumping on render
  const [currentWidth, setCurrentWidth] = useState<number>(getInitialSidebarWidth());
  const [startX, setStartX] = useState<number>(0);
  const [startWidth, setStartWidth] = useState<number>(MAX_WIDTH);

  const navigate = useNavigate();

  const { friends, getFriends, isGettingFriends } = useFriendsStore();
  const { messages, unreadMessages } = useChatStore();
  const { logout } = useAuthStore();

  const handleResize = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const delta = e.clientX - startX;
      let newWidth = startWidth + delta;

      newWidth = Math.min(Math.max(newWidth, MIN_WIDTH), MAX_WIDTH);

      if (newWidth > MIN_WIDTH && newWidth < MIN_WIDTH + 100) {
        newWidth = MIN_WIDTH;
      }

      setCurrentWidth(newWidth);
    },
    [isResizing, startX, startWidth],
  );

  useEffect(() => {
    const stopResize = () => {
      setIsResizing(false);
      document.body.style.userSelect = "";
    };

    if (isResizing) {
      document.body.style.userSelect = "none";
    }

    window.addEventListener("mousemove", handleResize);
    window.addEventListener("mouseup", stopResize);

    return () => {
      window.removeEventListener("mousemove", handleResize);
      window.removeEventListener("mouseup", stopResize);
      document.body.style.userSelect = "";
    };
  }, [handleResize, isResizing]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem("sidebarWidth", currentWidth.toString());
    }, 100);

    return () => clearTimeout(timeout);
  }, [currentWidth]);

  useEffect(() => {
    getFriends();
  }, [getFriends]);

  useEffect(() => {
    const screenWidth = document.documentElement.clientWidth;

    if (screenWidth <= 1024) {
      setCurrentWidth(MIN_WIDTH);
    }
  }, []);

  return (
    <div
      ref={sidebarRef}
      className={`relative sm:flex hidden flex-col justify-start items-start border-r border-spec-1-dark bg-secondary_dark px-2.5 py-6 h-full
      ${currentWidth <= MIN_WIDTH ? "w-20" : "w-80"}
      sm:w-[${currentWidth}px]`}
      style={{ width: currentWidth }}
    >
      <div
        className="absolute w-1 h-full top-0 right-0 cursor-ew-resize"
        onMouseDown={(e) => {
          setIsResizing(true);
          setStartX(e.clientX);
          setStartWidth(currentWidth);
        }}
      />

      <div
        className={`mb-2 w-full flex 
          ${currentWidth === MIN_WIDTH ? "justify-center" : "justify-between"}
          items-center gap-3 border-b border-spec-1-dark pb-3`}
      >
        <input
          type="text"
          placeholder="Find a chat"
          onChange={(e) => setFilteredFriends(e.target.value)}
          className={`w-full px-1.5 py-1 duration-100 transition-all bg-spec-1-dark placeholder:text-label-text rounded-sm text-sm text-input-text outline-label-text focus:outline
            ${currentWidth === MIN_WIDTH ? "hidden" : "flex"}
            `}
        />
        <button
          className="duration-150 transition-all p-1 hover:bg-spec-1-dark rounded-sm cursor-pointer"
          title="Add friend"
          aria-label="Add friend"
          onClick={() => navigate("/friends")}
        >
          <UserPlus2 className="text-label-text" />
        </button>
      </div>

      <div className="w-full flex flex-1 flex-col justify-start items-center overflow-y-auto">
        {isGettingFriends ? (
          <Loader size={32} className="text-label-text my-auto" />
        ) : friends ? (
          friends
            .filter((friend) => {
              return friend.username
                .toLowerCase()
                .includes(filteredFriends.toLowerCase());
            })
            .map((friend) => {
              let filteredUnreadMessages = null;
              if (messages && messages.length !== 0) {
                filteredUnreadMessages = messages?.filter(
                  (message) => message.senderId === friend._id && !message.is_seen,
                );
              }

              return (
                <ChatMiniature
                  key={friend._id}
                  user={friend}
                  width={currentWidth}
                  min_width={MIN_WIDTH}
                  messages={
                    unreadMessages && unreadMessages.length > 0
                      ? unreadMessages.filter((m) => m.senderId === friend._id)
                      : filteredUnreadMessages
                  }
                />
              );
            })
        ) : (
          "No friends"
        )}
      </div>

      <div className={`w-full py-1.5 flex justify-between border-t border-spec-1-dark`}>
        <button
          className="duration-150 transition-all p-1 rounded-sm hover:bg-spec-1-dark cursor-pointer"
          onClick={logout}
        >
          <LogOut
            className="text-label-text"
            size={currentWidth === MIN_WIDTH ? 18 : 24}
          />
        </button>
        <button
          className="duration-150 transition-all p-1 rounded-sm hover:bg-spec-1-dark cursor-pointer"
          onClick={() => navigate("/settings")}
        >
          <Settings
            className="text-label-text"
            size={currentWidth === MIN_WIDTH ? 18 : 24}
          />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
