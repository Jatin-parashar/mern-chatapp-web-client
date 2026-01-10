export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const showNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === "granted") {
    const notification = new Notification(title, {
      icon: "/logo.svg",
      badge: "/logo.svg",
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  }
  return null;
};

export const showMessageNotification = (senderName: string, message: string, avatar?: string) => {
  return showNotification(`${senderName}`, {
    body: message,
    icon: avatar || "/logo.svg",
    tag: "message",
  });
};

export const showCallNotification = (callerName: string, isVideo: boolean, avatar?: string) => {
  return showNotification(`Incoming ${isVideo ? "Video" : "Audio"} Call`, {
    body: `${callerName} is calling...`,
    icon: avatar || "/logo.svg",
    tag: "call",
    requireInteraction: true,
  });
};
