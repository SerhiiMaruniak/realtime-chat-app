import { useContext, useState } from "react";
import { useChatStore } from "../../../store/useChatStore";
import { PageContext } from "../../../context/PageContext";

const ExpandedImage = () => {
  const [zoomedIn, setZoomedIn] = useState(false);

  const { closeImage, selectedImage } = useChatStore();
  const pageContext = useContext(PageContext);

  return (
    <div
      className="absolute z-20 w-full h-screen bg-[rgba(0,0,0,0.5)] flex justify-center items-center cursor-pointer"
      onClick={closeImage}
    >
      <img
        src={selectedImage ? selectedImage : ""}
        alt="expanded_message_image"
        className={`${
          pageContext && pageContext.screen.width < 500 ? "max-w-2xs" : "max-w-md"
        } animate-zoomin ${zoomedIn ? "scale-125 cursor-zoom-out" : "cursor-zoom-in"}`}
        onClick={(e) => {
          e.stopPropagation();
          setZoomedIn((prev) => !prev);
        }}
      />
    </div>
  );
};

export default ExpandedImage;
