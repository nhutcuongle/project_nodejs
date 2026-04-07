

import React, { useState, useEffect } from "react";
import QuestionList from "../../components/QuestionList";
import axiosClient from "../../services/axiosClient";

const QuestionTabs = () => {
  const [activeTab, setActiveTab] = useState("my");
  const [questions, setQuestions] = useState([]);
  const [showOnlySaved, setShowOnlySaved] = useState(false);

  const fetchMyQuestions = () => axiosClient.get("/questions/my");
  const fetchHiddenQuestions = () => axiosClient.get("/questions/hidden");

  const fetchQuestions = async () => {
    try {
      let res;
      if (activeTab === "hidden") {
        res = await fetchHiddenQuestions();
      } else {
        res = await fetchMyQuestions();
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
            activeTab === "hidden"
              ? "border-b-2 border-blue-500 font-semibold"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("hidden")}
        >
          Câu hỏi đã ẩn
        </button>
      </div>


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
