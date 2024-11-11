import React from "react";
const axios = require("axios");
const URL = require("url");
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button"; // Ensure this is the correct path for your button component
import { Input } from "./ui/input"; // Assuming you have a shadcn Input component

const Createclub = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    coverImage: "",
    bannerURL: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = async (e, fieldName) => {
    const userId = localStorage.getItem("userID");
    const file = e.target.files[0];
    if (file) {
      try {
        const presignedUrlResponse = await axios.post(
          `http://localhost:3001/api/upload/generate-presigned-url/${userId}`,
          {
            fileName: file.name,
            fileType: file.type,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const { getSignedURL } = presignedUrlResponse.data;
        if (getSignedURL) {
          await axios.put(getSignedURL, file, {
            headers: {
              "Content-Type": file.type,
            },
          });
          const url = new URL(getSignedURL);
          const filePath = `${url.origin}${url.pathname}`;
          setFormData({ ...formData, [fieldName]: filePath });
        } else {
          console.error("Failed to get presigned URL from server");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `http://localhost:3001/api/clubs/club/create`,
        { ...formData, userId: localStorage.getItem("userID") },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        alert("club created successfully!");
        router.push("/clubs");
      }
    } catch (error) {
      console.error("Error creating club:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <p className="block text-sm font-bold text-gray-700 mb-1">
            Club Name
          </p>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="block w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="Enter club name"
          />
        </div>

        <div>
          <p className="block text-sm font-bold text-gray-700 mb-1">
            Description
          </p>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="block w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="Enter club description"
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Club"}
        </Button>
      </form>
    </div>
  );
};

export default Createclub;
