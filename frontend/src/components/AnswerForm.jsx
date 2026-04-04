import React from "react";

const AnswerForm = ({ newAnswer, setNewAnswer, handleSubmit }) => {
  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <textarea
        className="w-full border p-2 rounded mb-2"
        placeholder="Nhập câu trả lời của bạn..."
        value={newAnswer}
        onChange={(e) => setNewAnswer(e.target.value)}
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Gửi câu trả lời
      </button>
    </form>
  );
};

export default AnswerForm;
