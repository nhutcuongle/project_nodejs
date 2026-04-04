import FilteredWord from "../models/FilteredWord.js";

/**
 * Gets filtered words with optional type filtering.
 */
export const getFilteredWordsLogic = async (type) => {
  const filter = type ? { type } : {};
  return await FilteredWord.find(filter)
    .populate("addedBy", "username")
    .sort({ createdAt: -1 })
    .lean();
};

/**
 * Adds a new filtered word.
 */
export const addFilteredWordLogic = async (data, addedBy) => {
  const { word, type = "text", severity = "medium", category = "general", action = "pending" } = data;
  if (!word) throw new Error("WORD_MISSING");

  const normalizedWord = word.toLowerCase().trim();
  const existing = await FilteredWord.findOne({ word: normalizedWord });
  if (existing) throw new Error("WORD_EXISTS");

  const newWord = await FilteredWord.create({
    word: normalizedWord,
    type,
    severity,
    category,
    action,
    addedBy,
  });

  return await FilteredWord.findById(newWord._id).populate("addedBy", "username");
};

/**
 * Deletes a filtered word.
 */
export const deleteFilteredWordLogic = async (id) => {
  const deleted = await FilteredWord.findByIdAndDelete(id);
  if (!deleted) throw new Error("NOT_FOUND");
  return { success: true };
};
