import React, { useEffect, useState, useContext } from "react";
import { SocketContext } from "../context/SocketContext";
import { AuthContext } from "../context/AuthContext";
import axios from "../utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Bell, BellRing } from "lucide-react";
import { Link } from "react-router-dom";

dayjs.extend(relativeTime);

const NotificationsDropdown = () => {
  const { socket } = useContext(SocketContext);
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [liveNotifications, setLiveNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user || !socket) return;

    socket.emit("join", user._id);

    const handleSocketNotification = (data, type) => {
      if (type === "follow_notification" && data.sender?._id === user._id)
        return;
      let message = data.message || "Thông báo mới";
      let link = data.link || "/";

      if (type === "follow_notification") {
        const { sender, type: followType } = data;
        switch (followType) {
          case "follow":
            message = `${sender.username} đã theo dõi bạn`;
            break;
          case "friend":
            message = `${sender.username} đã theo dõi bạn, từ nay các bạn là bạn bè`;
            break;
          case "unfollow":
            message = `${sender.username} đã hủy theo dõi bạn`;
            break;
        }
        link = `/users/${sender._id}`;
      }

      if (type === "video_liked") {
        message = data.message || "Ai đó đã thích video của bạn";
        link = data.link || "/";
      }

      setLiveNotifications((prev) => [
        { message, link, read: false, createdAt: new Date() },
        ...prev,
      ]);
    };

    socket.on("new_answer", (data) =>
      handleSocketNotification(data, "new_answer")
    );
    socket.on("global_notification", (data) =>
      handleSocketNotification(data, "global_notification")
    );
    socket.on("vote_notification", (data) =>
      handleSocketNotification(data, "vote_notification")
    );
    socket.on("follow_notification", (data) =>
      handleSocketNotification(data, "follow_notification")
    );
    socket.on("new_question", (data) =>
      handleSocketNotification(data, "new_question")
    );
    socket.on("video_liked", (data) =>
      handleSocketNotification(data, "video_liked")
    );

    return () => {
      socket.off("new_answer");
      socket.off("global_notification");
      socket.off("vote_notification");
      socket.off("follow_notification");
      socket.off("new_question");
      socket.off("video_liked");
    };
  }, [socket, user]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("/notifications");
        const enriched = res.data.map((n) => ({
          ...n,
          createdAt: n.createdAt ? new Date(n.createdAt) : new Date(),
        }));
        setNotifications(enriched);
      } catch (err) {
        console.error("Lỗi khi lấy thông báo:", err);
      }
    };
    if (user) fetchNotifications();
  }, [user]);

  const toggleDropdown = async () => {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (!open) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setLiveNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

      try {
        await axios.put("/notifications/mark-all-read");
      } catch (err) {
        console.error("Lỗi khi đánh dấu đã đọc:", err);
      }
    }
  };

  const allNotifications = [...liveNotifications, ...notifications];
  const unreadCount = allNotifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="relative p-2 hover:bg-gray-100 rounded-full transition"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-6 h-6 text-yellow-500" />
        ) : (
          <Bell className="w-6 h-6 text-gray-500" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-rose-100 to-pink-100 text-gray-700 font-semibold text-sm">
            🔔 Thông báo mới
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {allNotifications.length === 0 ? (
              <li className="p-4 text-gray-500 text-center">
                Không có thông báo
              </li>
            ) : (
              allNotifications.map((n, index) => (
                <li
                  key={index}
                  className={`px-4 py-3 border-b text-sm transition duration-150 hover:bg-gray-100 ${
                    n.read ? "text-gray-500" : "font-semibold text-gray-800"
                  }`}
                >
                  <Link to={n.link} className="block">
                    <div>{n.message}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {dayjs(n.createdAt).fromNow()}
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
