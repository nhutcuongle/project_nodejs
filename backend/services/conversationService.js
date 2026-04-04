import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Follow from "../models/Follow.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import * as encryptionService from "./encryptionService.js";

// ✅ Kiểm tra follow 2 chiều
export async function isMutualFollow(userA, userB) {
  const aId = new mongoose.Types.ObjectId(userA);
  const bId = new mongoose.Types.ObjectId(userB);

  const followingAB = await Follow.findOne({ follower: aId, following: bId });
  const followingBA = await Follow.findOne({ follower: bId, following: aId });

  return !!(followingAB && followingBA);
}

export async function createOrSendMessage({ senderId, recipientId, text, io }) {
  const participants = [
    new mongoose.Types.ObjectId(senderId),
    new mongoose.Types.ObjectId(recipientId),
  ];

  // 🔍 Tìm conversation thật nếu có
  let conversation = await Conversation.findOne({
    participants: { $all: participants },
    status: { $ne: "rejected" },
  });

  // 1️⃣ Nếu chỉ click "Nhắn tin" → KHÔNG tạo conversation
  if (!text?.trim()) {
    return { conversation: conversation || null, message: null };
  }

  // 2️⃣ Nếu gửi message đầu tiên → tạo conversation thật
  if (!conversation) {
    const mutual = await isMutualFollow(senderId, recipientId);
    conversation = await Conversation.create({
      participants,
      status: mutual ? "active" : "pending",
      requestedTo: mutual ? null : recipientId,
      unreadCounts: [
        { user: senderId, count: 0 },
        { user: recipientId, count: 0 },
      ],
      deletedFor: [],
    });
  }

  // Nếu user từng xóa hội thoại → hiển thị lại
  conversation.deletedFor = conversation.deletedFor.filter(
    (u) => u.toString() !== senderId.toString() && u.toString() !== recipientId.toString()
  );

  // 3️⃣ Tạo message thật (Mã hóa text)
  const encryptedText = encryptionService.encryptMessage(text);
  const message = await Message.create({
    conversation: conversation._id,
    sender: senderId,
    text: encryptedText,
  });

  conversation.lastMessage = {
    text: encryptedText,
    sender: senderId,
    createdAt: message.createdAt,
  };

  conversation.unreadCounts = conversation.unreadCounts.map((uc) =>
    uc.user.toString() === recipientId.toString()
      ? { user: uc.user, count: (uc.count || 0) + 1 }
      : uc
  );

  await conversation.save();

  // 4️⃣ Emit socket (Gửi data đã giải mã cho người nhận)
  const rawMsg = message.toObject();
  rawMsg.text = text;

  io.to(recipientId.toString()).emit("new_message", {
    conversationId: conversation._id.toString(),
    message: rawMsg,
  });

  // 5️⃣ Trả về data cho người gửi
  const populated = await Conversation.findById(conversation._id)
    .populate("participants", "username avatar identifier")
    .populate("lastMessage.sender", "username avatar identifier");

  if (populated.lastMessage) {
    populated.lastMessage.text = text;
  }

  return { conversation: populated, message: rawMsg };
}

// ✅ Lấy danh sách conversation
export async function getUserConversations({ userId, box = "main" }) {
  const uid = new mongoose.Types.ObjectId(userId);

  let filter = {
    participants: { $in: [uid] },
    deletedFor: { $ne: uid },
  };

  if (box === "main") {
    filter.$or = [
      { status: "active" },
      { $and: [{ status: "pending" }, { requestedTo: { $ne: uid } }] },
    ];
  } else if (box === "requests") {
    filter = { requestedTo: uid, status: "pending" };
  }

  let conversations = await Conversation.find(filter)
    .populate("participants", "username avatar identifier")
    .populate("lastMessage.sender", "username avatar identifier")
    .sort({ updatedAt: -1 });

  // Giải mã tin nhắn cuối cùng để hiển thị preview
  const result = conversations.map(c => {
    const obj = c.toObject();
    if (obj.lastMessage) {
      obj.lastMessage.text = encryptionService.decryptMessage(obj.lastMessage.text);
    }
    return obj;
  });

  return result;
}

// ✅ Chấp nhận tin nhắn chờ
export async function acceptConversationRequest({
  conversationId,
  userId,
  io,
}) {
  const convo = await Conversation.findById(conversationId);
  if (!convo || convo.requestedTo.toString() !== userId.toString()) return null;

  convo.status = "active";
  convo.requestedTo = null;

  convo.deletedFor = convo.deletedFor.filter(
    (u) => u.toString() !== userId.toString()
  );

  await convo.save();

  convo.participants.forEach((p) => {
    if (p.toString() !== userId.toString()) {
      io.to(p.toString()).emit("request_accepted", { conversationId });
    }
  });

  return convo;
}

// ❌ Từ chối tin nhắn chờ
export async function rejectConversationRequest({
  conversationId,
  userId,
  io,
}) {
  const convo = await Conversation.findById(conversationId);
  if (!convo || convo.requestedTo.toString() !== userId.toString()) return null;

  convo.status = "rejected";
  await convo.save();

  convo.participants.forEach((p) => {
    if (p.toString() !== userId.toString()) {
      io.to(p.toString()).emit("request_rejected", { conversationId });
    }
  });

  return convo;
}

export async function deleteConversation({ conversationId, userId }) {
  if (!conversationId || !conversationId.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error("ID conversation không hợp lệ");
  }

  const convo = await Conversation.findById(conversationId);
  if (!convo) {
    throw new Error("Không tìm thấy conversation");
  }

  // Soft delete cho user này
  if (!convo.deletedFor.includes(userId)) {
    convo.deletedFor.push(userId);
    await convo.save();
    
    // 🔥 Xóa toàn bộ tin nhắn phía user này (đưa vào list deletedFor của từng tin nhắn)
    await Message.updateMany(
      { conversation: conversationId, deletedFor: { $ne: userId } },
      { $push: { deletedFor: userId } }
    );
  }

  // Nếu tất cả participant đã xóa → xóa hẳn
  const allDeleted = convo.participants.every((p) =>
    convo.deletedFor.includes(p.toString())
  );

  if (allDeleted) {
    await Conversation.findByIdAndDelete(conversationId);
  }

  return { success: true };
}
