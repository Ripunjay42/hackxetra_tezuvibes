import React from "react";
import { BsTextareaT } from "react-icons/bs";
import { MdOutlineMenu } from "react-icons/md";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IoSearchOutline } from "react-icons/io5";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import Navbar from "./Navbar";

const Header = () => {
  return (
    <div className="w-full px-4 mx-auto py-4 border-b flex flex-row justify-between items-center bg-white">
      <div className="basis-1/4 flex items-center gap-2">
        <BsTextareaT className="flex-none w-[32px] h-[32px] cursor-pointer" />
        <h2 className="flex-auto text-[24px] font-bold cursor-pointer">
          TezuVibe
        </h2>
      </div>

      {/* Navbar will be hidden on small screens (e.g., mobile) */}
      <div className="basis-1/2 mx-auto hidden md:flex">
        <Navbar />
      </div>

      <div className="basis-1/4 flex justify-end gap-2">
        {/* Input and button hidden on small screens */}
        <div className="hidden md:flex gap-2">
          <Input placeholder="Search Here" />
          <Button>
            <IoSearchOutline />
          </Button>
        </div>

        {/* Avatar and dropdown menu are always visible */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Log Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="block sm:hidden">
          <Sheet>
            <SheetTrigger>
              <Button className="cursor-pointer">
                <MdOutlineMenu />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Are you absolutely sure?</SheetTitle>
                <SheetDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};

export default Header;
