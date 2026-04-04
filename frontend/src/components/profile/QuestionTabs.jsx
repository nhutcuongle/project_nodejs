

import React, { useState, useEffect } from "react";
import QuestionList from "../../components/QuestionList";
import axiosClient from "../../services/axiosClient";

const QuestionTabs = () => {
  const [activeTab, setActiveTab] = useState("my");
  const [questions, setQuestions] = useState([]);
  const [showOnlySaved, setShowOnlySaved] = useState(false);

  const fetchMyQuestions = () => axiosClient.get("/questions/my");
  const fetchSavedQuestions = () => axiosClient.get("/bookmarks?type=Question");
  const fetchHiddenQuestions = () => axiosClient.get("/questions/hidden");

  const fetchQuestions = async () => {
    try {
      let res;
      if (activeTab === "saved") {
        res = await fetchSavedQuestions();
      } else if (activeTab === "hidden") {
        res = await fetchHiddenQuestions();
      } else {
        res = await fetchMyQuestions();
        if (showOnlySaved) {
          res.data = res.data.filter((q) => q.savedByUser);
        }
      }

      setQuestions(res.data);
    } catch (err) {
      console.error("Lỗi khi tải câu hỏi:", err);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [activeTab, showOnlySaved]);

  return (
    <div>
      <div className="flex gap-2 border-b mb-4">
        <button
          className={`px-4 py-2 ${
            activeTab === "my"
              ? "border-b-2 border-blue-500 font-semibold"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("my")}
        >
          Câu hỏi đã đăng
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "saved"
              ? "border-b-2 border-blue-500 font-semibold"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("saved")}
        >
          Câu hỏi đã lưu
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "hidden"
              ? "border-b-2 border-blue-500 font-semibold"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("hidden")}
        >
          Câu hỏi đã ẩn
        </button>
      </div>

      {activeTab === "my" && (
        <div className="mb-4">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showOnlySaved}
              onChange={(e) => setShowOnlySaved(e.target.checked)}
              className="accent-blue-500"
            />
            Chỉ hiển thị câu hỏi đã lưu
          </label>
        </div>
      )}

      <QuestionList
        questions={questions}
        isProfileView
        activeTab={activeTab}
        fetchQuestions={fetchQuestions}
      />
    </div>
  );
};

export default QuestionTabs;
