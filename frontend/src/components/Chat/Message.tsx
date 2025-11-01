import { useContext, useRef, useEffect } from "react";
import { CheckCircle } from "lucide-react";

import { getHM } from "../../lib/formatDate";
import type messageSchema from "../../lib/schemas/messageSchema";
import { useChatStore } from "../../store/useChatStore";
import { PageContext } from "../../context/PageContext";
import { useAuthStore } from "../../store/useAuthStore";
import ContextMenu from "./ContextMenu";

interface MessageProps {
  message: messageSchema;
  lastSeenMessageId?: string | null;
}

const Message = ({ message, lastSeenMessageId }: MessageProps) => {
  const messageRef = useRef<HTMLDivElement>(null);

  const { selectImage, setMessageSeen, contextMenu, showContextMenu } = useChatStore();
  const pageContext = useContext(PageContext);
  const { user } = useAuthStore();

  const isSent = message.senderId === user?._id;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          !message.is_seen &&
          message.receiverId === user?._id
        ) {
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
  }, [message.is_seen, user?._id, message.receiverId, setMessageSeen, message._id]);

  return (
    <div
      ref={messageRef}
      className={`w-full flex ${isSent ? "justify-end" : "justify-start"} items-start`}
    >
      <div className={`flex flex-col gap-1 ${isSent ? "items-end" : "items-start"}`}>
        <div
          className="relative"
          onContextMenu={() => {
            if (message.senderId === user?._id) showContextMenu({ message: message._id });
          }}
        >
          {!message.is_seen && message.receiverId === user?._id && (
            <div className="absolute inset-0 bg-[rgba(81,66,111,0.09)] border-l-2 border-l-[rgba(81,66,111,0.9)] -z-10 rounded-lg" />
          )}

          <div className="relative z-10">
            {message._id === contextMenu && <ContextMenu message={message} />}

            {message.attachments && (
              <div>
                <img
                  src={message.attachments}
                  alt="photoattachment"
                  className={`${
                    pageContext && pageContext.screen.width < 500
                      ? "max-w-48 max-h-38"
                      : "max-w-52 max-h-42"
                  } object-cover rounded-lg bg-spec-1-dark p-0.5 cursor-pointer ${
                    message.content === ""
                      ? isSent
                        ? "rounded-br-none"
                        : "rounded-bl-none"
                      : ""
                  }`}
                  onClick={() => selectImage(message.attachments)}
                />
                {!message.content && (
                  <div
                    className={`flex items-center gap-2 mt-0.5 ${
                      isSent ? "justify-end" : ""
                    }`}
                  >
                    <p
                      className={`text-label-text text-xs ${
                        isSent ? "text-right" : "text-left"
                      }`}
                    >
                      {getHM({ timestamp: message.createdAt })}
                    </p>
                    {isSent && message._id === lastSeenMessageId && message.is_seen && (
                      <CheckCircle size={16} className="text-label-text" />
                    )}
                  </div>
                )}
              </div>
            )}

            {message.content !== "" && (
              <div
                className={`px-2.5 py-2 bg-spec-1-dark text-input-text rounded-lg max-w-96 break-words ${
                  isSent ? "rounded-br-none" : "rounded-bl-none"
                }`}
              >
                <p
                  className={`${
                    pageContext && pageContext?.screen.width < 500
                      ? "max-w-30"
                      : "max-w-84"
                  }`}
                >
                  {message.content}
                </p>

                <div className={`flex items-center gap-2 ${isSent ? "justify-end" : ""}`}>
                  <p
                    className={`text-label-text text-xs ${
                      isSent ? "text-right" : "text-left"
                    }`}
                  >
                    {getHM({ timestamp: message.createdAt })}
                  </p>

                  {isSent && message._id === lastSeenMessageId && message.is_seen && (
                    <CheckCircle size={16} className="text-label-text" />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
