// utils/hashtagUtils.js
import Hashtag from "../models/Hashtag.js";

export const processHashtags = async (names = []) => {
  const ids = [];

  for (let rawName of names) {
    let name = rawName.trim().toLowerCase();
    if (!name.startsWith("#")) name = `#${name}`;

    let tag = await Hashtag.findOne({ name });

    if (tag) {
      tag.usedCount += 1;
      await tag.save();
    } else {
      tag = await Hashtag.create({ name });
    }

    ids.push(tag._id);
  }

  return ids;
};
