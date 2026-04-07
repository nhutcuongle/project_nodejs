import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import logo from "../assets/hutech.png";
import QuestionMark3D from "../components/QuestionMarkModel";

const teamMembers = [
  {
    name: "Lê Nhựt Cường",
 
    img: "/assets/curong.jpg",
  },
  {
    name: "Huỳnh Gia Bảo",
   
    img: "/assets/van-a.jpg",
  },
  {
    name: "Trịnh Minh Đạt",
   
    img: "/assets/thi-b.jpg",
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ textAlign: "center", py: 6, px: 2 }}>
      {/* Logo và thông tin trường */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 4 }}>
        <img src={logo} alt="HUTECH Logo" style={{ width: 300 }} />
        <Typography variant="h5" sx={{ mt: 2 }}>
          Trường Đại học Công nghệ TP.HCM - HUTECH
        </Typography>
      </Box>

      {/* Mô hình 3D dấu chấm hỏi */}
      <Box sx={{ width: "100%", maxWidth: 300, mx: "auto", mb: 2 }}>
        <QuestionMark3D />
      </Box>
      <Typography variant="h3" gutterBottom>
        Hệ thống Hỏi & Đáp - Q&A
      </Typography>
      <Typography variant="body1" sx={{ maxWidth: 800, mx: "auto", mb: 4 }}>
        Website Q&A là nền tảng trao đổi kiến thức giữa người dùng và người dùng, hỗ trợ hỏi đáp theo thời gian thực. Với hệ thống kiểm duyệt thông minh, phân quyền rõ ràng, và trải nghiệm tương tác mượt mà, giúp cộng đồng học tập và phát triển hiệu quả.
      </Typography>
      <Button
        variant="contained"
        size="large"
        sx={{ backgroundColor: "#0984e3", mb: 6 }}
        onClick={() => navigate("/home")}
      >
        Khám Phá
      </Button>
    </Box>
  );
};

export default LandingPage;
