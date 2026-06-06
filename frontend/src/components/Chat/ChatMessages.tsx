import { useEffect, useLayoutEffect, useRef, useCallback, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import Message from "./Message/Message";
import Loader from "../Loader";
import { getDayLabel } from "../../lib/formatDate";
import { MessageRefsContext } from "../../context/MessageRefsContext";
import { ArrowDown } from "lucide-react";

const ChatMessages = () => {
  const [intersectedMessageId, setIntersectedMessageId] = useState<string | null>(null);

  const {
    messages,
    selectedChat,
    hasMore,
    lastId,
    isGettingMessages,
    getMessages,
    subscribeMessages,
    unsubscribeMessages,
  } = useChatStore();

  const { user } = useAuthStore();

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const startOfMessagesRef = useRef<HTMLDivElement>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const bottomObserverRef = useRef<IntersectionObserver | null>(null);
  const isInitialLoadRef = useRef(true);
  const firstUnreadIndexRef = useRef<number | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  useEffect(() => {
    subscribeMessages();
    return () => unsubscribeMessages();
  }, [subscribeMessages, unsubscribeMessages]);

  useEffect(() => {
    if (!selectedChat?._id) return;

    isInitialLoadRef.current = true;
    firstUnreadIndexRef.current = null;

    getMessages(selectedChat._id);
  }, [selectedChat?._id, getMessages]);

  const loadOlderMessages = useCallback(async () => {
    if (!selectedChat?._id || !hasMore || !lastId) return;

    const scrollContainer = messagesContainerRef.current;
    const scrollHeightBefore = scrollContainer?.scrollHeight ?? 0;
    const scrollTopBefore = scrollContainer?.scrollTop ?? 0;

    await getMessages(selectedChat._id, true);

    requestAnimationFrame(() => {
      if (scrollContainer) {
        const scrollHeightAfter = scrollContainer.scrollHeight;
        scrollContainer.scrollTop =
          scrollTopBefore + (scrollHeightAfter - scrollHeightBefore);
      }
    });
  }, [selectedChat?._id, hasMore, lastId, getMessages]);

  useEffect(() => {
    if (!startOfMessagesRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore) loadOlderMessages();
      },
      { threshold: 0.1 },
    );

    observer.observe(startOfMessagesRef.current);
    observerRef.current = observer;

    return () => observer.disconnect();
  }, [loadOlderMessages, hasMore]);

  useLayoutEffect(() => {
    if (!messages || messages.length === 0) return;
    if (!user?._id) return;

    const container = messagesContainerRef.current;
    if (!container) return;

    if (firstUnreadIndexRef.current === null) {
      firstUnreadIndexRef.current = messages.findIndex(
        (msg) => msg.receiverId === user._id && !msg.is_seen,
      );
    }

    const scrollBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    const nearBottom = scrollBottom < 150;

    const firstUnreadIndex = firstUnreadIndexRef.current;

    let scrollTarget: HTMLDivElement | null = null;

    if (firstUnreadIndex >= 0 && isInitialLoadRef.current) {
      scrollTarget = messageRefs.current[messages[firstUnreadIndex]._id] ?? null;
    } else if (isInitialLoadRef.current || nearBottom) {
      scrollTarget = endOfMessagesRef.current ?? null;
    }

    if (scrollTarget) {
      requestAnimationFrame(() => {
        scrollTarget?.scrollIntoView({
          behavior: "auto",
          block: "start",
        });

        isInitialLoadRef.current = false;
      });
    }
  }, [messages, user?._id]);

  const lastSeenMessageId = messages
    ?.filter((msg) => msg.senderId === user?._id && msg.is_seen)
    .pop()?._id;

  const unreadMessages = messages?.filter(
    (msg) => msg.receiverId === user?._id && !msg.is_seen,
  );

  const unreadCount = unreadMessages?.length ?? 0;

  const firstUnreadIndex =
    unreadCount > 0
      ? (messages?.findIndex((msg) => msg.receiverId === user?._id && !msg.is_seen) ?? -1)
      : -1;

  const moveToMessage = async (messageId: string) => {
    const { selectedChat, loadUntilMessage } = useChatStore.getState();
    if (!selectedChat?._id) return;

    const messageEl = messageRefs.current[messageId];

    if (!messageEl) {
      await loadUntilMessage(selectedChat._id, messageId);
    }

    const waitForDom = () => {
      const el = messageRefs.current[messageId];

      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        setIntersectedMessageId(messageId);

        setTimeout(() => {
          setIntersectedMessageId(null);
        }, 2000);

        return;
      }

      requestAnimationFrame(waitForDom);
    };

    waitForDom();
  };

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!messages || messages.length === 0) {
      setShowScrollToBottom(false);
      return;
    }

    const lastThree = messages.slice(-3);
    const ids = lastThree.map((m) => m._id);

    const observer = new IntersectionObserver(
      (entries) => {
        const anyVisible = entries.some((e) => e.isIntersecting);
        setShowScrollToBottom(!anyVisible);
      },
      {
        root: container,
        threshold: 0.5,
      },
    );

    ids.forEach((id) => {
      const el = messageRefs.current[id];
      if (el) observer.observe(el);
    });

    bottomObserverRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [messages]);

  if (isGettingMessages && isInitialLoadRef.current) {
    return (
      <div className="w-full flex-1 flex justify-center items-center">
        <Loader size={36} className="text-label-text" />
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <p className="my-auto mx-auto text-center text-lg text-label-text">
        Start your conversation with this user right now
      </p>
    );
  }

  let lastDate: string | null = null;

  return (
    <MessageRefsContext.Provider
      value={{
        messageRefs,
        moveToMessage,
        intersectedMessageId,
        setIntersectedMessageId,
      }}
    >
      <div
        ref={messagesContainerRef}
        className="relative flex-1 px-3 py-2.5 w-full flex flex-col items-start justify-start gap-3.5 overflow-y-auto"
      >
        <div ref={startOfMessagesRef} />

        {messages.map((message, idx) => {
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
                  <span className="px-3 text-sm text-label-text">
                    {`${unreadCount} unread message${unreadCount === 1 ? "" : "s"}`}
                  </span>
                  <div className="flex-1 border-t border-spec-1-dark" />
                </div>
              )}

              <div
                className="w-full relative"
                ref={(el) => {
                  messageRefs.current[message._id] = el ?? null;
                }}
              >
                {!message.is_seen && message.receiverId === user?._id && (
                  <div className="absolute inset-0 left-0 right-0 bg-[rgba(81,66,111,0.09)] border-l-2 border-l-label-text -z-10" />
                )}

                <Message message={message} lastSeenMessageId={lastSeenMessageId} />
              </div>
            </div>
          );
        })}

        <div ref={endOfMessagesRef} />
      </div>

      {showScrollToBottom && (
        <button
          onClick={() =>
            endOfMessagesRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "end",
            })
          }
          aria-label="Scroll to latest messages"
          className="fixed right-5 bottom-20 z-50 bg-secondary_dark/50 text-white p-2 rounded-full hover:bg-label-text/40 transition-colors cursor-pointer"
        >
          <ArrowDown />
        </button>
      )}
    </MessageRefsContext.Provider>
  );
};

export default ChatMessages;
