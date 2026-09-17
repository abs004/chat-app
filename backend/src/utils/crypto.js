import crypto from "crypto";
import env from "../config/env.js";

export const encryptMessage = (plaintext) => {
  try {
    const iv = crypto.randomBytes(12);
    const key = Buffer.from(env.MESSAGE_ENCRYPTION_KEY, "hex");
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    
    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");
    
    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
  } catch (err) {
    throw new Error(`Encryption failed: ${err.message}`);
  }
};

export const decryptMessage = (encryptedStr) => {
  try {
    if (!encryptedStr) return encryptedStr;
    const parts = encryptedStr.split(":");
    if (parts.length !== 3) {
      return "[Message unavailable]";
    }
    
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const key = Buffer.from(env.MESSAGE_ENCRYPTION_KEY, "hex");
    
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (err) {
    return "[Message unavailable]";
  }
};
