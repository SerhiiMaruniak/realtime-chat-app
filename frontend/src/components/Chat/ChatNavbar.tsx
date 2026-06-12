import { X } from "lucide-react";
import { useChatStore } from "../../store/useChatStore";

const ChatNavbar = () => {
  const { selectedChat, closeChat } = useChatStore();

  return (
    <div className="flex w-full justify-between items-center bg-secondary px-5 py-2">
      <div className="flex justify-start items-center gap-2.5">
        <img
          className="w-10 h-10 rounded-full object-cover"
          src={selectedChat?.photoUrl ? selectedChat.photoUrl : "avatar_placeholder.png"}
          alt="user_avatar"
        />
        <h1
          className="text-label-brighter-text truncate max-w-96"
          title={selectedChat?.username}
        >
          {selectedChat?.username}
        </h1>
      </div>
      <button className="text-label-text cursor-pointer" onClick={closeChat}>
        <X />
      </button>
    </div>
  );
};

export default ChatNavbar;
