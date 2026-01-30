import { useContext, useEffect, useState } from "react";
import { useChatStore } from "../../../store/useChatStore";
import { useAuthStore } from "../../../store/useAuthStore";
import ReplyCurve from "./ReplyCurve";
import { CameraIcon } from "lucide-react";
import { MessageRefsContext } from "../../../context/MessageRefsContext";

interface ReplyProps {
  message: {
    _id: string;
    content: string | null;
    attachments: string | null;
    senderId: string;
  };
}

const RepliedMessage = ({ message }: ReplyProps) => {
  const [senderData, setSenderData] = useState<{
    firstName: string;
    photoUrl: string;
  } | null>(null);
  const messageRefsContext = useContext(MessageRefsContext);

  const { selectedChat } = useChatStore();
  const { user } = useAuthStore();

  useEffect(() => {
    const sender = selectedChat?._id === message.senderId ? selectedChat : user;

    setSenderData({
      firstName: sender?.firstName || "",
      photoUrl: sender?.photoUrl ? sender.photoUrl : "",
    });
  }, [message, selectedChat, user]);

  return (
    <div
      className="w-full flex justify-start items-center gap-2 mb-0.5"
      onClick={() => messageRefsContext?.moveToMessage(message._id)}
    >
      <ReplyCurve />
      <div className="flex justify-center items-center gap-2 ml-2">
        <img
          className="w-5 h-5 rounded-full object-cover"
          src={senderData?.photoUrl ? senderData.photoUrl : "avatar_placeholder.png"}
          alt="user_avatar"
        />
        <p className="text-sm text-label-text">{senderData?.firstName}</p>
      </div>

      <div className="flex justify-start items-center overflow-hidden">
        {message.attachments && (
          <CameraIcon className="text-label-brighter-text" size={20} />
        )}
        <p className="text-label-brighter-text truncate ml-1">{message.content}</p>
      </div>
    </div>
  );
};

export default RepliedMessage;
