import * as adminUserService from "../services/adminUserService.js";

export const getAllUsers = async (req, res) => {
  try {
    const data = await adminUserService.getAllUsersLogic(req.user.id, req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách người dùng", error: err.message });
  }
};

export const toggleDisableUser = async (req, res) => {
  try {
    const user = await adminUserService.toggleDisableUserLogic(req.params.id);
    res.json({ message: `Đã ${user.isDisabled ? "vô hiệu hóa" : "kích hoạt lại"}.`, user });
  } catch (err) {
    if (err.message === "USER_NOT_FOUND") return res.status(404).json({ message: "Không tìm thấy." });
    if (err.message === "CANNOT_MODIFY_ADMIN") return res.status(403).json({ message: "Không thể khóa Admin." });
    res.status(500).json({ message: "Lỗi cập nhật.", error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await adminUserService.deleteUserLogic(req.params.id);
    res.json({ message: "Xóa thành công." });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa.", error: err.message });
  }
};

export const setAdminRole = async (req, res) => {
  try {
    const user = await adminUserService.setAdminRoleLogic(req.params.id);
    res.json({ message: "Đã cấp quyền admin.", user });
  } catch (err) {
    if (err.message === "ALREADY_ADMIN") return res.status(400).json({ message: "Đã là admin." });
    res.status(500).json({ message: "Lỗi quyền admin.", error: err.message });
  }
};

export const toggleCanAsk = async (req, res) => {
  try {
    const user = await adminUserService.togglePermissionLogic(req.params.id, "canAsk");
    res.json({ message: `Đã ${user.permissions.canAsk ? "mở" : "cấm"} quyền hỏi.`, user });
  } catch (err) {
    res.status(500).json({ message: "Lỗi quyền hỏi." });
  }
};

export const toggleCanAnswer = async (req, res) => {
  try {
    const user = await adminUserService.togglePermissionLogic(req.params.id, "canAnswer");
    res.json({ message: `Đã ${user.permissions.canAnswer ? "mở" : "cấm"} quyền trả lời.`, user });
  } catch (err) {
    res.status(500).json({ message: "Lỗi quyền trả lời." });
  }
};
