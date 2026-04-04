

import React from "react";
import AnswerItem from "./AnswerItem";

function AnswerList({
  answers,
  user,
  questionAuthorId,
  replyInputs,
  setReplyInputs,
  handleReplySubmit,
  handleVote,
  depth = 0,
}) {
  const maxDepth = 2;

  return (
    <ul className="space-y-4">
      {answers.map((answer) => (
        <li key={answer._id}>
          <AnswerItem
            answer={answer}
            user={user}
            questionAuthorId={questionAuthorId}
            replyInputs={replyInputs}
            setReplyInputs={setReplyInputs}
            handleReplySubmit={handleReplySubmit}
            handleVote={handleVote}
            depth={depth}
          />

          {answer.replies && answer.replies.length > 0 && (
            <div className="ml-6 border-l border-gray-200 pl-4">
              <AnswerList
                answers={answer.replies}
                user={user}
                questionAuthorId={questionAuthorId}
                replyInputs={replyInputs}
                setReplyInputs={setReplyInputs}
                handleReplySubmit={handleReplySubmit}
                 handleVote={handleVote} 
                depth={depth >= maxDepth ? maxDepth : depth + 1} // giới hạn độ sâu hiển thị
              />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default AnswerList;
