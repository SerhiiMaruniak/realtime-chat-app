import React from "react";

const AddFriends = () => {
  return (
    <div className="w-full h-full flex flex-col justify-start items-start p-[52px]">
      <div className="w-full h-auto flex flex-col justify-start items-start gap-[22px]">
        <div className="w-full flex flex-col justify-start items-start gap-2.5">
          <h1 className="text-3xl text-label-brighter-text font-semibold">Add Friend</h1>
          <p className="text-lg text-label-text">
            You can find friends by the username or an ID
          </p>
        </div>
        <div className="w-full">
          <input
            className="w-full h-11 px-2.5 py-3 rounded-sm bg-spec-1-dark outline-label-text placeholder:text-label-text text-white text-sm duration-100 focus:outline"
            placeholder="johndoe or #00000"
            type="text"
          />
          {/* <button>Find a Friend</button> */}
        </div>
      </div>
      <div></div>
    </div>
  );
};

export default AddFriends;
