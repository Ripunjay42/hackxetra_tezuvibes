const prisma = require("../db/index");

// Create a new group
const createGroup = async (req, res) => {
  const { name, description, userId } = req.body;
  console.log(req.body);
  try {
    const newGroup = await prisma.Group.create({
      data: {
        name,
        description,
        groupURL: "https://cdn-icons-png.flaticon.com/512/718/718339.png",
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
      },
    });
    res.status(200).json({ message: "Group created", group: newGroup });
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: "Failed to create group" });
  }
};

// Get details of a specific group
const getDetailsOfGroup = async (req, res) => {
  const { groupId } = req.params;

  try {
    const groupDetails = await prisma.Group.findUnique({
      where: { id: groupId },
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

    if (!groupDetails) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.status(200).json(groupDetails);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve group details" });
  }
};

// Update group details
const updateGroupDetails = async (req, res) => {
  const { groupId } = req.params;
  const { name, description, groupURL } = req.body;

  const updateData = {};

  if (name) updateData.name = name;
  if (description) updateData.description = description;
  if (groupURL) updateData.groupURL = groupURL;

  try {
    const updatedGroup = await prisma.Group.update({
      where: { id: groupId },
      data: updateData,
    });
    res.status(200).json({ message: "Group updated", group: updatedGroup });
  } catch (error) {
    res.status(500).json({ error: "Failed to update group" });
  }
};

// Delete a group
const deleteGroup = async (req, res) => {
  const { groupId } = req.params;

  try {
    await prisma.Group.delete({ where: { id: groupId } });
    res.status(200).json({ message: "Group deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete group" });
  }
};

// Add a member to a group
const addGroupMember = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.userId;

  try {
    const existingMember = await prisma.GroupMembers.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });

    if (existingMember) {
      return res
        .status(400)
        .json({ message: "User is already a member of this group" });
    }

    await prisma.GroupMembers.create({ data: { userId, groupId } });
    res.status(200).json({ message: "Successfully joined the group" });
  } catch (error) {
    res.status(500).json({ error: "Failed to join the group" });
  }
};

// Remove a member from a group
const removeGroupMember = async (req, res) => {
  const { groupId, userId } = req.params;

  try {
    await prisma.GroupMembers.delete({
      where: { userId_groupId: { userId, groupId } },
    });
    res.status(200).json({ message: "Member removed from group" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove member" });
  }
};

// Add a new admin to the group
const addNewAdmin = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  try {
    await prisma.GroupAdmin.create({ data: { userId, groupId } });
    res.status(200).json({ message: "Admin added to group" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add admin" });
  }
};

// Get all members of the group
const getAllUsers = async (req, res) => {
  const { groupId } = req.params;

  try {
    const groupUsers = await prisma.Group.findUnique({
      where: { id: groupId },
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

    if (!groupUsers) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Structure the response to distinguish between members and admins
    const members = groupUsers.members.map((member) => member.user);
    const admins = groupUsers.admins.map((admin) => admin.user);

    res.status(200).json({ members, admins });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve group users" });
  }
};

// Get all admins of the group
const getAllAdmins = async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await prisma.Group.findUnique({
      where: { id: groupId },
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

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const admins = group.admins.map((admin) => admin.user);

    res.status(200).json({ admins });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve group admins" });
  }
};

module.exports = {
  createGroup,
  getDetailsOfGroup,
  updateGroupDetails,
  deleteGroup,
  addGroupMember,
  removeGroupMember,
  addNewAdmin,
  getAllUsers,
  getAllAdmins,
};
