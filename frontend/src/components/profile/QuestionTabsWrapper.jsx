import React from "react";
import QuestionTabs from "./QuestionTabs";
import QuestionTabsPublic from "./QuestionTabsPublic";

const QuestionTabsWrapper = ({ isMe, userId }) => {
  return isMe ? <QuestionTabs /> : <QuestionTabsPublic userId={userId} />;
};

export default QuestionTabsWrapper;
