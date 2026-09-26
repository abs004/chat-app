import User from "../models/User.js";

/**
 * Checks whether a userId is currently banned.
 * Mirrors the exact ban logic already in authService.login so
 * expired temporary bans are automatically lifted here too.
 *
 * @param {string} userId
 * @returns {{ banned: boolean, message?: string }}
 */
export const checkBanStatus = async (userId) => {
  const user = await User.findById(userId).select("isBanned banExpiresAt").lean();

  if (!user || !user.isBanned) return { banned: false };

  // Permanent ban
  if (user.banExpiresAt === null) {
    return {
      banned: true,
      message: "Your account has been permanently suspended due to violations of our community guidelines.",
    };
  }

  // Temporary ban still active
  if (user.banExpiresAt > new Date()) {
    const dateStr = user.banExpiresAt.toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
    const timeStr = user.banExpiresAt.toLocaleTimeString("en-GB", {
      hour: "2-digit", minute: "2-digit",
    });
    return {
      banned: true,
      message: `Your account is temporarily suspended until ${dateStr}, ${timeStr}.`,
    };
  }

  // Temporary ban has expired — lift it quietly
  await User.findByIdAndUpdate(userId, { isBanned: false, banExpiresAt: null });
  return { banned: false };
};
