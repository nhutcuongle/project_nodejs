

// import { useState, useEffect } from "react";
// import { ChevronDown, ChevronUp, Heart } from "lucide-react";
// import { useSocket } from "../../context/SocketContext";
// import { useAuth } from "../../context/AuthContext";
// import commentService from "../../services/commentService";
// import replyService from "../../services/replyService";

// export default function ReplyList({ commentId, onHide }) {
//   const { socket } = useSocket();
//   const { user } = useAuth();

//   const [replies, setReplies] = useState([]);
//   const [visibleCount, setVisibleCount] = useState(3);
//   const [replyingTo, setReplyingTo] = useState(null); 
//   const [likesMap, setLikesMap] = useState({}); 

//   // Lấy replies ban đầu
//   useEffect(() => {
//     const fetchReplies = async () => {
//       try {
//         const data = await replyService.getReplies(commentId);
//         setReplies(data);

//         const map = {};
//         data.forEach(r => {
//           map[r._id] = { 
//             isLiked: r.likes.includes(user?._id), 
//             likesCount: r.likes.length 
//           };
//         });
//         setLikesMap(map);
//       } catch (err) {
//         console.error(err);
//       }
//     };
//     fetchReplies();
//   }, [commentId, user?._id]);

//   // Realtime: reply mới và like reply
//   useEffect(() => {
//     const handleNewReply = (reply) => {
//       if (reply.comment === commentId) {
//         setReplies(prev => [...prev, reply]);
//         setLikesMap(prev => ({
//           ...prev,
//           [reply._id]: { isLiked: reply.likes.includes(user?._id), likesCount: reply.likes.length }
//         }));
//       }
//     };

//     const handleReplyLiked = ({ replyId, userId, isLiked, likesCount }) => {
//       setLikesMap(prev => ({
//         ...prev,
//         [replyId]: {
//           isLiked: userId === user?._id ? isLiked : prev[replyId]?.isLiked || false,
//           likesCount
//         }
//       }));
//     };

//     socket?.on("new_reply", handleNewReply);
//     socket?.on("reply_liked", handleReplyLiked);

//     return () => {
//       socket?.off("new_reply", handleNewReply);
//       socket?.off("reply_liked", handleReplyLiked);
//     };
//   }, [socket, commentId, user?._id]);

//   const handleLoadMore = () => setVisibleCount(prev => prev + 3);
//   const handleHideAll = () => onHide?.();

//   const handleReplyClick = (replyId, replyToUser) => {
//     setReplyingTo({ replyId, replyToUser });
//   };

//   const handleSubmitReply = async (text) => {
//     if (!text.trim() || !replyingTo) return;
//     try {
//       const token = localStorage.getItem("token");
//       const newReply = await replyService.addReply(
//         commentId,
//         text,
//         token,
//         replyingTo?.replyToUser?._id || null
//       );
//       setReplies(prev => [...prev, newReply]);
//       setLikesMap(prev => ({
//         ...prev,
//         [newReply._id]: { isLiked: false, likesCount: 0 }
//       }));
//       setReplyingTo(null);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleToggleLike = async (replyId) => {
//     const token = localStorage.getItem("token");
//     if (!token) return alert("Vui lòng đăng nhập để tym");

//     try {
//       const res = await replyService.toggleLikeReply(replyId, token);
//       setLikesMap(prev => ({
//         ...prev,
//         [replyId]: {
//           isLiked: res.isLiked,
//           likesCount: res.likesCount
//         }
//       }));
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const visibleReplies = replies.slice(0, visibleCount);

//   return (
//     <div className="flex flex-col gap-3">
//       {visibleReplies.map(reply => (
//         <div key={reply._id} className="flex flex-col gap-1">
//           <div className="flex gap-2">
//             {/* Avatar */}
//             <img
//               src={reply.user?.avatar || "/default-avatar.png"}
//               alt="avatar"
//               className="w-8 h-8 rounded-full object-cover"
//             />
//             <div className="flex-1">
//               {/* Username: user > replyToUser */}
//               <p className="font-semibold text-[14px] text-gray-200">
//                 {reply.user?.username || "Ẩn danh"}
//                 {reply.replyTo && ` > ${reply.replyTo.username}`}
//               </p>
//               <p className="text-[14px] leading-snug">{reply.text}</p>

//               <div className="flex items-center gap-3 mt-1 text-[12px] text-gray-400">
//                 <span>{reply.timeAgo || "3 ngày trước"}</span>
//                 <button
//                   onClick={() => handleReplyClick(reply._id, reply.user)}
//                   className="hover:text-gray-200 transition"
//                 >
//                   Trả lời
//                 </button>

//                 {/* ❤️ Tym reply */}
//                 <div
//                   className="flex items-center gap-1 cursor-pointer"
//                   onClick={() => handleToggleLike(reply._id)}
//                 >
//                   <Heart
//                     size={14}
//                     className={`transition ${likesMap[reply._id]?.isLiked ? "text-red-500 fill-red-500" : "hover:text-red-500"}`}
//                   />
//                   <span>{likesMap[reply._id]?.likesCount || 0}</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Input reply inline */}
//           {replyingTo?.replyId === reply._id && (
//             <div className="pl-10 mt-1">
//               <input
//                 type="text"
//                 placeholder={`Trả lời ${replyingTo.replyToUser?.username || ""}...`}
//                 className="w-full p-2 rounded bg-gray-800 text-white"
//                 onKeyDown={e => {
//                   if (e.key === "Enter") {
//                     handleSubmitReply(e.target.value);
//                     e.target.value = "";
//                   }
//                 }}
//               />
//             </div>
//           )}
//         </div>
//       ))}

//       {/* Xem thêm / Ẩn */}
//       {replies.length > 3 && (
//         <div className="flex items-center gap-4 pl-10 mt-1">
//           {visibleCount < replies.length && (
//             <button
//               onClick={handleLoadMore}
//               className="text-[13px] text-gray-400 hover:text-gray-200 transition flex items-center gap-1"
//             >
//               <ChevronDown size={14} />
//               Xem thêm {Math.min(3, replies.length - visibleCount)}
//             </button>
//           )}
//           <button
//             onClick={handleHideAll}
//             className="text-[13px] text-gray-400 hover:text-gray-200 transition flex items-center gap-1"
//           >
//             <ChevronUp size={14} />
//             Ẩn
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }


import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Heart } from "lucide-react";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import commentService from "../../services/commentService";
import replyService from "../../services/replyService";

import ThreeDotMenu from "../UI/ThreeDotMenu";
import ConfirmModal from "../UI/ConfirmModal";

export default function ReplyList({ commentId, onHide }) {
  const { socket } = useSocket();
  const { user } = useAuth();

  const [replies, setReplies] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [replyingTo, setReplyingTo] = useState(null);
  const [likesMap, setLikesMap] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ⬇️ Lấy replies ban đầu
  useEffect(() => {
    const fetchReplies = async () => {
      try {
        const data = await replyService.getReplies(commentId);
        setReplies(data);

        const map = {};
        data.forEach(r => {
          map[r._id] = {
            isLiked: r.likes.includes(user?._id),
            likesCount: r.likes.length
          };
        });
        setLikesMap(map);
      } catch (err) {
        console.error(err);
      }
    };
    fetchReplies();
  }, [commentId, user?._id]);

  // ⬇️ Socket realtime
  useEffect(() => {
    const handleNewReply = (reply) => {
      if (reply.comment === commentId) {
        setReplies(prev => [...prev, reply]);
        setLikesMap(prev => ({
          ...prev,
          [reply._id]: { isLiked: false, likesCount: 0 }
        }));
      }
    };

    const handleReplyLiked = ({ replyId, userId, isLiked, likesCount }) => {
      setLikesMap(prev => ({
        ...prev,
        [replyId]: {
          isLiked: userId === user?._id ? isLiked : prev[replyId]?.isLiked || false,
          likesCount
        }
      }));
    };

    const handleReplyDeleted = ({ replyId }) => {
      setReplies(prev => prev.filter(r => r._id !== replyId));
    };

    socket?.on("new_reply", handleNewReply);
    socket?.on("reply_liked", handleReplyLiked);
    socket?.on("reply_deleted", handleReplyDeleted);

    return () => {
      socket?.off("new_reply", handleNewReply);
      socket?.off("reply_liked", handleReplyLiked);
      socket?.off("reply_deleted", handleReplyDeleted);
    };
  }, [socket, commentId, user?._id]);

  // ⬇️ Xóa reply
  const handleDeleteReply = async () => {
    if (!deleteTarget) return;

    try {
      const token = localStorage.getItem("token");
      await replyService.deleteReply(deleteTarget._id, token);
      setDeleteTarget(null);
      // socket?.emit("reply_deleted", ...) -> Đã có server emit
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoadMore = () => setVisibleCount(prev => prev + 3);
  const handleHideAll = () => onHide?.();

  const handleReplyClick = (replyId, replyToUser) => {
    setReplyingTo({ replyId, replyToUser });
  };

  const handleSubmitReply = async (text) => {
    if (!text.trim() || !replyingTo) return;
    try {
      const token = localStorage.getItem("token");
      await replyService.addReply(
        commentId,
        text,
        token,
        replyingTo?.replyToUser?._id || null
      );
      // setReplies(...) -> Đã có socket listener handleNewReply lo việc này
      setReplyingTo(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleLike = async (replyId) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Vui lòng đăng nhập để tym");

    try {
      const res = await replyService.toggleLikeReply(replyId, token);
      setLikesMap(prev => ({
        ...prev,
        [replyId]: {
          isLiked: res.isLiked,
          likesCount: res.likesCount
        }
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const visibleReplies = replies.slice(0, visibleCount);

  return (
    <div className="flex flex-col gap-3">
      {visibleReplies.map(reply => (
        <div key={reply._id} className="flex flex-col gap-1">

          <div className="flex gap-2">
            {/* Avatar */}
            <img
              src={reply.user?.avatar || "/default-avatar.png"}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover"
            />

            <div className="flex-1">
              {/* Username + Menu 3 chấm */}
              <div className="flex justify-between">
                <p className="font-semibold text-[14px] text-gray-200">
                  {reply.user?.username || "Ẩn danh"}
                  {reply.replyTo && ` > ${reply.replyTo.username}`}
                </p>

                {user?._id === reply.user?._id && (
                  <ThreeDotMenu
                    showReport={false}
                    onDelete={() => setDeleteTarget(reply)}
                  />
                )}
              </div>

              <p className="text-[14px] leading-snug">{reply.text}</p>

              <div className="flex items-center gap-3 mt-1 text-[12px] text-gray-400">
                <span>{reply.timeAgo || "3 ngày trước"}</span>

                <button
                  onClick={() => handleReplyClick(reply._id, reply.user)}
                  className="hover:text-gray-200 transition"
                >
                  Trả lời
                </button>

                {/* ❤️ Tym reply */}
                <div
                  className="flex items-center gap-1 cursor-pointer"
                  onClick={() => handleToggleLike(reply._id)}
                >
                  <Heart
                    size={14}
                    className={`transition ${likesMap[reply._id]?.isLiked
                      ? "text-red-500 fill-red-500"
                      : "hover:text-red-500"
                      }`}
                  />
                  <span>{likesMap[reply._id]?.likesCount || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Input reply */}
          {replyingTo?.replyId === reply._id && (
            <div className="pl-10 mt-1">
              <input
                type="text"
                placeholder={`Trả lời ${replyingTo.replyToUser?.username || ""}...`}
                className="w-full p-2 rounded bg-gray-800 text-white"
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    handleSubmitReply(e.target.value);
                    e.target.value = "";
                  }
                }}
              />
            </div>
          )}
        </div>
      ))}

      {/* Xem thêm / Ẩn */}
      {replies.length > 3 && (
        <div className="flex items-center gap-4 pl-10 mt-1">
          {visibleCount < replies.length && (
            <button
              onClick={handleLoadMore}
              className="text-[13px] text-gray-400 hover:text-gray-200 transition flex items-center gap-1"
            >
              <ChevronDown size={14} />
              Xem thêm {Math.min(3, replies.length - visibleCount)}
            </button>
          )}

          <button
            onClick={handleHideAll}
            className="text-[13px] text-gray-400 hover:text-gray-200 transition flex items-center gap-1"
          >
            <ChevronUp size={14} />
            Ẩn
          </button>
        </div>
      )}

      {/* Modal Xóa */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Xóa phản hồi"
        message="Bạn có chắc muốn xóa phản hồi này không?"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteReply}
      />
    </div>
  );
}
