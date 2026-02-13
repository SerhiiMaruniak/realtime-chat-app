import { useState } from "react";
import Sidebar from "../components/Chat/Sidebar";
import Chat from "../components/Chat/Chat";
import { useChatStore } from "../store/useChatStore";
import ExpandedImage from "../components/Chat/Message/ExpandedImage";
import Navbar from "../components/Home/Navbar";
import { HomeContext, type HomeContextValue } from "../context/HomeContext";

const Home = () => {
  const [homeContextValue, setHomeContextValue] = useState<HomeContextValue>("Chat");
  const { selectedImage, selectedChat } = useChatStore();

  return (
    <HomeContext.Provider value={{ setHomeContextValue, value: homeContextValue }}>
      {selectedImage && <ExpandedImage />}
      <div className="w-full h-full flex">
        <Sidebar />
        <div className="flex flex-col w-full items-center justify-between">
          {!selectedChat && <Navbar />}
          <Chat />
        </div>
      </div>
    </HomeContext.Provider>
  );
};

export default Home;
