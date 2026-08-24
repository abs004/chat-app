export const getAvatarUrl = (avatarSeed) => {
  if (!avatarSeed || avatarSeed === "default") {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=default`;
  }
  // Strip the gender prefix and use the seed directly
  const seed = avatarSeed.replace("male_", "").replace("female_", "");
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
};