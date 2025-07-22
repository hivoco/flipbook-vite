import { useEffect, useState } from "react";

export const useResizeRerender = () => {
  const [reRender, setReRender] = useState(false);
  useEffect(() => {
    const handleResize = () => setReRender((prev) => !prev);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return reRender;
};
