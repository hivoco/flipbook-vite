import { useEffect } from "react";
import { recordPageView } from "../api";

const usePageDwellTime = ({
  currentPage,
  lastPageNumber,
  sessionId,
  timeInState,
}) => {
  useEffect(() => {
    if (lastPageNumber <= 0) return;
    if (sessionId || sessionStorage.getItem("sessionId")) {
      recordPageView({
        sessionId: sessionId || sessionStorage.getItem("sessionId"),
        pageNumber:  lastPageNumber,
        timeOnPages: timeInState,
      });
    }
  }, [currentPage]);
};

export default usePageDwellTime;
