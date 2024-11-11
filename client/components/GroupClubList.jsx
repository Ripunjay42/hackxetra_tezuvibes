import React from "react";

const GroupClubList = () => {
  // This will use props to show data
  return (
    <div className="flex flex-col gap-4">
      {/* map this div to show all the result */}
      <div className="flex flex-row p-3 rounded-lg border gap-3 items-center justify-start">
        <img
          src="https://github.com/shadcn.png"
          className="w-10 h-10  object-cover rounded-full "
          alt="profile pic"
        />
        <h3 className="text-center font-bold text-md">Group Name 1</h3>
      </div>
    </div>
  );
};

export default GroupClubList;
