// frontend/components/Header.js
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BsTextareaT } from "react-icons/bs";
import { IoSearchOutline } from "react-icons/io5";
import { FiMenu } from "react-icons/fi"; // Menu icon for mobile
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "./Navbar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Header = ({
  handleLogout,
  userId,
  handleMessageClick,
  setGroupBar,
  groupBar,
}) => {
  const [menuOpen, setMenuOpen] = useState(false); // State to control mobile menu
  const router = useRouter();

  return (
    <div className="container-full px-4 lg:px-12 py-4 border-b flex items-center justify-between">
      <div className="flex items-center gap-2">
        <BsTextareaT
          onClick={() => router.push("/")}
          className="w-8 h-8 cursor-pointer"
        />
        <h2
          className="text-xl lg:text-2xl font-bold cursor-pointer"
          onClick={() => router.push("/")}
        >
          TezuVibe
        </h2>
      </div>

      {/* Navbar for larger screens */}
      <div className="hidden lg:flex">
        <Navbar
          handleLogout={handleLogout}
          userId={userId}
          handleMessageClick={handleMessageClick}
          setGroupBar={setGroupBar}
          groupBar={groupBar}
        />
      </div>

      {/* Search, Avatar, and Menu Toggle for Mobile */}
      <div className="flex items-center gap-2">
        <Input placeholder="Search Here" className="hidden lg:inline-block" />
        <Button className="hidden lg:inline-block">
          <IoSearchOutline />
        </Button>

        {/* Mobile Menu Icon */}
        <FiMenu
          className="lg:hidden w-8 h-8 cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
        />

        {/* Avatar Dropdown for larger screens */}
        <DropdownMenu>
          <DropdownMenuTrigger className="hidden lg:flex">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleLogout}>Log Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-white shadow-md p-4">
          <Navbar handleLogout={handleLogout} />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-500 mt-4"
          >
            Log Out
          </DropdownMenuItem>
        </div>
      )}
    </div>
  );
};

export default Header;
