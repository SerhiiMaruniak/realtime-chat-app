import { useChatStore } from "../../store/useChatStore";
import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import ChatNavbar from "./ChatNavbar";

const Chat = () => {
  const { selectedChat } = useChatStore();

  return (
    <div className="w-full h-full flex flex-col justify-start items-start">
      {selectedChat ? (
        <>
          <ChatNavbar />
          <ChatMessages />
          <ChatInput />
        </>
      ) : (
        <div className="self-center my-auto">
          <h1 className="text-label-text text-lg font-semibold">
            Begin chatting by selecting a chat
          </h1>
        </div>
      )}
    </div>
  );
};

export default Chat;
