import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import { dirname } from "path";

export const generateToken = async (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWTSECRET, { expiresIn: "3d" });

  res.cookie("jwt", token, {
    maxAge: 3 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });
};

export const getFileMeta = (metaUrl) => {
  const __filename = fileURLToPath(metaUrl);
  const __dirname = dirname(__filename);
  return { __filename, __dirname };
};

export const generateUniqueUserId = async (rawUsername) => {
  if (!rawUsername) return null;

  const lower = rawUsername.toLowerCase();
  const trimmed = lower.replace(/\s+$/, "");
  const base = trimmed.replace(/\s+/g, "_");

  for (let i = 0; i < 100; i++) {
    const candidate = i === 0 ? base : `${base}${i}`;
    const exists = await User.findOne({ user_id: candidate });
    if (!exists) return candidate;
  }

  const fallback = Math.floor(1000 + Math.random() * 9000);
  return `${base}${fallback}`;
};
