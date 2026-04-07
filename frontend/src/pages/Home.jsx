  import React, { useEffect, useState } from "react";
  import QuestionList from "../components/QuestionList";
  import { useAuth } from "../context/AuthContext"; // ✅ Import useAuth

  function Home() {
    const [questions, setQuestions] = useState([]);
    const { token } = useAuth(); // ✅ Lấy token từ context

  const fetchQuestions = async () => {
    try {

      const res = await fetch("http://localhost:5000/api/questions", {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Server trả về lỗi:", errorText);
        throw new Error("Không thể lấy danh sách câu hỏi");
      }

      const data = await res.json();

      if (!Array.isArray(data.questions)) {
        console.error("❌ Dữ liệu không phải mảng:", data);
        setQuestions([]); // fallback tránh lỗi .map
        return;
      }

      setQuestions(data.questions);
    } catch (err) {
      console.error("❌ Lỗi khi lấy danh sách câu hỏi:", err.message);
      setQuestions([]); // fallback tránh lỗi .map
    }
  };


    // ✅ Chỉ gọi API khi đã có token
    useEffect(() => {
      if (token) {
        fetchQuestions();
      } else {
        console.warn("⚠️ Không có token, không gọi API /questions");
      }
    }, [token]);

    return (
      <div className="p-6 max-w-4xl mx-auto">
      
        <p className="text-gray-700">
          Chào mừng đến với nền tảng hỏi & đáp thời gian thực. Bạn có thể đặt câu
          hỏi, trả lời, bình chọn và nhận thông báo ngay lập tức.
        </p>
        

        {/* ✅ Truyền danh sách câu hỏi và hàm fetchQuestions */}
        <QuestionList questions={questions} fetchQuestions={fetchQuestions} />
      </div>
    );
  }

  export default Home;
