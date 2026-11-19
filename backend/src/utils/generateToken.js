import jwt from "jsonwebtoken";

const generateToken = (id, type = "admin") => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET n'est pas défini.");
  }

  return jwt.sign({ id, type }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export default generateToken;
