import { useEffect, useState } from "react";

export const useResizeRerender = () => {
  const [reRender, setReRender] = useState(false);
  useEffect(() => {
    const handleResize = () => setReRender((prev) => !prev);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);

    // document.addEventListener("fullscreenchange", () => {
    //   // works well for opening full screen devices
    //   if (document.fullscreenElement) {
    //     setReRender(!reRender);
    //     // Your code when fullscreen is activated
    //   } else {
    //     setReRender(!reRender);
    //   }
    // });
  }, []);

  return reRender;
};

// ui issues exist
// on some renders they show up
// on some they dont
// on resize they show up/ or get removed which is interesting

// no such issues on landscape
//  except for points dont show up sometimes
