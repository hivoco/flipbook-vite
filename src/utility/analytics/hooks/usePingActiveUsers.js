import { useEffect } from "react";
import { postData } from "../api";

const usePingActiveUsers = ({ sessionId, userId, flipbookName }) => {
  useEffect(() => {
    const ping = () => {
      postData({
        sessionId: sessionId || sessionStorage.getItem("sessionId"),
        userId: userId,
        flipbookId: flipbookName,
      });
    };

    ping(); // call immediately
    const interval = setInterval(ping, 5 * 60 * 1000);// 5 mins 

    return () => clearInterval(interval);
  }, [sessionId, userId, flipbookName]);
};

export default usePingActiveUsers;
