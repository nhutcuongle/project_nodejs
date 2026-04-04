
 import axios from "../utils/api";

export const createAnswer = async ({ content, questionId, parentAnswer = null }) => {
  return axios.post("/answers", {
    content,
    questionId,
    parentAnswer,
  });
};
