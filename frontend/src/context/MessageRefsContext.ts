import { createContext } from "react";

interface RefsProps {
  messageRefs: React.RefObject<Record<string, HTMLDivElement | null>>;
  moveToMessage: (messageId: string) => void;
  intersectedMessageId: string | null;
  setIntersectedMessageId: (id: string | null) => void;
}

export const MessageRefsContext = createContext<RefsProps | null>(null);
