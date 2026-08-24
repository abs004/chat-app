export const getAvatarUrl = (avatarSeed) => {
  if (!avatarSeed || avatarSeed === "default") {
    return "https://api.dicebear.com/7.x/avataaars/svg?seed=default";
  }
  if (avatarSeed.startsWith("female_")) {
    const seed = avatarSeed.replace("female_", "");
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&top=longHairBigHair,longHairBob,longHairBun,longHairCurly,longHairStraight,longHairWavy&facialHair=none`;
  }
  if (avatarSeed.startsWith("male_")) {
    const seed = avatarSeed.replace("male_", "");
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&top=shortHairShortFlat,shortHairShortWaved,shortHairDreads01&facialHair=beardLight,beardMedium,moustacheFancy`;
  }
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;
};
