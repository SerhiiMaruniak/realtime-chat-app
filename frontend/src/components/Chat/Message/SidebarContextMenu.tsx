import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../../../store/useChatStore";
import type userSchema from "../../../lib/schemas/userSchema";
import { useFriendsStore } from "../../../store/useFriendsStore";
import Loader from "../../Loader";

interface ContextProps {
  user: userSchema;
}

const SidebarContextMenu = ({ user }: ContextProps) => {
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const contextRef = useRef<HTMLDivElement | null>(null);

  const { sidebarContextMenu, showSidebarContextMenu } = useChatStore();
  const { deleteFriend, isDeletingFriend } = useFriendsStore();

  useEffect(() => {
    if (!sidebarContextMenu) return;

    const calculatePosition = () => {
      const current = contextRef.current;
      if (!current) return;

      const { offsetWidth, offsetHeight } = current;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const clickX = sidebarContextMenu.offsetX ?? 0;
      const clickY = sidebarContextMenu.offsetY ?? 0;

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
  }, [sidebarContextMenu]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextRef.current && !contextRef.current.contains(event.target as Node)) {
        showSidebarContextMenu(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        showSidebarContextMenu(null);
      }
    };

    if (sidebarContextMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [sidebarContextMenu, showSidebarContextMenu]);

  if (!sidebarContextMenu) return null;

  return (
    <div
      id="context_menu"
      ref={contextRef}
      className="absolute z-50 px-1.5 py-2 bg-spec-1 rounded-md animate-slidedown"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className="flex flex-col items-start">
        <button
          className="w-38 text-left px-1.5 py-1 cursor-pointer text-label-text hover:bg-label-text hover:text-spec-1 rounded-sm"
          onClick={() => deleteFriend(user._id)}
        >
          {isDeletingFriend ? <Loader /> : "Delete Friend"}
        </button>
      </div>
    </div>
  );
};

export default SidebarContextMenu;
