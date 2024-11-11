const express = require("express");
const prisma = require("../db/index");

const router = express.Router();

router.get("/user/:userId/data", async (req, res) => {
  const { userId } = req.params;

  console.log(userId);

  try {
    // Fetch clubs, groups, and posts of the user in one request
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        clubMemberships: {
          include: { club: true },
        },
        memberships: {
          include: { group: true },
        },
        posts: true,
      },
    });

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    // Structure response data
    const responseData = {
      clubs: userData.clubMemberships.map((membership) => membership.club),
      groups: userData.memberships.map((membership) => membership.group),
      posts: userData.posts,
    };

    res.json(responseData);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

router.patch("/user/update/:userId", async (req, res) => {
  const { userId } = req.params;
  const { firstName, lastName, profilePicURL, bio, phoneNumber } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(profilePicURL && { profilePicURL }),
        ...(bio && { bio }),
        ...(phoneNumber && { phoneNumber }),
      },
    });

    res.status(200).json({
      message: "User details updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ error: "Error updating user details" });
  }
});

module.exports = router;
