// import React from "react";

import { useChatStore } from "../../store/useChatStore";
import type messageSchema from "../../lib/schemas/messageSchema";
import toast from "react-hot-toast";

interface ContextProps {
  message: messageSchema;
}

const ContextMenu = ({ message }: ContextProps) => {
  const { deleteMessage, showContextMenu } = useChatStore();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    toast.success("Copied message");
    showContextMenu({ message: null });
  };

  const handleDelete = () => {
    deleteMessage({ id: message._id });
    showContextMenu({ message: null });
  };

  const handleEdit = () => {
    window.dispatchEvent(
      new CustomEvent("startEditMessage", {
        detail: { id: message._id, content: message.content },
      })
    );
    showContextMenu({ message: null });
  };

  return (
    <div
      id="context_menu"
      className="absolute -translate-full top-2 -left-1 px-1.5 py-2 bg-spec-1-dark rounded-md animate-slidedown"
    >
      <div className="flex flex-col items-start">
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
