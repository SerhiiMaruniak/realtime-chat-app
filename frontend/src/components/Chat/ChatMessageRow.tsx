import type { RefObject } from "react";
import type messageSchema from "../../lib/schemas/messageSchema";
import Message from "./Message/Message";

interface ChatMessageRowProps {
  message: messageSchema;
  showDate: boolean;
  currentDate: string;
  showUnreadSeparator: boolean;
  unreadCount: number;
  userId?: string;
  lastSeenMessageId?: string | null;
  messageRefs: RefObject<Record<string, HTMLDivElement | null>>;
}

const ChatMessageRow = ({
  message,
  showDate,
  currentDate,
  showUnreadSeparator,
  unreadCount,
  userId,
  lastSeenMessageId,
  messageRefs,
}: ChatMessageRowProps) => (
  <div className="w-full px-2 flex flex-col items-start">
    {showDate && (
      <div className="my-3 flex items-center w-full">
        <div className="flex-1 border-t border-spec-1" />
        <span className="px-3 text-sm text-label-text">{currentDate}</span>
        <div className="flex-1 border-t border-spec-1" />
      </div>
    )}

    {showUnreadSeparator && unreadCount > 0 && (
      <div className="my-3 flex items-center w-full">
        <div className="flex-1 border-t border-spec-1" />
        <span className="px-3 text-sm text-label-text">
          {`${unreadCount} unread message${unreadCount === 1 ? "" : "s"}`}
        </span>
        <div className="flex-1 border-t border-spec-1" />
      </div>
    )}

    <div
      className="w-full relative"
      ref={(el) => {
        messageRefs.current[message._id] = el ?? null;
      }}
    >
      {!message.is_seen && message.receiverId === userId && (
        <div className="absolute inset-0 left-0 right-0 bg-[rgba(81,66,111,0.09)] border-l-2 border-l-label-text -z-10" />
      )}

      <Message message={message} lastSeenMessageId={lastSeenMessageId} />
    </div>
  </div>
);

export default ChatMessageRow;
