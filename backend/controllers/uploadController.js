export const uploadImage = (req, res) => {
  try {
    const urls = req.files.map(file => file.path); // Cloudinary URL
    res.status(200).json({ urls });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi upload ảnh.", error: err.message });
  }
};
