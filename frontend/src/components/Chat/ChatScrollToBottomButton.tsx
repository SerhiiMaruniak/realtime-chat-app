import { ArrowDown } from "lucide-react";

interface ChatScrollToBottomButtonProps {
  onClick: () => void;
}

const ChatScrollToBottomButton = ({ onClick }: ChatScrollToBottomButtonProps) => (
  <button
    onClick={onClick}
    aria-label="Scroll to latest messages"
    className="fixed right-5 bottom-18 z-50 bg-secondary_dark/40 text-white p-2 rounded-full hover:bg-label-text/50 transition-colors cursor-pointer"
  >
    <ArrowDown />
  </button>
);

export default ChatScrollToBottomButton;
