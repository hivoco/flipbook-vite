import { Utensils } from "lucide-react";
import { useState, useEffect, useRef } from "react";

function useStateTimer(currentPage) {
  // Renamed for clarity
  const [timeInState, setTimeInState] = useState(0);

  const startTimeRef = useRef(Date.now());
  const intervalRef = useRef(null);

  useEffect(() => {
    // Reset timer when state changes
    startTimeRef.current = Date.now();
    setTimeInState(0);

    // Clear previous interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    // Start new timer
    intervalRef.current = setInterval(() => {
      setTimeInState(Date.now() - startTimeRef.current);
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [currentPage]); // Depends on the current state value

  return Math.ceil(timeInState / 1000);
}

export default useStateTimer;
