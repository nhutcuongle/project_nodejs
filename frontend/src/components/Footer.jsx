function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 text-sm px-6 py-10 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Cột 1 - Logo & Info */}
        <div>
          <h2 className="text-orange-500 text-xl font-bold mb-2">Q&A Hub</h2>
          <p className="mb-1">📞 Điện thoại: 0123 456 789</p>
          <p className="mb-1">📧 Email: support@qnahub.vn</p>
          <p className="mb-1">📍 Địa chỉ: Số 123, Đường Hỏi Đáp, TP. HCM</p>
        </div>

        {/* Cột 2 - Về Q&A */}
        <div>
          <h3 className="text-white font-semibold mb-2">Về Q&A Hub</h3>
          <ul className="space-y-1">
            <li><a href="#" className="hover:underline">Giới thiệu</a></li>
            <li><a href="#" className="hover:underline">Liên hệ</a></li>
            <li><a href="#" className="hover:underline">Chính sách</a></li>
            <li><a href="#" className="hover:underline">Bảo mật</a></li>
          </ul>
        </div>

        {/* Cột 3 - Danh mục */}
        <div>
          <h3 className="text-white font-semibold mb-2">Chuyên mục</h3>
          <ul className="space-y-1">
            <li><a href="#" className="hover:underline">Lập trình Web</a></li>
            <li><a href="#" className="hover:underline">Thuật toán</a></li>
            <li><a href="#" className="hover:underline">Cơ sở dữ liệu</a></li>
            <li><a href="#" className="hover:underline">Phỏng vấn IT</a></li>
          </ul>
        </div>

        {/* Cột 4 - Công cụ */}
        <div>
          <h3 className="text-white font-semibold mb-2">Công cụ hữu ích</h3>
          <ul className="space-y-1">
            <li><a href="#" className="hover:underline">Trình tạo câu hỏi</a></li>
            <li><a href="#" className="hover:underline">Kiểm tra mã code</a></li>
            <li><a href="#" className="hover:underline">Tạo CV lập trình</a></li>
            <li><a href="#" className="hover:underline">Theo dõi câu trả lời</a></li>
          </ul>
        </div>

        {/* Cột 5 - Công ty */}
        <div>
          <h3 className="text-white font-semibold mb-2">CÔNG TY Q&A HUB</h3>
          <p className="mb-1"><strong>Mã số thuế:</strong> 0123456789</p>
          <p className="mb-1"><strong>Thành lập:</strong> 01/01/2023</p>
          <p>Lĩnh vực: Công nghệ, giáo dục, chia sẻ tri thức.</p>

          {/* Mạng xã hội */}
          <div className="flex gap-3 mt-3">
            <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="YouTube" className="w-5 h-5" /></a>
            <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" className="w-5 h-5" /></a>
            <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" alt="TikTok" className="w-5 h-5" /></a>
          </div>
        </div>
      </div>

      {/* Dòng bản quyền */}
      <div className="text-center text-gray-400 mt-8 border-t pt-4 border-gray-700">
        © {new Date().getFullYear()} Q&A Hub. Nền tảng hỏi đáp lập trình hàng đầu Việt Nam.
      </div>
    </footer>
  );
}

export default Footer;
