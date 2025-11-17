import Sidebar from "../components/Chat/Sidebar";
import Chat from "../components/Chat/Chat";
import { useChatStore } from "../store/useChatStore";
import { PageContext } from "../context/PageContext";
import { useContext } from "react";
import ExpandedImage from "../components/Chat/Message/ExpandedImage";

const Home = () => {
  const { selectedImage, selectedChat } = useChatStore();
  const pageContext = useContext(PageContext);

  return (
    <>
      {selectedImage && <ExpandedImage />}
      <div className="w-full h-full flex">
        {pageContext && pageContext.screen.width < 500 ? (
          !selectedChat && <Sidebar />
        ) : (
          <Sidebar />
        )}
        <Chat />
      </div>
    </>
  );
};

export default Home;
