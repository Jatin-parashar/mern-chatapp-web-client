import moment from "moment";

export const formatDistanceToNow = (date: Date): string => {
  return moment(date).fromNow();
};

export const formatMessageTime = (date: Date): string => {
  const now = moment();
  const messageDate = moment(date);

  if (now.isSame(messageDate, "day")) {
    return messageDate.format("HH:mm");
  } else if (now.subtract(1, "day").isSame(messageDate, "day")) {
    return "Yesterday";
  } else if (now.isSame(messageDate, "year")) {
    return messageDate.format("MMM D");
  } else {
    return messageDate.format("MMM D, YYYY");
  }
};

export const formatCallDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};
