// frontend/components/Navbar.js
import React from "react";
import { useRouter } from "next/navigation";
import { IoHomeOutline } from "react-icons/io5";
import { AiOutlineMessage } from "react-icons/ai";
import { GoPeople } from "react-icons/go";
import { BsCalendar4Event } from "react-icons/bs";
import { IoNotificationsOutline } from "react-icons/io5";
import { RxDashboard } from "react-icons/rx";

const Navbar = ({
  handleLogout,
  handleMessageClick,
  setGroupBar,
  groupBar,
}) => {
  const router = useRouter();

  return (
    <div className="flex gap-24 lg:gap-24 text-gray-600">
      <IoHomeOutline
        className="w-6 h-6 lg:w-6 lg:h-6 cursor-pointer"
        onClick={() => router.push("/")}
      />
      <AiOutlineMessage
        className="w-6 h-6 lg:w-6 lg:h-6 cursor-pointer"
        onClick={handleMessageClick}
      />
      <GoPeople
        className="w-6 h-6 lg:w-6 lg:h-6 cursor-pointer"
        onClick={() => setGroupBar(!groupBar)}
      />
      <BsCalendar4Event
        className="w-6 h-6 lg:w-6 lg:h-6 cursor-pointer"
        onClick={() => router.push("/event")}
      />
      {/* <button
        onClick={handleLogout}
        className="text-red-500 font-semibold lg:hidden" // Show logout only on mobile
      >
        Log Out
      </button> */}
    </div>
  );
};

export default Navbar;
