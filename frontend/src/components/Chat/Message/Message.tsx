import { useContext, useRef, useEffect, useMemo } from "react";
import { CheckCircle } from "lucide-react";
import { getHM } from "../../../lib/formatDate";
import type messageSchema from "../../../lib/schemas/messageSchema";
import { useChatStore } from "../../../store/useChatStore";
import { PageContext } from "../../../context/PageContext";
import { useAuthStore } from "../../../store/useAuthStore";
import ContextMenu from "./ContextMenu";
import RepliedMessage from "./RepliedMessage";
import Footer from "./Footer";

interface MessageProps {
  message: messageSchema;
  lastSeenMessageId?: string | null;
}

const Message = ({ message, lastSeenMessageId }: MessageProps) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const { selectImage, setMessageSeen, contextMenu, showContextMenu } = useChatStore();
  const { user } = useAuthStore();
  const pageContext = useContext(PageContext);

  const isSent = message.senderId === user?._id;
  const isSeenIndicator = isSent && message._id === lastSeenMessageId && message.is_seen;
  const isSmallScreen = pageContext && pageContext?.screen.width < 500;

  const imageSizeClasses = useMemo(
    () => (isSmallScreen ? "max-w-64 max-h-46" : "max-w-84 max-h-46"),
    [isSmallScreen]
  );

  const messageBoxClasses = useMemo(
    () => (isSmallScreen ? "max-w-64" : "max-w-84"),
    [isSmallScreen]
  );

  useEffect(() => {
    if (!message.receiverId || !user?._id || message.is_seen) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && message.receiverId === user._id) {
          setMessageSeen(message._id);
        }
      },
      { threshold: 0.5 }
    );

    const currentRef = messageRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [message.is_seen, message.receiverId, user?._id, message._id, setMessageSeen]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    showContextMenu({
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      message: message._id,
    });
  };

  return (
    <div
      ref={messageRef}
      className={`w-full flex ${isSent ? "justify-end" : "justify-start"} items-start`}
    >
      <div
        className={`flex flex-col gap-1 ${isSent ? "items-end" : "items-start"} relative`}
        onContextMenu={handleContextMenu}
      >
        {message._id === contextMenu?.message && <ContextMenu message={message} />}

        <div className="relative">
          {message.repliedMessage && message.attachments === "" && (
            <div className={messageBoxClasses}>
              <RepliedMessage message={message.repliedMessage} />
            </div>
          )}
          {!message.is_seen && message.receiverId === user?._id && (
            <div className="absolute inset-0 bg-[rgba(81,66,111,0.09)] border-l-2 border-l-[rgba(81,66,111,0.9)] -z-10 rounded-lg" />
          )}

          {message.attachments && (
            <div>
              {message.repliedMessage && (
                <div className={imageSizeClasses}>
                  <RepliedMessage message={message.repliedMessage} />
                </div>
              )}

              <img
                src={message.attachments}
                alt={`Attachment from ${isSent ? "you" : "sender"}`}
                className={`bg-spec-1-dark object-cover rounded-lg p-0.5 cursor-pointer ${imageSizeClasses} 
                ${
                  !message.content ? (isSent ? "rounded-br-none" : "rounded-bl-none") : ""
                }
                ${message.content !== "" ? "rounded-br-none rounded-bl-none" : ""}
                `}
                onClick={() => selectImage(message.attachments)}
              />

              {!message.content && (
                <Footer
                  isSent={isSent}
                  isSeenIndicator={isSeenIndicator}
                  timestamp={message.createdAt}
                />
              )}
            </div>
          )}

          {message.content && (
            <div
              className={`px-2 py-1.5 bg-spec-1-dark text-input-text rounded-lg max-w-96 break-words 
                ${isSent ? "rounded-br-none" : "rounded-bl-none"}
                ${message.attachments !== "" ? "rounded-tr-none rounded-tl-none" : ""}
              `}
            >
              {/* {message.repliedMessage && <RepliedMessage message={message} />} */}
              <p className={messageBoxClasses}>{message.content}</p>

              <div className="flex items-center gap-2 justify-end">
                <div className="flex items-center gap-1.5">
                  {message.is_edited && (
                    <p className="text-xs text-label-text">(edited)</p>
                  )}
                  <p className="text-label-text text-xs">
                    {getHM({ timestamp: message.createdAt })}
                  </p>
                </div>

                {isSeenIndicator && <CheckCircle size={16} className="text-label-text" />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
