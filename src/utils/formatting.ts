import moment from "moment";

export const formatMessageTime = (timestamp: string | number | Date) => {
  const time = moment(timestamp);
  const now = moment();

  if (now.isSame(time, "day")) {
    // Today
    return time.format("hh:mm A"); // e.g. 04:15 PM
  } else if (now.subtract(1, "day").isSame(time, "day")) {
    // Yesterday
    return "Yesterday";
  } else if (now.isAfter(time) && now.diff(time, "days") < 7) {
    // Within last 7 days
    return time.format("ddd"); // e.g. Mon, Tue
  } else {
    // Older
    return time.format("DD/MM/YY"); // e.g. 01/04/25
  }
};
