import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import socket from "../socket";

import axios from "../services/axiosClient";
import { createAnswer } from "../services/answerService";
import axiosClient from "../services/axiosClient";
import QuestionContent from "../components/QuestionContent";
import AnswerList from "../components/AnswerList";
import AnswerForm from "../components/AnswerForm";

function QuestionDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [replyInputs, setReplyInputs] = useState({});
  const [showAllImages, setShowAllImages] = useState(false);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  useEffect(() => {
    socket.emit("join_question", id);

    socket.on("new_answer_public", (newAnswer) => {
      setAnswers((prev) => [...prev, newAnswer]);
    });

    socket.on("answer_updated", (updatedAnswer) => {
      setAnswers((prev) => 
        prev.map(ans => ans._id === updatedAnswer._id ? updatedAnswer : ans)
      );
    });

    socket.on("answer_deleted", ({ answerId }) => {
      setAnswers((prev) => prev.filter(ans => ans._id !== answerId));
    });

    return () => {
      socket.emit("leave_question", id);
      socket.off("new_answer_public");
      socket.off("answer_updated");
      socket.off("answer_deleted");
    };
  }, [id]);

  const fetchQuestion = async () => {
    try {
      const res = await axios.get(`/questions/${id}`);
      setQuestion(res.data);
      setAnswers(res.data.answers || []);
    } catch (err) {
      console.error("❌ Lỗi tải câu hỏi:", err);
    }
  };

  const allNestedAnswers = answers; // No longer nested, keeping all at root level

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!newAnswer.trim()) return;

  //   try {
  //     const res = await createAnswer({
  //       questionId: id,
  //       content: newAnswer,
  //       parentAnswer: null,
  //     });
  //     toast.success(res.message || "Đã gửi câu trả lời");
  //     setNewAnswer("");
  //   } catch (err) {
  //     console.error("❌ Lỗi gửi trả lời:", err.response?.data || err.message);
  //     toast.error("Lỗi gửi câu trả lời");
  //   }
  // };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!newAnswer.trim()) return;

  try {
    const res = await createAnswer({
      questionId: id,
      content: newAnswer,
      parentAnswer: null,
    });

    const created = res.data.answer;


    toast.success(res.message || "Đã gửi câu trả lời");
    setNewAnswer("");
  } catch (err) {
    console.error("❌ Lỗi gửi trả lời:", err.response?.data || err.message);
    toast.error("Lỗi gửi câu trả lời");
  }
};


 

const handleReplySubmit = async (e, parentId = null) => {
  e.preventDefault();
  const content = replyInputs[parentId || "root"];
  if (!content?.trim()) return;

  try {
    const res = await createAnswer({
      questionId: id,
      content,
      parentAnswer: parentId || null,
    });

    if (!res?.data?.answer) {
      console.error("❌ API không trả về answer:", res);
      toast.error("Lỗi: Không nhận được dữ liệu phản hồi từ máy chủ.");
      return;
    }

    // ✅ Không cần setAnswers thủ công ở đây nữa
    toast.success(res.message || "Đã gửi phản hồi");
    setReplyInputs((prev) => ({ ...prev, [parentId || "root"]: "" }));
  } catch (err) {
    console.error("❌ Lỗi gửi phản hồi:", err.response?.data || err.message);
    toast.error("Lỗi gửi phản hồi");
  }
};


  const handleVote = async (targetId, type, targetType = "question") => {
    if (!token) {
      toast.error("Vui lòng đăng nhập để bình chọn");
      return;
    }

    const votePayload = {
      targetId,
      targetType,
      voteType: type === "upvote" ? "up" : "down",
    };

    try {
      const res = await axiosClient.post("/votes", votePayload);
      const { upvotes, downvotes, action } = res.data;
      const userVote = action === "removed" ? null : votePayload.voteType;

      if (targetType === "question") {
        setQuestion((prev) => ({
          ...prev,
          upvotes,
          downvotes,
          userVote,
        }));
      } else if (targetType === "answer") {
        const voteData = { upvotes, downvotes, userVote };

        const updateVoteRecursively = (answers, targetId, voteData) => {
          return answers.map((ans) => {
            if (ans._id === targetId) {
              return { ...ans, ...voteData };
            } else if (ans.children && ans.children.length > 0) {
              return {
                ...ans,
                children: updateVoteRecursively(
                  ans.children,
                  targetId,
                  voteData
                ),
              };
            } else {
              return ans;
            }
          });
        };

        setAnswers((prev) => updateVoteRecursively(prev, targetId, voteData));
      }

      socket.emit("vote", {
        targetId,
        voteType: votePayload.voteType,
        targetType,
      });

      toast.success("Đã vote");
    } catch (error) {
      console.error("❌ Vote lỗi:", error.response?.data || error.message);
      toast.error("Lỗi khi vote");
    }
  };


  if (!question) return <p className="p-4">Đang tải câu hỏi...</p>;

  const allAnswers = answers; 
  const totalPages = Math.ceil(allAnswers.length / itemsPerPage);
  const paginatedAnswers = allAnswers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-3xl mx-auto py-6">
      <QuestionContent
        question={question}
        showAllImages={showAllImages}
        setShowAllImages={setShowAllImages}
        handleVote={handleVote}
        userVote={question.userVote}
        token={token}
        showAnswerForm={showAnswerForm}
        setShowAnswerForm={setShowAnswerForm}
        newAnswer={newAnswer}
        setNewAnswer={setNewAnswer}
        handleSubmit={handleSubmit}
      />

      <h2 className="text-xl font-semibold mb-2">💬 Câu trả lời</h2>

      {paginatedAnswers.length > 0 ? (
        <>
          <AnswerList
            answers={paginatedAnswers}
            user={user}
            questionAuthorId={question.author?._id}
            replyInputs={replyInputs}
            setReplyInputs={setReplyInputs}
            handleReplySubmit={handleReplySubmit}
            handleVote={handleVote}
          />

          {/* Pagination */}
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-800"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="text-gray-500">Chưa có câu trả lời nào.</p>
      )}
    </div>
  );
}

export default QuestionDetail;
