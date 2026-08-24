export const getAvatarUrl = (avatarSeed) => {
  if (!avatarSeed || avatarSeed === "default") {
    return "https://api.dicebear.com/7.x/adventurer/svg?seed=default";
  }
  const seed = avatarSeed.replace("male_", "").replace("female_", "");
  return "https://api.dicebear.com/7.x/adventurer/svg?seed=" + seed;
};