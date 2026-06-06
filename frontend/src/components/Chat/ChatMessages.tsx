import { useEffect, useLayoutEffect, useRef, useCallback, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import ChatMessageRow from "./ChatMessageRow";
import ChatScrollToBottomButton from "./ChatScrollToBottomButton";
import Loader from "../Loader";
import { getDayLabel } from "../../lib/formatDate";
import { MessageRefsContext } from "../../context/MessageRefsContext";

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
            <ChatMessageRow
              key={message._id}
              message={message}
              showDate={showDate}
              currentDate={currentDate}
              showUnreadSeparator={showUnreadSeparator}
              unreadCount={unreadCount}
              userId={user?._id}
              lastSeenMessageId={lastSeenMessageId}
              messageRefs={messageRefs}
            />
          );
        })}

        <div ref={endOfMessagesRef} />
      </div>

      {showScrollToBottom && (
        <ChatScrollToBottomButton
          onClick={() =>
            endOfMessagesRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "end",
            })
          }
        />
      )}
    </MessageRefsContext.Provider>
  );
};

export default ChatMessages;
