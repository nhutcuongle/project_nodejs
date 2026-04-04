import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const KEY = Buffer.from(process.env.MSG_ENCRYPTION_KEY || "0123456789abcdef0123456789abcdef", "utf8"); // 32 bytes
const IV_LENGTH = 16; // bytes

/**
 * Encrypts a string into Hex format (iv:content).
 */
export const encryptMessage = (text) => {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  } catch (err) {
    console.error("Encryption error:", err.message);
    return text;
  }
};

/**
 * Decrypts a Hex formatted string (iv:content) back into UTF-8 text.
 */
export const decryptMessage = (text) => {
  if (!text || !text.includes(":")) return text;
  try {
    const textParts = text.split(":");
    const iv = Buffer.from(textParts.shift(), "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    // If decryption fails, it might be old plain-text data
    return text;
  }
};
