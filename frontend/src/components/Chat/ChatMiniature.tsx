import type messageSchema from "../../lib/schemas/messageSchema.ts";
import type User from "../../lib/schemas/userSchema.ts";
import { useAuthStore } from "../../store/useAuthStore.ts";
import { useChatStore } from "../../store/useChatStore.ts";

interface ChatMiniatureProps {
  user: User;
  width: number;
  min_width: number;
  messages: messageSchema[] | null;
}

const ChatMiniature = ({ user, width, min_width, messages }: ChatMiniatureProps) => {
  const { onlineUsers } = useAuthStore();
  const { selectedChat, selectChat } = useChatStore();

  return (
    <div
      className={`w-full cursor-pointer duration-150 transition-all rounded-lg flex  gap-2.5 items-center px-2.5 py-1.5 
        ${selectedChat === user ? "bg-label-text" : "bg-secondary"} 
        ${selectedChat !== user ? "hover:bg-spec-1" : ""}
        ${width === min_width ? "justify-center" : "justify-start"}
        
        `}
      onClick={() => selectChat(user)}
    >
      <div className="relative">
        <img
          className="min-w-12 min-h-12 w-12 h-12 rounded-full object-cover"
          src={user.photoUrl !== "" ? user.photoUrl : "avatar_placeholder.png"}
          alt="user_avatar"
        />
        {messages && messages.length > 0 && (
          <div className="absolute -top-1 -left-2 bg-label-text w-6 h-6 rounded-full">
            <p className="text-center text-secondary">{messages.length}</p>
          </div>
        )}
        {onlineUsers.includes(user._id) && (
          <div className="absolute w-3 h-3 rounded-full bg-green-500 top-9 right-0"></div>
        )}
      </div>
      {width !== min_width && (
        <h1
          className={`text-md max-w-9/12 truncate
          ${selectedChat === user ? "text-secondary" : "text-label-text"}
          `}
        >
          {user.username}
        </h1>
      )}
    </div>
  );
};

export default ChatMiniature;
