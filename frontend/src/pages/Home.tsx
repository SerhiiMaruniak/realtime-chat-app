import { useEffect, useState } from "react";
import Sidebar from "../components/Chat/Sidebar";
import Chat from "../components/Chat/Chat";
import { useChatStore } from "../store/useChatStore";
import ExpandedImage from "../components/Chat/Message/ExpandedImage";
import Navbar from "../components/Home/Navbar";
import { HomeContext, type HomeContextValue } from "../context/HomeContext";
import AllFriends from "../components/Friends/AllFriends";
import Requests from "../components/Friends/Requests";
import AddFriends from "../components/Friends/AddFriends";
import { useFriendsStore } from "../store/useFriendsStore";

const Home = () => {
  const [selectedPage, setSelectedPage] = useState<React.JSX.Element>(<Chat />);
  const [homeContextValue, setHomeContextValue] = useState<HomeContextValue>("Chat");
  const { selectedImage, selectedChat } = useChatStore();

  const { subscribeFriends, unsubscribeFriends } = useFriendsStore();

  useEffect(() => {
    switch (homeContextValue) {
      case "All_Friends":
        setSelectedPage(<AllFriends />);
        break;
      case "Requests":
        setSelectedPage(<Requests />);
        break;
      case "Add_Friends":
        setSelectedPage(<AddFriends />);
        break;
      default:
        setSelectedPage(<Chat />);
        break;
    }
  }, [homeContextValue]);

  useEffect(() => {
    subscribeFriends();

    return () => unsubscribeFriends();
  }, [subscribeFriends, unsubscribeFriends]);

  useEffect(() => {
    if (selectedChat) setHomeContextValue("Chat");
  }, [selectedChat]);

  return (
    <HomeContext.Provider value={{ setHomeContextValue, value: homeContextValue }}>
      {selectedImage && <ExpandedImage />}
      <div className="w-full h-full flex">
        <Sidebar />
        <div className="flex flex-col w-full items-start justify-start">
          {!selectedChat && <Navbar />}
          {selectedPage}
        </div>
      </div>
    </HomeContext.Provider>
  );
};

export default Home;
