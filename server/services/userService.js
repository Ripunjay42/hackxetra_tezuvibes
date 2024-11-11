const prisma =  require("../db/index")

exports.createUser = async (data) => {
  return await prisma.user.create({
    data,
  });
};

exports.getUsers = async () => {
  return await prisma.user.findMany();
};
