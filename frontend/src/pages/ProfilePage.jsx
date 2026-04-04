



import { useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import { Settings } from "lucide-react";
import conversationService from "../services/conversationService";
import AvatarSection from "../components/profile/AvatarSection";
import InfoSection from "../components/profile/InfoSection";
import FollowStats from "../components/profile/FollowStats";
import EditProfileModal from "../components/profile/EditProfileModal";
import QuestionTabsWrapper from "../components/profile/QuestionTabsWrapper";
import FollowListModal from "../components/profile/FollowListModal";
import useProfile from "../hooks/useProfile";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { identifier } = useParams();
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);

  const {
    isMe,
    form,
    setForm,
    followersCount,
    followingCount,
    followStatus,
    handleFollowToggle,
    handleAvatarUpload,
    handleShowModal,
    handleSaveProfile,
    followList,
    modalType,
    setModalType,
  } = useProfile(identifier, user, setUser);

const handleSendMessage = async (recipientId) => {
  try {
    const res = await conversationService.getConversations("main");
    const list = res.conversations || [];

    const existing = list.find((c) =>
      c.participants.some((p) => p._id === recipientId)
    );

    if (existing) {
      navigate(`/messages`, { state: { openConversationId: existing._id } });
      return;
    }

    // Chưa có conversation → truyền cả username + avatar
    navigate(`/messages`, {
      state: {
        selectedConversation: {
          _id: null,
          participants: [
            { _id: recipientId, username: form.username, avatar: form.avatar },
          ],
          lastMessage: null,
          status: "active",
        },
      },
    });
  } catch (err) {
    console.error(err);
  }
};

  // 🔹 Realtime: lắng nghe update likesCount
  useEffect(() => {
    if (!socket || !form?._id) return;

    socket.emit("join", form._id); // join room của user owner

    const handleUpdateLikes = (newLikesCount) => {
      setForm((prev) => ({ ...prev, likesCount: newLikesCount }));
    };

    socket.on("updateLikesCount", handleUpdateLikes);

    return () => {
      socket.off("updateLikesCount", handleUpdateLikes);
    };
  }, [socket, form, setForm]);

  if (!form) return <p className="text-center">Đang tải hồ sơ...</p>;

  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1 w-full p-6 flex flex-col gap-8">
        {/* Avatar + Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <AvatarSection
            avatarUrl={form.avatar}
            isMe={isMe}
            onUpload={handleAvatarUpload}
          />
          <div className="flex-1 text-center sm:text-left">
            <InfoSection
              username={form.username}
              identifier={form.identifier}
              createdAt={form.createdAt}
            />

            {/* Buttons */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
              {isMe ? (
                <>
                  <button
                    onClick={() => setForm({ ...form, editing: !form.editing })}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg"
                  >
                    {form.editing ? "Hủy" : "Sửa hồ sơ"}
                  </button>

                  <button
                    onClick={() => navigate("/settings")}
                    className="p-2 rounded-full hover:bg-gray-800"
                  >
                    <Settings size={22} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleFollowToggle}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg"
                  >
                    {followStatus === "friend"
                      ? "Bạn bè"
                      : followStatus === "following"
                      ? "Đang theo dõi"
                      : followStatus === "followed_by"
                      ? "Theo dõi lại"
                      : "Theo dõi"}
                  </button>
                  <button
                    onClick={() => handleSendMessage(form._id)}
                    className="px-4 py-2 rounded-lg border border-gray-600 hover:bg-gray-800 transition"
                  >
                    Nhắn tin
                  </button>
                </>
              )}
            </div>

            {/* FollowStats */}
            <FollowStats
              followersCount={followersCount}
              followingCount={followingCount}
              likesCount={form.likesCount} // ✅ realtime update
              onShowModal={handleShowModal}
            />

            {form.bio && (
              <p className="mt-2 text-gray-300 text-base sm:text-lg font-medium max-w-lg">
                {form.bio}
              </p>
            )}
          </div>
        </div>

        {/* Edit modal */}
        {isMe && form.editing && (
          <EditProfileModal
            form={form}
            setForm={setForm}
            onSave={handleSaveProfile}
            onClose={() => setForm({ ...form, editing: false })}
          />
        )}

        <hr className="my-6 border-gray-700" />
        <QuestionTabsWrapper isMe={isMe} userId={form._id} />

        {modalType && (
          <FollowListModal
            type={modalType}
            userId={form._id}
            list={followList}
            onClose={() => setModalType(null)}
          />
        )}
      </div>
    </div>
  );
}
