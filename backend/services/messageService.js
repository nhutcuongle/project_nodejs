import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import * as encryptionService from "./encryptionService.js";

/**
 * Gets messages for a conversation, decrypted and filtered.
 */
export const getMessagesLogic = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new Error("NOT_FOUND");

  const messages = await Message.find({
    conversation: conversationId,
    deletedFor: { $ne: userId }
  })
    .populate("sender", "username avatar identifier")
    .sort({ createdAt: 1 })
    .lean();

  return messages.map(m => ({
    ...m,
    text: encryptionService.decryptMessage(m.text)
  }));
};

/**
 * Sends a message, encrypts it, updates conversation stats, and notifies via socket.
 */
export const sendMessageLogic = async ({ senderId, conversationId, recipientId, text, io }) => {
  const encryptedText = encryptionService.encryptMessage(text);
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new Error("NOT_FOUND");

  const message = await Message.create({
    conversation: conversationId,
    sender: senderId,
    text: encryptedText
  });

  const populated = await message.populate("sender", "username avatar identifier");
  const jsonMsg = populated.toObject();
  jsonMsg.text = text; // Return decrypted to participants

  // Update conversation
  conversation.lastMessage = { text: encryptedText, sender: senderId, createdAt: message.createdAt };
  conversation.deletedFor = conversation.deletedFor.filter(
    u => u.toString() !== senderId.toString() && u.toString() !== recipientId?.toString()
  );

  conversation.unreadCounts = conversation.unreadCounts.map(uc => {
    if (uc.user.toString() !== senderId.toString()) {
       return { user: uc.user, count: (uc.count || 0) + 1 };
    }
    return uc;
  });

  await conversation.save();

  if (io) {
    conversation.participants.forEach(p => {
      if (p.toString() !== senderId.toString()) {
        io.to(p.toString()).emit("new_message", {
          conversationId: conversation._id.toString(),
          message: jsonMsg
        });
      }
    });
  }

  return { conversation, message: jsonMsg };
};

/**
 * Recalls a message for everyone.
 */
export const recallMessageLogic = async (messageId, userId, io) => {
  const message = await Message.findById(messageId);
  if (!message) throw new Error("NOT_FOUND");
  if (message.sender.toString() !== userId.toString()) throw new Error("UNAUTHORIZED");

  message.isRecalled = true;
  message.text = "";
  await message.save();

  if (io) {
    io.to(message.conversation.toString()).emit("message_recalled", { messageId: message._id });
  }
  return { success: true };
};

/**
 * Edits a message, encrypts new text, and notifies via socket.
 */
export const editMessageLogic = async (messageId, userId, text, io) => {
  const message = await Message.findById(messageId);
  if (!message) throw new Error("NOT_FOUND");
  if (message.sender.toString() !== userId.toString()) throw new Error("UNAUTHORIZED");

  const encryptedText = encryptionService.encryptMessage(text);
  message.text = encryptedText;
  message.edited = true;
  await message.save();

  if (io) {
    io.to(message.conversation.toString()).emit("message_edited", { messageId, text, edited: true });
  }
  const result = message.toObject();
  result.text = text;
  return result;
};
