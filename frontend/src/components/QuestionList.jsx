

import React, { useState, useEffect } from "react";
import QuestionCard from "./QuestionCard";
import axios from "../services/axiosClient"; // hoặc axios nếu bạn đã config sẵn

function QuestionList({ questions = [], fetchQuestions }) {
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;

  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const startIndex = (currentPage - 1) * questionsPerPage;
  const currentQuestions = questions.slice(startIndex, startIndex + questionsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-lg border max-w-5xl mx-auto mt-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Danh sách câu hỏi</h2>

      {questions.length === 0 ? (
        <p className="text-gray-500 text-sm">Chưa có câu hỏi nào.</p>
      ) : (
        <ul className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
          {currentQuestions.map((q) => (
            <li key={q._id}>
              <QuestionCard
                question={q}
                fetchQuestions={fetchQuestions}
              />
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border text-sm hover:bg-gray-100 disabled:opacity-50"
          >
            ← Trước
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={`px-3 py-1 rounded border text-sm ${
                currentPage === i + 1
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border text-sm hover:bg-gray-100 disabled:opacity-50"
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  );
}


export default QuestionList;
