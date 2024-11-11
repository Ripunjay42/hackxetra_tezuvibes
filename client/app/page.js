"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { auth } from "@/components/firebase/firebaseconfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Header from "@/components/Header";
import StreamChatComponent from "@/components/ChatComponent";
import PostFeed from "@/components/Postfeed";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import GroupClubList from "@/components/GroupClubList";
import { Input } from "@/components/ui/input";
import {
  FaUser,
  FaUserAlt,
  FaUserTag,
  FaEnvelope,
  FaPhone,
  FaInfoCircle,
} from "react-icons/fa";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Creategroup from "@/components/Creategroup";
import Createclub from "@/components/Createclub";

const HomePage = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserID] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [allUserIds, setAllUserIds] = useState([]);
  const [userData, setUserData] = useState(null);
  const userID = localStorage.getItem("userId");
  const [data, setData] = useState({ groups: [], clubs: [] });
  const [error, setError] = useState(null);
  const [groupBar, setGroupBar] = useState(false);

  const post = localStorage.getItem("post");
  const followers = localStorage.getItem("followers");

  function generateRandomNumber(limit) {
    return Math.floor(Math.random() * limit);
  }
  console.log(userID);
  // Fetch data from API
  // Fetch data from API
  const fetchData = async () => {
    try {
      const url = `http://localhost:3001/api/user/${userID}/data`;
      console.log(url);
      const response = await fetch(
        // "http://localhost:3001/api/user/ba22c7f8-dcbd-444b-96a3-d23648524e55/data"
        url
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      setData(result);
      console.log(result);
    } catch (error) {
      setError(error.message);
    }
  };

  // Use useEffect to call fetchData once when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  // Define the asynchronous function to fetch user data
  const fetchUserData = async () => {
    try {
      // Usage example:
      // console.log(generateRandomNumber()); // Outputs a random number between 0 and 15
      // Set "post" if it doesn't exist
      if (localStorage.getItem("post") === null) {
        localStorage.setItem("post", generateRandomNumber(4));
      }

      // Set "followers" if it doesn't exist
      if (localStorage.getItem("followers") === null) {
        localStorage.setItem("followers", generateRandomNumber(16));
      }

      const response = await axios.get(
        `http://localhost:3001/api/auth/usersInfo/${userId}`
      );
      setUserData(response.data.users[0]); // Store fetched data in state
      console.log(response.data.users[0]);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      setLoading(true);
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          setIsAuthenticated(true);
          try {
            const response = await axios.get(
              `http://localhost:3001/api/auth/user/${user.email}`
            );
            setIsRegistered(response.data.exists);
            setUserID(response.data.userId);
            localStorage.setItem("userId", response.data.userId);
            const usersResponse = await axios.get(
              "http://localhost:3001/api/auth/users"
            );
            setAllUserIds(usersResponse.data);
            console.log("alluserIds", usersResponse.data);
            console.log("userId", response.data.userId);
          } catch (error) {
            console.error("Error checking registration status:", error);
          }
        } else {
          setIsAuthenticated(false);
          setIsRegistered(false);
          router.push("/auth");
        }
        setLoading(false);
      });
    };

    checkAuthStatus();
    // Call the function on component load
    fetchUserData();
  }, [router, userId]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("userID");
      setIsAuthenticated(false);
      setIsRegistered(false);
      router.push("/auth");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleMessageClick = () => {
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  return (
    <>
      {isAuthenticated ? (
        <>
          <Header
            handleLogout={handleLogout}
            handleMessageClick={handleMessageClick}
            userId={userId}
            setGroupBar={setGroupBar}
            groupBar={groupBar}
          />
          {/* <Dashboard/> */}
          <div className="w-full h-full flex flex-row gap-4 p-4 bg-slate-100">
            <div className="basis-1/4 flex flex-col gap-4">
              <div className="flex flex-col p-4 bg-white rounded-lg ">
                <div className="w-100 flex bg-slate-200 mb-10 rounded-lg ">
                  <img
                    src="https://github.com/shadcn.png"
                    className="w-20 h-20 mx-auto object-cover rounded-full mt-10 -mb-10 border-8 border-white"
                    alt="profile pic"
                  />
                </div>
                {/* profile name */}
                <h3 className="text-center font-bold text-lg">
                  {userData?.firstName} {userData?.lastName}
                </h3>
                {/* username */}
                <h4 className="text-center font-normal text-sm text-gray-400">
                  @{userData?.username}
                </h4>
                {/* bio */}
                <p className="text-center text-base">{userData?.bio}</p>
                {/* friends counter */}
                {/* post counter */}
                <div className="flex flex-row text-center bg-slate-100 p-4 my-4 rounded-lg divide-x">
                  <div className="basis-1/2 ">
                    <span className="text-xl font-extrabold">{post}</span>
                    <br />
                    posts
                  </div>
                  <div className="basis-1/2">
                    <span className="text-xl font-extrabold">{followers}</span>
                    <br />
                    followers
                  </div>
                </div>
                {/* my profile button  */}

                <Dialog>
                  <DialogTrigger asChild>
                    <Button>My Profile</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>User Details</DialogTitle>
                      <DialogDescription>
                        <div className="flex flex-col mt-4 gap-4">
                          <div className="flex flex-row gap-4">
                            <div className="relative flex items-center">
                              <FaUser className="absolute left-2 text-gray-400" />
                              <input
                                type="text"
                                value={userData?.firstName}
                                className="pl-8 p-2 border rounded w-full"
                                placeholder="First Name"
                              />
                            </div>
                            <div className="relative flex items-center">
                              <FaUserAlt className="absolute left-2 text-gray-400" />
                              <input
                                type="text"
                                value={userData?.lastName}
                                className="pl-8 p-2 border rounded w-full"
                                placeholder="Last Name"
                              />
                            </div>
                          </div>

                          <div className="relative flex items-center">
                            <FaUserTag className="absolute left-2 text-gray-400" />
                            <input
                              type="text"
                              value={userData?.username}
                              className="pl-8 p-2 border rounded w-full"
                              placeholder="Username"
                            />
                          </div>

                          <div className="relative flex items-center">
                            <FaEnvelope className="absolute left-2 text-gray-400" />
                            <input
                              type="email"
                              value={userData?.email}
                              className="pl-8 p-2 border rounded w-full"
                              placeholder="Email"
                            />
                          </div>

                          <div className="relative flex items-center">
                            <FaPhone className="absolute left-2 text-gray-400" />
                            <input
                              type="text"
                              value={userData?.phoneNumber}
                              className="pl-8 p-2 border rounded w-full"
                              placeholder="Phone Number"
                            />
                          </div>

                          <div className="relative flex items-center">
                            <FaInfoCircle className="absolute left-2 text-gray-400" />
                            <input
                              type="text"
                              value={userData?.bio}
                              className="pl-8 p-2 border rounded w-full"
                              placeholder="Bio"
                            />
                          </div>
                        </div>
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>

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
            {/*  */}
            <div className="basis-1/2 divide-y">
              {" "}
              <PostFeed userId={userId} />
            </div>

            {/*  */}
            {groupBar && (
              <div className="basis-1/4 ">
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
                              {error && (
                                <p className="text-red-500">Error: {error}</p>
                              )}

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
                            {/* <GroupClubList /> */}
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
                            <GroupClubList />
                            <div className="flex flex-col gap-4">
                              {error && (
                                <p className="text-red-500">Error: {error}</p>
                              )}

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
            )}
          </div>

          {isChatOpen && (
            <>
              chat
              <div className="chat-overlay">
                <div className="chat-popup">
                  <button className="close-btn" onClick={closeChat}>
                    X
                  </button>
                  <StreamChatComponent
                    userId={userId}
                    allUserIds={allUserIds}
                  />
                </div>
                <div className="backdrop" onClick={closeChat} />
              </div>
            </>
          )}
        </>
      ) : null}
    </>
  );
};

export default HomePage;
