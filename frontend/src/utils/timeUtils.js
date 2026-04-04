// src/utils/timeUtils.js
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday.js";
import isYesterday from "dayjs/plugin/isYesterday.js";
import weekOfYear from "dayjs/plugin/weekOfYear.js";
import localizedFormat from "dayjs/plugin/localizedFormat.js";
import 'dayjs/locale/vi.js';

dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(weekOfYear);
dayjs.extend(localizedFormat);
dayjs.locale('vi');

export const computeTimestamps = (messages, gapMinutes = 30) => {
  if (!messages || messages.length === 0) return [];

  return messages.map((msg, index) => {
    const prev = messages[index - 1];
    let showTimestamp = false;
    const created = dayjs(msg.createdAt);

    // Khoảng cách giữa 2 tin nhắn
    if (!prev) {
      showTimestamp = true; // tin nhắn đầu tiên luôn hiển thị
    } else {
      const diff = created.diff(dayjs(prev.createdAt), "minute");
      const differentDay = !created.isSame(dayjs(prev.createdAt), "day");
      if (diff >= gapMinutes || differentDay) showTimestamp = true;
    }

    return {
      ...msg,
      showTimestamp,
      timestampLabel: formatMessageTime(created)
    };
  });
};

// Hàm format thời gian theo yêu cầu
export const formatMessageTime = (created) => {
  const now = dayjs();

  if (created.isToday()) {
    // Trong ngày
    return created.format("HH:mm");
  } else if (created.isYesterday()) {
    return `Hôm qua lúc ${created.format("HH:mm")}`;
  } else if (now.week() === created.week() && now.year() === created.year()) {
    // Cùng tuần
    const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return `${weekdays[created.day()]} lúc ${created.format("HH:mm")}`;
  } else if (now.month() === created.month() && now.year() === created.year()) {
    // Cùng tháng
    return `${created.format("DD [THG] MM")} lúc ${created.format("HH:mm")}`;
  } else if (now.year() === created.year()) {
    // Cùng năm
    return `${created.format("DD [THG] MM, YYYY")} lúc ${created.format("HH:mm")}`;
  } else {
    // Năm khác
    return created.format("DD/MM/YYYY HH:mm");
  }
};
