import { useChatStore } from "../../store/useChatStore";
import type messageSchema from "../../lib/schemas/messageSchema";
import toast from "react-hot-toast";
import { useEffect, useRef, useState } from "react";

interface ContextProps {
  message: messageSchema;
}

const ContextMenu = ({ message }: ContextProps) => {
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const contextRef = useRef<HTMLDivElement | null>(null);

  const { deleteMessage, contextMenu, showContextMenu } = useChatStore();

  useEffect(() => {
    if (!contextMenu) return;
    const current = contextRef.current;
    if (!current) return;

    requestAnimationFrame(() => {
      const { offsetWidth, offsetHeight } = current;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = contextMenu.offsetX ?? 0;
      let y = contextMenu.offsetY ?? 0;

      x = x - offsetWidth;
      y = y - offsetHeight;

      if (x < 4) x = 4;
      if (y < 4) y = 4;
      if (x + offsetWidth > viewportWidth - 4) x = viewportWidth - offsetWidth - 4;
      if (y + offsetHeight > viewportHeight - 4) y = viewportHeight - offsetHeight - 4;

      setPosition({ x, y });
    });
  }, [contextMenu]);

  const handleReply = async () => {
    window.dispatchEvent(
      new CustomEvent("startReplyMessage", {
        detail: {
          id: message._id,
          content: message.content,
          attachments: message.content,
        },
      })
    );
    showContextMenu(null);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    toast.success("Copied message");
    showContextMenu(null);
  };

  const handleDelete = () => {
    deleteMessage({ id: message._id });
    showContextMenu(null);
  };

  const handleEdit = () => {
    window.dispatchEvent(
      new CustomEvent("startEditMessage", {
        detail: { id: message._id, content: message.content },
      })
    );
    showContextMenu(null);
  };

  if (!contextMenu) return null;

  return (
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
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ContextMenu;
