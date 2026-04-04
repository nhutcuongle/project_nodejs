import FilteredWord from "../models/FilteredWord.js";

export const containsBannedHashtag = async (hashtags = []) => {
  const cleaned = hashtags.map((raw) => {
    const name = raw.trim().toLowerCase();
    return name.startsWith("#") ? name : `${name}`;
  });

  const banned = await FilteredWord.find({
    type: "hashtag",
    word: { $in: cleaned },
  });

  return banned.length > 0;
};
