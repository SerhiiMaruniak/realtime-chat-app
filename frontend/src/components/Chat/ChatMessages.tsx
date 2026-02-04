import { useState, useEffect, useRef, useCallback } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import Message from "./Message/Message";
import Loader from "../Loader";
import { getDayLabel } from "../../lib/formatDate";
import { MessageRefsContext } from "../../context/MessageRefsContext";
import AxiosInstance from "../../lib/axiosInstance";
import type messageSchema from "../../lib/schemas/messageSchema";
import type GetMessagesResponse from "../../lib/schemas/messagesResponseSchema";

const ChatMessages = () => {
  const [intersectedMessageId, setIntersectedMessageId] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastId, setLastId] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<messageSchema[]>([]);

  const endOfMessages = useRef<HTMLDivElement>(null);
  const startOfMessages = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const firstLoadRef = useRef(true);
  const hasScrolledRef = useRef(false);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  const { isGettingMessages, selectedChat, subscribeMessages, unsubscribeMessages } =
    useChatStore();
  const { user } = useAuthStore();

  useEffect(() => {
    subscribeMessages();

    return () => {
      unsubscribeMessages();
    };
  }, [subscribeMessages, unsubscribeMessages]);

  useEffect(() => {
    if (!selectedChat?._id) return;

    hasScrolledRef.current = false;

    const initialFetch = async () => {
      try {
        const response = await AxiosInstance.get<GetMessagesResponse>(
          `/messages/get-messages/${selectedChat._id}`,
        );
        setLocalMessages(response.data.messages);
        setHasMore(response.data.hasMore);
        setLastId(response.data.lastId);
        firstLoadRef.current = false;
      } catch (error) {
        console.error("Error fetching initial messages:", error);
      }
    };

    initialFetch();
    setLastId(null);
    setHasMore(true);
    firstLoadRef.current = true;
  }, [selectedChat?._id]);

  useEffect(() => {
    if (!localMessages || localMessages.length === 0 || hasScrolledRef.current) return;

    requestAnimationFrame(() => {
      endOfMessages.current?.scrollIntoView({ behavior: "auto" });
      hasScrolledRef.current = true;
    });
  }, [localMessages]);

  const loadOlderMessages = useCallback(async () => {
    if (!selectedChat?._id || isLoadingMore || !hasMore || !lastId) return;

    setIsLoadingMore(true);

    const scrollContainer = messagesContainerRef.current;
    const scrollHeightBefore = scrollContainer?.scrollHeight ?? 0;
    const scrollTopBefore = scrollContainer?.scrollTop ?? 0;

    try {
      const response = await AxiosInstance.get<GetMessagesResponse>(
        `/messages/get-messages/${selectedChat._id}`,
        {
          params: { lastId },
        },
      );

      setLocalMessages((prev) => [...response.data.messages, ...prev]);
      setHasMore(response.data.hasMore);
      setLastId(response.data.lastId);

      requestAnimationFrame(() => {
        if (scrollContainer) {
          const scrollHeightAfter = scrollContainer.scrollHeight;
          const newScrollHeight = scrollHeightAfter - scrollHeightBefore;
          scrollContainer.scrollTop = scrollTopBefore + newScrollHeight;
        }
      });
    } catch (error) {
      console.error("Error loading older messages:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [selectedChat?._id, isLoadingMore, hasMore, lastId]);

  useEffect(() => {
    if (isLoadingMore || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoadingMore) {
          loadOlderMessages();
        }
      },
      { threshold: 0.1 },
    );

    if (startOfMessages.current) {
      observer.observe(startOfMessages.current);
    }

    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [loadOlderMessages, isLoadingMore, hasMore]);

  const lastSeenMessageId = (() => {
    if (!localMessages) return null;
    const sentMessages = localMessages.filter(
      (msg) => msg.senderId === user?._id && msg.is_seen,
    );
    if (sentMessages.length === 0) return null;
    return sentMessages[sentMessages.length - 1]._id;
  })();

  if (isGettingMessages && firstLoadRef.current) {
    return (
      <div className="w-full flex-1 flex justify-center items-center">
        <Loader size={36} className="text-label-text" />
      </div>
    );
  }

  if (!localMessages || localMessages.length === 0) {
    return (
      <p className="my-auto mx-auto text-lg text-label-text">
        Start your conversation with this user right now
      </p>
    );
  }

  let lastDate: string | null = null;

  const unreadMessages = localMessages.filter(
    (msg) => msg.receiverId === user?._id && !msg.is_seen,
  );
  const unreadCount = unreadMessages.length;
  const firstUnreadIndex =
    unreadCount > 0
      ? localMessages.findIndex((msg) => msg.receiverId === user?._id && !msg.is_seen)
      : -1;

  const moveToMessage = (messageId: string) => {
    const message = messageRefs.current[messageId];
    if (!message) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.unobserve(message);
          setIntersectedMessageId(messageId);
          setTimeout(() => setIntersectedMessageId(null), 1500);
        }
      },
      {
        threshold: 0.5,
      },
    );

    observer.observe(message);

    message.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <MessageRefsContext.Provider
      value={{ messageRefs, moveToMessage, intersectedMessageId }}
    >
      <div
        ref={messagesContainerRef}
        className="flex-1 px-3 py-2.5 w-full flex flex-col items-start justify-start gap-3.5 overflow-y-auto"
      >
        <div ref={startOfMessages} />

        {isLoadingMore && (
          <div className="w-full flex justify-center my-2">
            <Loader size={24} className="text-label-text" />
          </div>
        )}

        {localMessages.map((message, idx) => {
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
    </MessageRefsContext.Provider>
  );
};

export default ChatMessages;
