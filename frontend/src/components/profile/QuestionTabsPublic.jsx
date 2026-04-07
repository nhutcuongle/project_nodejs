// components/profile/QuestionTabsPublic.jsx
import React, { useEffect, useState } from "react";
import QuestionList from "../QuestionList";
import axiosClient from "../../services/axiosClient";

const QuestionTabsPublic = ({ userId }) => {
  const [activeTab, setActiveTab] = useState("my");
  const [questions, setQuestions] = useState([]);

  const fetchUserQuestions = () => axiosClient.get(`/questions/user/${userId}`);

  const fetchQuestions = async () => {
    try {
      let res;
      res = await fetchUserQuestions();

      setQuestions(res.data);
    } catch (err) {
      console.error("Lỗi khi tải câu hỏi:", err);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [activeTab]);

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
      </div>

      <QuestionList questions={questions} isProfileView activeTab={activeTab} />
    </div>
  );
};

export default QuestionTabsPublic;
