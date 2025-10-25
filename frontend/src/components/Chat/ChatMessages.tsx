import { useEffect, useRef } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import Message from "./Message";
import Loader from "../Loader";
import { getDayLabel } from "../../lib/formatDate";

const ChatMessages = () => {
  const { getMessages, isGettingMessages, messages, selectedChat } = useChatStore();
  const { user } = useAuthStore();
  const endOfMessages = useRef<HTMLDivElement>(null);

  const firstLoadRef = useRef(true);

  useEffect(() => {
    getMessages({ id: selectedChat?._id });
  }, [getMessages, selectedChat]);

  useEffect(() => {
    if (!messages) return;

    const behavior = firstLoadRef.current ? "auto" : "smooth";
    endOfMessages.current?.scrollIntoView({ behavior });

    if (firstLoadRef.current) firstLoadRef.current = false;
  }, [messages]);

  const lastSeenMessageId = (() => {
    if (!messages) return null;
    const sentMessages = messages.filter(
      (msg) => msg.senderId === user?._id && msg.is_seen
    );
    if (sentMessages.length === 0) return null;
    return sentMessages[sentMessages.length - 1]._id;
  })();

  if (isGettingMessages) {
    return (
      <div className="w-full flex-1 flex justify-center items-center">
        <Loader size={36} className="text-label-text" />
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <p className="my-auto mx-auto text-lg text-label-text">
        Start your conversation with this user right now
      </p>
    );
  }

  let lastDate: string | null = null;

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const unreadMessages = sortedMessages.filter(
    (msg) => msg.receiverId === user?._id && !msg.is_seen
  );
  const unreadCount = unreadMessages.length;
  const firstUnreadIndex =
    unreadCount > 0
      ? sortedMessages.findIndex((msg) => msg.receiverId === user?._id && !msg.is_seen)
      : -1;

  return (
    <div className="flex-1 px-5 py-2.5 w-full flex flex-col items-start justify-start gap-3.5 overflow-y-auto">
      {sortedMessages.map((message, idx) => {
        const currentDate = getDayLabel(message.createdAt);
        const showDate = currentDate !== lastDate;
        lastDate = currentDate;
        const showUnreadSeparator = idx === firstUnreadIndex;

        return (
          <div key={message._id} className="w-full px-2 flex flex-col items-start">
            {showDate && (
              <div className="my-3 flex items-center w-full">
                <div className="flex-1 border-t border-spec-1-dark" />
                <span className="px-3 text-sm text-label-text">{currentDate}</span>
                <div className="flex-1 border-t border-spec-1-dark" />
              </div>
            )}

            {showUnreadSeparator && unreadCount > 0 && (
              <div className="my-3 flex items-center w-full">
                <div className="flex-1 border-t border-spec-1-dark" />
                <span className="px-3 text-sm text-label-text">{`${unreadCount} unread message${
                  unreadCount === 1 ? "" : "s"
                }`}</span>
                <div className="flex-1 border-t border-spec-1-dark" />
              </div>
            )}

            <div className="w-full relative">
              {!message.is_seen && message.receiverId === user?._id && (
                <div className="absolute inset-0 left-0 right-0 bg-[rgba(81,66,111,0.09)] border-l-2 border-l-label-text -z-10" />
              )}
              <div className="relative z-10">
                <Message message={message} lastSeenMessageId={lastSeenMessageId} />
              </div>
            </div>
          </div>
        );
      })}
      <div ref={endOfMessages}></div>
    </div>
  );
};

export default ChatMessages;
