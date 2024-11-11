"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import React, { useState } from "react";
import { auth, googleProvider } from "@/components/firebase/firebaseconfig";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import axios from "axios";
import { useRouter } from "next/navigation";

const Authentication = () => {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState("email");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authData, setAuthData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userID, setUserID] = useState("");

  const isValidTezoEmail = (email) => {
    return email.toLowerCase().endsWith("@tezu.ac.in");
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isValidTezoEmail(authData.email)) {
      setError("Please use your university email address");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        authData.email,
        authData.password
      );
      const user = userCredential.user;
      await handlePostLogin(user);
    } catch (error) {
      setError("Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isValidTezoEmail(authData.email)) {
      setError("Please use your @tezu.ac.in email address");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        authData.email,
        authData.password
      );
      const user = userCredential.user;
      await handlePostLogin(user);
    } catch (error) {
      setError("Sign-up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!isValidTezoEmail(user.email)) {
        setError("Please use your @tezu.ac.in Google account");
        await auth.signOut(); // Sign out the user if they used a non-tezu.ac.in email
        setLoading(false);
        return;
      }

      await handlePostLogin(user);
    } catch (error) {
      setError("Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handlePostLogin = async (user) => {
    const response = await axios.get(
      `http://localhost:3001/api/auth/user/${user.email}`
    );
    if (response.data.exists) {
      localStorage.setItem("userID", response.data.userId);
      router.push("/dashboard");
    } else {
      const queryParams = new URLSearchParams({
        email: user.email,
        displayName: user.displayName || "",
      }).toString();
      router.push(`/profile?${queryParams}`);
    }
  };

  return (
    <div className="w-100 flex flex-col gap-4 items-center justify-center">
      <Tabs defaultValue="signin" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="signin">
          <Card>
            <CardHeader>
              <CardDescription>
                Sign In to your account. And Enjoy the Tezu Vibes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" placeholder="Tezu Email Address" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input id="password" placeholder="Password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardDescription>
                Sign Up with your tepur university email address to create
                account on TezuVibe.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="first_name">First Name</Label>
                <Input id="first_name" placeholder="Your Name" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="last_name">Last Name</Label>
                <Input id="last_name" placeholder="Your Name" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="@username" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" placeholder="Tezu Email Address" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input id="password" placeholder="Password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save password</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      <Button
        className="w-[400px]"
        onClick={handleGoogleSignIn}
        disabled={loading}
      >
        Sign In With Google
      </Button>
    </div>
  );
};

export default Authentication;
