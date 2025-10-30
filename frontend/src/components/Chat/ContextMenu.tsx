// import React from "react";

import { useChatStore } from "../../store/useChatStore";

interface ContextProps {
  messageId: string;
}

const ContextMenu = ({ messageId }: ContextProps) => {
  const { deleteMessage } = useChatStore();

  return (
    <div
      id="context_menu"
      className="absolute -translate-full top-2 -left-1 px-1.5 py-2 bg-spec-1-dark rounded-md"
    >
      <div className="flex flex-col items-start">
        <button className="w-38 text-left px-1.5 py-1 cursor-pointer text-label-text hover:bg-label-text hover:text-spec-1-dark rounded-sm">
          Edit
        </button>
        <button
          className="w-38 text-left px-1.5 py-1 cursor-pointer text-label-text hover:bg-label-text hover:text-spec-1-dark rounded-sm"
          onClick={() => deleteMessage({ id: messageId })}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ContextMenu;
