import React, { useEffect, useRef } from "react";

export default function PlaySound({ enabled }) {
  const FlipSoundRef = useRef(null);

  useEffect(() => {
    if (enabled) {
      FlipSoundRef.current.play();
    }
  }, [enabled]);

  return <audio ref={FlipSoundRef} src="/page-sound.mp3" />
}
