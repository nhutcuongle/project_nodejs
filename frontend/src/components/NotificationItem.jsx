// src/components/NotificationItem.jsx
const NotificationItem = ({ notification, onClick }) => {
  return (
    <div
      onClick={() => onClick(notification)}
      className={`p-3 border-b hover:bg-gray-100 cursor-pointer ${
        notification.read ? "text-gray-500" : "text-black"
      }`}
    >
      <p>{notification.message}</p>
      {notification.link && (
        <a
          href={notification.link}
          className="text-blue-500 text-sm hover:underline"
        >
          Xem chi tiết
        </a>
      )}
    </div>
  );
};

export default NotificationItem;
