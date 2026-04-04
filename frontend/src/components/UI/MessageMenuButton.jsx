import React from "react";

export default function MessageMenuButton({
  isMine,
  message,
  hover,
  isMenuOpen,
  menuPlacement,
  toggleMenu,
  onRecall,
  onDeleteForMe,
}) {
  if (!hover) return null;

  return (
    <>
      {/* Dấu 3 chấm */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 cursor-pointer text-2xl font-bold z-30
          ${isMine ? "-left-12" : "-right-12"} text-gray-700`}
        onClick={toggleMenu}
      >
        ⋮
      </div>

      {/* Menu Dropdown */}
      {isMenuOpen && (
        <div
          className={`absolute w-40 bg-white shadow-xl border rounded-xl py-1 z-[9999]
            ${menuPlacement === "down" ? "top-full mt-2" : "bottom-full mb-2"}
            ${isMine ? "right-0" : "left-0"}`}
          onClick={(e) => e.stopPropagation()}
        >
          {isMine && !message.isRecalled && (
            <div
              className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm"
              onClick={onRecall}
            >
              Thu hồi
            </div>
          )}

          {isMine && message.isRecalled && (
            <div
              className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm"
              onClick={onDeleteForMe}
            >
              Gỡ
            </div>
          )}

          <div className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm">Ghim</div>
          <div className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm">Báo cáo</div>
        </div>
      )}
    </>
  );
}
