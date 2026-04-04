import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * Generate a JWT token for a user.
 */
export const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

/**
 * Register a new user.
 */
export const registerUser = async (data) => {
  const { username, email, password, identifier } = data;

  const [emailExists, usernameExists, identifierExists] = await Promise.all([
    User.findOne({ email }),
    User.findOne({ username }),
    User.findOne({ identifier })
  ]);

  if (emailExists) throw new Error("Email đã tồn tại.");
  if (usernameExists) throw new Error("Tên người dùng đã tồn tại.");
  if (identifierExists) throw new Error("Mã định danh đã tồn tại.");

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    identifier,
  });

  await newUser.save();
  const token = generateToken(newUser);
  return { user: newUser, token };
};

/**
 * Authenticate a user by email and password.
 */
export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Không tìm thấy người dùng.");
  if (user.isDisabled) throw new Error("Tài khoản đã bị vô hiệu hóa.");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Mật khẩu sai.");

  const token = generateToken(user);
  return { user, token };
};
