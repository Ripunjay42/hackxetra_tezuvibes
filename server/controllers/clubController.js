const { connect } = require("../app");
const prisma = require("../db/index");

const createClub = async (req, res) => {
  // Extract data from the request body
  const { name, description, coverImage, bannerURL, userId } = req.body;

  try {
    const newClub = await prisma.Club.create({
      data: {
        name,
        description,
        coverImage: "https://cdn-icons-png.flaticon.com/512/718/718339.png",
        bannerURL:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTlbs_AUIMl1VzU-tFY8X0dKQ-AJoOEh-wEw&s",
      },
      admins: {
        create: {
          userId: userId, // Pass the creator's user ID here
        },
      },
      members: {
        create: {
          userId: userId, // Pass the creator's user ID here
        },
      },
    });
    res.status(200).json({ message: "Club created", club: newClub });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create club" });
  }
};

const getDetailsofClub = async (req, res) => {
  const { clubId } = req.params;

  try {
    const clubDetails = await prisma.Club.findUnique({
      where: { id: clubId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        admins: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        posts: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!clubDetails) {
      return res.status(404).json({ message: "Club not found" });
    }

    res.status(200).json(clubDetails);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve club details" });
  }
};

const updateClubDetails = async (req, res) => {
  const { clubId } = req.params;
  const { name, description, coverImage, bannerURL } = req.body;

  const updateData = {};

  if (name) updateData.name = name;
  if (description) updateData.description = description;
  if (coverImage) updateData.coverImage = coverImage;
  if (bannerURL) updateData.bannerURL = bannerURL;
  try {
    const updatedClub = await prisma.Club.update({
      where: { id: clubId },
      data: updateData,
    });
    res.status(200).json({ message: "Club updated", club: updatedClub });
  } catch (error) {
    res.status(500).json({ error: "Failed to update club" });
  }
};

const deleteClub = async (req, res) => {
  const { clubId } = req.params;

  try {
    await prisma.Club.delete({ where: { id: clubId } });
    res.status(200).json({ message: "Club deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete club" });
  }
};

//add member
const addClubMember = async (req, res) => {
  const { clubId } = req.params;
  const userId = req.body;

  try {
    const existingMember = await prisma.ClubMembers.findUnique({
      where: { userId_clubId: { userId, clubId } },
    });

    if (existingMember) {
      return res
        .status(400)
        .json({ message: "User is already a member of this club" });
    }

    await prisma.ClubMembers.create({ data: { userId, clubId } });
    res.status(200).json({ message: "Successfully joined the club" });
  } catch (error) {
    res.status(500).json({ error: "Failed to join the club" });
  }
};

const removeClubMember = async (req, res) => {
  const { clubId, userId } = req.params;

  try {
    await prisma.ClubMembers.delete({
      where: { userId_clubId: { userId, clubId } },
    });
    res.status(200).json({ message: "Member removed from club" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove member" });
  }
};

const addNewAdmin = async (req, res) => {
  const { clubId } = req.params;
  const { userId } = req.body;

  try {
    await prisma.ClubAdmin.create({ data: { userId, clubId } });
    res.status(200).json({ message: "Admin added to club" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add admin" });
  }
};

const getAllUsers = async (req, res) => {
  const { clubId } = req.params;

  try {
    const clubUsers = await prisma.Club.findUnique({
      where: { id: clubId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        admins: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!clubUsers) {
      return res.status(404).json({ message: "Club not found" });
    }

    // Structure the response to distinguish between members and admins
    const members = clubUsers.members.map((member) => member.user);
    const admins = clubUsers.admins.map((admin) => admin.user);

    res.status(200).json({ members, admins });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve club users" });
  }
};

const getAllAdmins = async (req, res) => {
  const { clubId } = req.params;

  try {
    const club = await prisma.Club.findUnique({
      where: { id: clubId },
      include: {
        admins: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    const admins = club.admins.map((admin) => admin.user);

    res.status(200).json({ admins });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve club admins" });
  }
};

module.exports = {
  createClub, //
  getDetailsofClub, ///
  updateClubDetails, //
  deleteClub, ///
  addClubMember, //
  removeClubMember,
  addNewAdmin, //
  getAllUsers, //
  getAllAdmins, //
};
