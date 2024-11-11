import React from "react";
const axios = require("axios");
const URL = require("url");
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button"; // Ensure this is the correct path for your button component
import { Input } from "./ui/input"; // Assuming you have a shadcn Input component

const Creategroup = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userId = localStorage.getItem("userId");
      console.log(userId);
      const response = await axios.post(
        "http://localhost:3001/api/groups/group/create",
        { ...formData, userId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        router.push("/");
        alert("Group Created Successfully"); // Redirect to a groups page or wherever appropriate
      } else {
        alert(response.data.error || "Failed to create group");
      }
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <p className="block text-sm font-bold text-gray-700 mb-1">
            Group Name
          </p>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="block w-full px-4 py-2 border border-gray-300 rounded-md"
            placeholder="Enter group name"
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
            placeholder="Enter group description"
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Club"}
        </Button>
      </form>
    </div>
  );
};

export default Creategroup;
