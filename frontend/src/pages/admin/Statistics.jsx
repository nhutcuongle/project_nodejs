import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axiosClient from "../../services/axiosClient";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  MenuItem,
  Select,
} from "@mui/material";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8e44ad",
  "#e74c3c",
  "#2ecc71",
];
// ... import như cũ

// 👉 Hàm chuyển số tháng thành tên tiếng Việt
const convertMonthName = (monthNumber) => {
  const months = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
    "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
    "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
  ];
  const index = parseInt(monthNumber) - 1;
  return months[index] || monthNumber;
};

// 👉 Hàm chuyển timeType sang tiếng Việt
const getTimeTypeLabel = (type) => {
  switch (type) {
    case "week":
      return "tuần";
    case "month":
      return "tháng";
    case "year":
      return "năm";
    default:
      return type;
  }
};

const Statistics = () => {
  const [stats, setStats] = useState({});
  const [questionData, setQuestionData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [roleData, setRoleData] = useState([]);
  const [voteData, setVoteData] = useState([]);
  const [topUserData, setTopUserData] = useState([]);
  const [timeType, setTimeType] = useState("week");

  useEffect(() => {
    fetchOverview();
    fetchAllChartData();
  }, [timeType]);

  const fetchOverview = async () => {
    const res = await axiosClient.get("/statistics");
    setStats(res.data);
  };

  const fetchAllChartData = async () => {
    const [questionsRes, usersRes, rolesRes, votesRes, topUsersRes] =
      await Promise.all([
        axiosClient.get(`/statistics/questions-by-time?type=${timeType}`),
        axiosClient.get(`/statistics/users-by-time?type=${timeType}`),
        axiosClient.get("/statistics/user-role-distribution"),
        axiosClient.get(`/statistics/votes-by-time?type=${timeType}`),
        axiosClient.get(`/statistics/top-users-by-questions?type=${timeType}`),
      ]);

    const formatXLabel = (item) =>
      timeType === "month" ? { ...item, _id: convertMonthName(item._id) } : item;

    setQuestionData(questionsRes.data.map(formatXLabel));
    setUserData(usersRes.data.map(formatXLabel));
    setVoteData(votesRes.data.map(formatXLabel));
    setRoleData(rolesRes.data);
    setTopUserData(topUsersRes.data);
  };

  const renderCard = (title, value, color) => (
    <Grid item xs={12} sm={6} md={4}>
      <Card
        variant="outlined"
        sx={{
          borderRadius: 2,
          boxShadow: 3,
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "scale(1.03)",
            boxShadow: 6,
          },
        }}
      >
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h5" fontWeight="bold" sx={{ color }}>
            {value}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Box p={3}>
      <Typography
        variant="h4"
        fontWeight="bold"
        gutterBottom
        sx={{ color: "#2c3e50" }}
      >
        📊 Thống kê hệ thống
      </Typography>

      <Grid container spacing={2} mb={3}>
        {renderCard("Tổng người dùng", stats.totalUsers, "#2980b9")}
        {renderCard("Tổng câu hỏi", stats.totalQuestions, "#16a085")}
        {renderCard("Câu hỏi chờ duyệt", stats.pendingQuestions, "#f39c12")}
        {renderCard("Tổng câu trả lời", stats.totalAnswers, "#8e44ad")}
        {renderCard("Tổng lượt vote", stats.totalVotes, "#e67e22")}
      </Grid>

      <Box mb={3}>
        <Typography variant="h6" gutterBottom sx={{ color: "#34495e" }}>
          📅 Thống kê theo thời gian
        </Typography>
        <Select
          value={timeType}
          onChange={(e) => setTimeType(e.target.value)}
          size="small"
        >
          <MenuItem value="week">Theo tuần</MenuItem>
          <MenuItem value="month">Theo tháng</MenuItem>
          <MenuItem value="year">Theo năm</MenuItem>
        </Select>
      </Box>

      {/* Biểu đồ Top người dùng */}
      <Box mb={5}>
        <Typography variant="h6" gutterBottom sx={{ color: "#6c5ce7" }}>
          🏆 Top 5 người dùng đặt nhiều câu hỏi theo {getTimeTypeLabel(timeType)}
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={topUserData}
            layout="vertical"
            margin={{ top: 20, right: 40, left: 80, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="username" type="category" />
            <Tooltip />
            <Bar dataKey="count" fill="#6c5ce7">
              {topUserData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <Grid container spacing={4}>
        {/* Biểu đồ Người dùng mới */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, borderRadius: 2, boxShadow: 2 }}>
            <Typography variant="subtitle1" sx={{ color: "#0984e3", mb: 2 }}>
              👥 Người dùng mới theo {getTimeTypeLabel(timeType)}
            </Typography>
            <ResponsiveContainer width="100%" height={450}>
              <LineChart data={userData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#00b894"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Biểu đồ Số câu hỏi */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, borderRadius: 2, boxShadow: 2 }}>
            <Typography variant="subtitle1" sx={{ color: "#2d3436", mb: 2 }}>
              ❓ Số câu hỏi theo {getTimeTypeLabel(timeType)}
            </Typography>
            <ResponsiveContainer width="100%" height={450}>
              <LineChart data={questionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#0984e3"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Biểu đồ Vai trò người dùng */}
        <Grid item xs={12}>
          <Card sx={{ p: 2, borderRadius: 2, boxShadow: 2 }}>
            <Typography variant="subtitle1" sx={{ color: "#9b59b6", mb: 2 }}>
              🧑‍💼 Tỷ lệ vai trò người dùng
            </Typography>
            <ResponsiveContainer width="100%" height={450}>
              <PieChart>
                <Pie
                  data={roleData}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {roleData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Biểu đồ Lượt vote */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, borderRadius: 2, boxShadow: 2 }}>
            <Typography variant="subtitle1" sx={{ color: "#e67e22", mb: 2 }}>
              👍 Lượt vote theo {getTimeTypeLabel(timeType)}
            </Typography>
            <ResponsiveContainer width="100%" height={450}>
              <BarChart data={voteData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#e67e22">
                  {voteData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Statistics;
