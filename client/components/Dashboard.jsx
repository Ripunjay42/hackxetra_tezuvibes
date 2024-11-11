import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IoSendOutline } from "react-icons/io5";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IoIosImages } from "react-icons/io";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Createclub from "../components/Createclub";
import Creategroup from "../components/Creategroup";
import GroupClubList from "../components/GroupClubList";
import { ScrollArea } from "@/components/ui/scroll-area";
// import Post from "../components/Post";
import PostFeed from "@/components/Postfeed";

const Dashboard = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const userID = localStorage.getItem("userID");
  const [data, setData] = useState({ groups: [], clubs: [] });
  const [error, setError] = useState(null);

  // Fetch data from API
  const fetchData = async () => {
    try {
      const response = await fetch(
        // "http://localhost:3001/api/user/ba22c7f8-dcbd-444b-96a3-d23648524e55/data"
        "http://localhost:3001/api/user/" + userID + "/data"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      setError(error.message);
    }
  };

  // Use useEffect to call fetchData once when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  const triggerPopup = () => {
    setIsDialogOpen(true); // Open the dialog on div click
  };

  return (
    <div className="w-full h-full flex flex-row gap-4 p-4 bg-slate-100">
      {/* 
        left part side
        left part side
        left part side
        left part side
        left part side
      */}
      <div className="basis-1/4 flex flex-col gap-4">
        {/* sidebar div */}
        <div className="flex flex-col p-4 bg-white rounded-lg ">
          <div className="w-100 flex bg-slate-200 mb-10 rounded-lg ">
            <img
              src="https://github.com/shadcn.png"
              className="w-20 h-20 mx-auto object-cover rounded-full mt-10 -mb-10 border-8 border-white"
              alt="profile pic"
            />
          </div>
          {/* profile name */}
          <h3 className="text-center font-bold text-lg">Name</h3>
          {/* username */}
          <h4 className="text-center font-normal text-sm text-gray-400">
            @username
          </h4>
          {/* bio */}
          <p className="text-center text-base">Honesty is the best policy.</p>
          {/* friends counter */}
          {/* post counter */}
          <div className="flex flex-row text-center bg-slate-100 p-4 my-4 rounded-lg divide-x">
            <div className="basis-1/2 ">
              <span className="text-xl font-extrabold">8</span>
              <br />
              posts
            </div>
            <div className="basis-1/2">
              <span className="text-xl font-extrabold">22</span>
              <br />
              followers
            </div>
          </div>
          {/* my profile button  */}
          <Button>My Profile</Button>

          <div></div>
        </div>
        <div className="flex flex-col p-4 bg-white rounded-lg gap-4">
          <h3 className=" font-bold text-lg">Your Upcoming Events</h3>
          <Button>View All</Button>
          <ScrollArea className="h-[250px] w-100">
            <GroupClubList />
          </ScrollArea>
          {/* view all button  */}
          <div className="w-100 flex flex-row justify-between gap-4">
            <Button className="basis-1/2">View All</Button>
            <Button className="basis-1/2">Create New</Button>
          </div>
        </div>
      </div>

      {/* 
      middle part side
      middle part side
      middle part side
      middle part side
      middle part side
      */}
      <div className="basis-1/2 divide-y">
        {/* Dialog component */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        {/* post trigger popup */}
        <div className="flex flex-col gap-4">
          <div
            className=" w-100 bg-white p-3 rounded-lg my-auto"
            onClick={triggerPopup}
          >
            {/* post popup-trigger */}
            <div className="w-100 flex flex-row gap-3 items-center justify-start">
              <img
                src="https://github.com/shadcn.png"
                className="w-10 h-10 object-cover rounded-full "
                alt="profile pic"
              />

              <Input type="text" placeholder="Say Something..." />
              <IoIosImages className="w-10 h-10" />
              <Button>
                <IoSendOutline />
              </Button>
            </div>
          </div>
          {/* Show Feed here and other element here */}
          <div className="w-100">
            <ScrollArea className="h-[78vh] w-100">
              <PostFeed />
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Right Part side
      Right Part side
      Right Part side
      Right Part side */}
      <div className="basis-1/4 ">
        {/* events div */}
        <div className="bg-white rounded-lg p-4">
          <Tabs defaultValue="groups" className="w-100">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="groups">Groups</TabsTrigger>
              <TabsTrigger value="clubs">Clubs</TabsTrigger>
            </TabsList>
            <TabsContent value="groups">
              <Card>
                <div className="flex flex-col gap-4 space-y-1 p-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>Create New Group</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Enter Group Details</DialogTitle>
                        <DialogDescription>
                          <Creategroup />
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                  {/* Map data ot it and Pass props to this component to render the list of the  */}

                  <ScrollArea className="h-[300px] w-100">
                    <div className="flex flex-col gap-4">
                      {error && <p className="text-red-500">Error: {error}</p>}

                      {/* Render Groups */}

                      {data.groups.length ? (
                        data.groups.map((group) => (
                          <div
                            key={group.id}
                            className="flex flex-row p-3 rounded-lg border gap-3 items-center justify-start"
                          >
                            <img
                              src={
                                group.groupURL ||
                                "https://via.placeholder.com/40"
                              }
                              className="w-10 h-10 object-cover rounded-full"
                              alt="group profile pic"
                            />
                            <h3 className="text-center font-bold text-md">
                              {group.name}
                            </h3>
                          </div>
                        ))
                      ) : (
                        <p>No groups found</p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </Card>
            </TabsContent>
            <TabsContent value="clubs">
              <Card>
                <div className="flex flex-col gap-4 space-y-1 p-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>Create New Club</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Enter Club Details</DialogTitle>
                        <DialogDescription>
                          <Createclub />
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                  {/* Map data ot it and Pass props to this component to render the list of the  */}
                  <ScrollArea className="h-[250px] w-100">
                    <div className="flex flex-col gap-4">
                      {data.clubs.length ? (
                        data.clubs.map((club) => (
                          <div
                            key={club.id}
                            className="flex flex-row p-3 rounded-lg border gap-3 items-center justify-start"
                          >
                            <img
                              src={
                                club.coverImage ||
                                "https://via.placeholder.com/40"
                              }
                              className="w-10 h-10 object-cover rounded-full"
                              alt="club profile pic"
                            />
                            <h3 className="text-center font-bold text-md">
                              {club.name}
                            </h3>
                          </div>
                        ))
                      ) : (
                        <p>No clubs found</p>
                      )}
                    </div>
                  </ScrollArea>

                  <h3 className=" font-bold text-lg">Groups & Clubs</h3>
                  {/* Map data ot it and Pass props to this component to render the list of the  */}
                  <ScrollArea className="h-[250px] w-100">
                    <GroupClubList />
                  </ScrollArea>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
