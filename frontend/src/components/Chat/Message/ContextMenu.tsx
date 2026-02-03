import { useChatStore } from "../../../store/useChatStore";
import type messageSchema from "../../../lib/schemas/messageSchema";
import toast from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAuthStore } from "../../../store/useAuthStore";

interface ContextProps {
  message: messageSchema;
}

const ContextMenuPortal = ({ children }: { children: React.ReactNode }) => {
  return createPortal(children, document.body);
};

const ContextMenu = ({ message }: ContextProps) => {
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const contextRef = useRef<HTMLDivElement | null>(null);

  const { deleteMessage, contextMenu, showContextMenu } = useChatStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!contextMenu) return;

    const calculatePosition = () => {
      const current = contextRef.current;
      if (!current) return;

      const { offsetWidth, offsetHeight } = current;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const clickX = contextMenu.offsetX ?? 0;
      const clickY = contextMenu.offsetY ?? 0;

      let x = clickX;
      let y = clickY;

      if (x + offsetWidth > viewportWidth - 4) {
        x = viewportWidth - offsetWidth - 4;
      }

      if (y + offsetHeight > viewportHeight - 4) {
        y = viewportHeight - offsetHeight - 4;
      }

      if (x < 4) x = 4;
      if (y < 4) y = 4;

      setPosition({ x, y });
    };

    requestAnimationFrame(calculatePosition);
  }, [contextMenu]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextRef.current && !contextRef.current.contains(event.target as Node)) {
        showContextMenu(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        showContextMenu(null);
      }
    };

    if (contextMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [contextMenu, showContextMenu]);

  const handleReply = async () => {
    window.dispatchEvent(
      new CustomEvent("startReplyMessage", {
        detail: {
          id: message._id,
          content: message.content,
          attachments: message.attachments,
        },
      }),
    );
    showContextMenu(null);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast.success("Copied message");
    } catch {
      toast.error("Failed to copy message");
    }
    showContextMenu(null);
  };

  const handleDelete = () => {
    deleteMessage(message._id);
    showContextMenu(null);
  };

  const handleEdit = () => {
    window.dispatchEvent(
      new CustomEvent("startEditMessage", {
        detail: { id: message._id, content: message.content },
      }),
    );
    showContextMenu(null);
  };

  if (!contextMenu) return null;

  return (
    <ContextMenuPortal>
      <div
        id="context_menu"
        ref={contextRef}
        className="absolute z-50 px-1.5 py-2 bg-secondary_dark rounded-md animate-slidedown"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        <div className="flex flex-col items-start">
          <button
            className="w-38 text-left px-1.5 py-1 cursor-pointer text-label-text hover:bg-label-text hover:text-spec-1-dark rounded-sm"
            onClick={handleReply}
          >
            Reply
          </button>
          <button
            className="w-38 text-left px-1.5 py-1 cursor-pointer text-label-text hover:bg-label-text hover:text-spec-1-dark rounded-sm"
            onClick={handleEdit}
            style={{
              display: user?._id === message.receiverId ? "none" : "block",
            }}
          >
            Edit
          </button>
          <button
            className="w-38 text-left px-1.5 py-1 cursor-pointer text-label-text hover:bg-label-text hover:text-spec-1-dark rounded-sm"
            onClick={handleCopy}
          >
            Copy
          </button>
          <button
            className="w-38 text-left px-1.5 py-1 cursor-pointer text-label-text hover:bg-label-text hover:text-spec-1-dark rounded-sm"
            onClick={handleDelete}
            style={{
              display: user?._id === message.receiverId ? "none" : "block",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </ContextMenuPortal>
  );
};

export default ContextMenu;
