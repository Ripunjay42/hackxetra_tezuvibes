// Ensure this directive is applied at the top level for client-side components
"use client";
// Importing React and hooks
import React, { useEffect, useState } from "react";

// Next.js routing
import { useRouter } from "next/navigation";

// Firebase imports
import { auth } from "@/components/firebase/firebaseconfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

// Axios for API requests
import axios from "axios";

// Component Imports
import Header from "@/components/Header";
import StreamChatComponent from "@/components/ChatComponent";
import PostFeed from "@/components/Postfeed";
import GroupClubList from "@/components/GroupClubList";
import Creategroup from "@/components/Creategroup";
import Createclub from "@/components/Createclub";

// UI Components and Icons
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Clock,
  MapPin,
  Upload,
  Type,
  List,
  PlusCircle,
} from "lucide-react";
import {
  FaUser,
  FaUserAlt,
  FaUserTag,
  FaEnvelope,
  FaPhone,
  FaInfoCircle,
} from "react-icons/fa";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CreateEventForm = () => {
  const [showEvents, setShowEvents] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    eventname: "",
    location: "",
    eventdate: "",
    startingtime: "",
    endingtime: "",
    description: "",
    poster: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isRsbped, setRbped] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userID");
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const response = await axios.get("http://localhost:3001/api/event/", {
        headers: { userid: userId },
      });
      setEvents(response.data.events);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleView = () => {
    if (!showEvents) {
      fetchEvents();
    }
    setShowEvents(!showEvents);
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }));

      // Create preview URL for the selected image
      if (file) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Clean up preview URL when component unmounts
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSuccess(false);

    const userId = localStorage.getItem("userID");
    if (!userId) {
      setError("User not authenticated");
      return;
    }

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

    try {
      await axios.post("http://localhost:3001/api/event/", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          userid: userId,
        },
      });
      setIsSuccess(true);
      setFormData({
        eventname: "",
        location: "",
        eventdate: "",
        startingtime: "",
        endingtime: "",
        description: "",
        poster: null,
      });
      setPreviewUrl(null);
      if (showEvents) {
        fetchEvents();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRsvp = async (eventId) => {
    const userId = localStorage.getItem("userID");
    if (!userId) {
      setError("User not authenticated");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3001/api/rsbp",
        { eventId: eventId }, // Request body
        {
          headers: {
            "Content-Type": "application/json",
            userid: userId,
          },
        }
      );

      console.log(response.data);
      if (response.data.message === "RSVP created successfully") {
        setRbped(false);
      }
      // You might want to show a success message to the user
      setIsSuccess(true);
    } catch (error) {
      console.error("Error submitting RSVP:", error);
      setError(error.message);
    }
  };

  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userId, setUserID] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [allUserIds, setAllUserIds] = useState([]);
  const [userData, setUserData] = useState(null);

  const [groupBar, setGroupBar] = useState(false);

  const post = localStorage.getItem("post");
  const followers = localStorage.getItem("followers");

  function generateRandomNumber(limit) {
    return Math.floor(Math.random() * limit);
  }
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
            localStorage.setItem("userID", response.data.userId);
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
                  <div className="basis-3/4">
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
            <div className="basis-3/4 divide-y">
              <div className="min-h-screen">
                <div className=" mx-auto px-4">
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Event Management</h1>
                    <Button
                      onClick={handleToggleView}
                      className="flex items-center gap-2"
                      variant="outline"
                    >
                      {showEvents ? (
                        <>
                          <PlusCircle className="w-4 h-4" />
                          Create New Event
                        </>
                      ) : (
                        <>
                          <List className="w-4 h-4" />
                          View All Events
                        </>
                      )}
                    </Button>
                  </div>

                  {showEvents ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {loading ? (
                        <div className="col-span-full text-center py-12">
                          Loading events...
                        </div>
                      ) : events.length > 0 ? (
                        events.map((event) => (
                          <Card
                            key={event.id}
                            className="hover:shadow-lg transition-shadow duration-300"
                          >
                            <CardHeader>
                              <CardTitle className="text-xl font-bold">
                                {event.eventName}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {new Date(event.date).toLocaleDateString()}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {event.eventImageURL ? (
                                  <img
                                    src={
                                      "http://localhost:3001" +
                                      event.eventImageURL
                                    }
                                    alt={
                                      "http://localhost:3001" +
                                      event.eventImageURL
                                    }
                                    className="w-full h-48 object-cover rounded-md"
                                  />
                                ) : (
                                  <div className="w-full h-48 bg-gray-200 rounded-md flex items-center justify-center">
                                    No image available
                                  </div>
                                )}
                                <p className="text-gray-600">
                                  {event.description}
                                </p>
                                <div className="flex items-center gap-2 text-gray-500">
                                  <MapPin className="w-4 h-4" />
                                  {event.location}
                                </div>
                                <div className="flex items-center gap-2 text-gray-500">
                                  <Clock className="w-4 h-4" />
                                  {event.fromTime?.slice(0, 5)} -{" "}
                                  {event.toTime?.slice(0, 5)}
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="text-sm text-gray-500 p-4">
                              Created:{" "}
                              {new Date(event.createdAt).toLocaleDateString()}
                            </CardFooter>
                            <div className="flex justify-center p-4">
                              {isRsbped && (
                                <Button onClick={() => handleRsvp(event.id)}>
                                  RSVP
                                </Button>
                              )}
                              {!isRsbped && (
                                <Button
                                  className="opacity-50 cursor-not-allowed"
                                  disabled
                                >
                                  RSVPED
                                </Button>
                              )}
                            </div>
                          </Card>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-12">
                          No events found
                        </div>
                      )}
                    </div>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-2xl">
                          Create New Event
                        </CardTitle>
                        <CardDescription>
                          Fill in the details to create your event
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Type className="w-4 h-4" />
                              <Label htmlFor="eventname">Event Name</Label>
                            </div>
                            <Input
                              id="eventname"
                              name="eventname"
                              value={formData.eventname}
                              onChange={handleChange}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <Label htmlFor="location">Location</Label>
                            </div>
                            <Input
                              id="location"
                              name="location"
                              value={formData.location}
                              onChange={handleChange}
                              required
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <Label htmlFor="eventdate">Date</Label>
                              </div>
                              <Input
                                type="date"
                                id="eventdate"
                                name="eventdate"
                                value={formData.eventdate}
                                onChange={handleChange}
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <Label htmlFor="startingtime">Start Time</Label>
                              </div>
                              <Input
                                type="time"
                                id="startingtime"
                                name="startingtime"
                                value={formData.startingtime}
                                onChange={handleChange}
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <Label htmlFor="endingtime">End Time</Label>
                              </div>
                              <Input
                                type="time"
                                id="endingtime"
                                name="endingtime"
                                value={formData.endingtime}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              name="description"
                              value={formData.description}
                              onChange={handleChange}
                              className="h-32"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Upload className="w-4 h-4" />
                              <Label htmlFor="poster">Event Poster</Label>
                            </div>
                            <Input
                              type="file"
                              id="poster"
                              name="poster"
                              onChange={handleChange}
                              accept="image/*"
                              required
                            />
                            {previewUrl && (
                              <div className="mt-2">
                                <img
                                  src={previewUrl}
                                  alt="Preview"
                                  className="w-full max-h-48 object-cover rounded-md"
                                />
                              </div>
                            )}
                          </div>

                          {isSuccess && (
                            <Alert className="bg-green-50 border-green-200">
                              <AlertDescription className="text-green-600">
                                Event created successfully!
                              </AlertDescription>
                            </Alert>
                          )}

                          {error && (
                            <Alert className="bg-red-50 border-red-200">
                              <AlertDescription className="text-red-600">
                                Error: {error}
                              </AlertDescription>
                            </Alert>
                          )}

                          <Button type="submit" className="w-full">
                            Create Event
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>

          {isChatOpen && (
            <div className="chat-overlay">
              <div className="chat-popup">
                <button className="close-btn" onClick={closeChat}>
                  X
                </button>
                <StreamChatComponent userId={userId} allUserIds={allUserIds} />
              </div>
              <div className="backdrop" onClick={closeChat} />
            </div>
          )}
        </>
      ) : null}
    </>
  );
};

export default CreateEventForm;
