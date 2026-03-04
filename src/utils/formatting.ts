import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export const formatDistanceToNow = (date: Date): string => {
  return dayjs(date).fromNow();
};

export const formatMessageTime = (date: Date): string => {
  const now = dayjs();
  const msg = dayjs(date);

  if (now.isSame(msg, "day")) return msg.format("HH:mm");
  if (now.subtract(1, "day").isSame(msg, "day")) return "Yesterday";
  if (now.isSame(msg, "year")) return msg.format("MMM D");
  return msg.format("MMM D, YYYY");
};

export const formatCallDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};
