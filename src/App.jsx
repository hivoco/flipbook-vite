import React, { useCallback, useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import Draggable from "react-draggable";
import AudioRecorder from "./components/AudioRecorder";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Fullscreen,
  Minus,
  Music,
  Play,
  Plus,
  Volume1,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { BASE_URL } from "../constant";
import YouTube from "react-youtube";

const App = () => {
  const bookRef = useRef();
  const audioRef = useRef();
  const divRef = useRef();
  const videoRef = useRef();
  const nodeRef = useRef(null);
  const [audioSrc, setAudioSrc] = useState("");

  const [flipbookImages, setFlipbookImages] = useState([]);
  const [flipbookName, setFlipbookName] = useState("");
  const [playingMediaId, setPlayingMediaId] = useState(null);

  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [permission, setPermission] = useState(false);
  const [totalPages, setTotalPages] = useState();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [visibleTooltip, setVisibleTooltip] = useState(null);
  const [videoIsPlaying, setVideoIsPlaying] = useState(false);
  const [activeGotPoint, setActiveGotPoint] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [currentVideoSrc, setCurrentVideoSrc] = useState("");
  const [isYouTubeVideo, setIsYouTubeVideo] = useState(false);
  const [youtubePlayer, setYoutubePlayer] = useState(null);
  const [showVideoPopup, setShowVideoPopup] = useState(false);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // set initially

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const name = window.location.pathname.split("/").pop();
    setFlipbookName(name);
  }, []);

  const getFlipbookImages = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/brochure/brochure/${flipbookName}`
      );
      const data = await response.json();
      setFlipbookImages(data?.data?.images);
    } catch (error) {
      console.error("Error fetching flipbook data:", error);
    }
  };

  useEffect(() => {
    // setTotalPages(pages.length);
    if (flipbookName) {
      getFlipbookImages();
    }
  }, [flipbookName]);

  const onFlip = useCallback(
    (e) => {
      console.log("Current page: " + e.data);
      setActiveGotPoint(null); // Close any active gotPoint actions
    },
    [currentAudioIndex]
  );

  const handleZoomIn = () => {
    setZoomLevel(Math.min(zoomLevel + 0.1, 1.5));
  };

  const handleZoomOut = () => {
    setZoomLevel(Math.max(zoomLevel - 0.1, 0.8));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      divRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const toggleAudio = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleTooltip = (pageIndex, pointIndex) => {
    const tooltipId = `${pageIndex}-${pointIndex}`;
    if (visibleTooltip === tooltipId) {
      setVisibleTooltip(null);
    } else {
      setVisibleTooltip(tooltipId);
    }
  };

  const handleGotPointClick = (e, gotPoint) => {
    e.stopPropagation();
    setActiveGotPoint(activeGotPoint === gotPoint._id ? null : gotPoint._id);
    // setSelectedPoint(null); // 
  };

  const toggleVideoPlayBack = () => {
    if (!videoRef.current) return;

    if (videoIsPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }

    setVideoIsPlaying(!videoIsPlaying);
  };

  const isWebsiteLink = (url) => {
    const websitePatterns = [
      /^https?:\/\//i, // HTTP/HTTPS URLs
    ];

    // Check if it's not a media file or YouTube
    const isYoutube = url.includes("youtube.com") || url.includes("youtu.be");
    const videoExtensions = [
      ".mp4",
      ".webm",
      ".avi",
      ".mov",
      ".wmv",
      ".flv",
      ".mkv",
    ];
    const audioExtensions = [
      ".mp3",
      ".wav",
      ".ogg",
      ".m4a",
      ".aac",

      ".flac",
      ".wma",
    ];
    const isVideo = videoExtensions.some((ext) =>
      url.toLowerCase().includes(ext)
    );
    const isAudio = audioExtensions.some((ext) =>
      url.toLowerCase().includes(ext)
    );

    // It's a website link if it starts with http/https but is not YouTube, video, or audio
    return (
      websitePatterns.some((pattern) => pattern.test(url)) &&
      !isYoutube &&
      !isVideo &&
      !isAudio
    );
  };

  // Function to handle media (audio/video/youtube/website) click
  const handleMediaClick = (mediaUrl, event) => {
    // Check if it's a website link
    if (isWebsiteLink(mediaUrl)) {
      window.open(mediaUrl, "_blank", "noopener,noreferrer");
      return;
    }

    // Check if it's a YouTube URL
    const isYoutube =
      mediaUrl.includes("youtube.com") || mediaUrl.includes("youtu.be");

    // Check if it's a regular video file
    const videoExtensions = [
      ".mp4",
      ".webm",
      ".avi",
      ".mov",
      ".wmv",
      ".flv",
      ".mkv",
    ];
    const isVideo = videoExtensions.some((ext) =>
      mediaUrl.toLowerCase().includes(ext)
    );

    if (isYoutube || isVideo) {
      // Handle video - position popup near the clicked button
      const rect = event.target.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft =
        window.pageXOffset || document.documentElement.scrollLeft;

      setPopupPosition({
        x: rect.right + scrollLeft + 10, // 10px to the right of button
        y: rect.top + scrollTop,
      });

      setCurrentVideoSrc(mediaUrl);
      setIsYouTubeVideo(isYoutube);
      setShowVideoPopup(true);

      // Pause any playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      // Handle audio
      setAudioSrc(mediaUrl);
      setShowVideoPopup(false);
    }
  };

  useEffect(() => {
    if (!audioRef.current || !audioSrc) return;

    audioRef.current.play();
    setIsPlaying(true);
  }, [audioSrc]);

  const [gotPoints, setGotPoints] = useState([]);

  const getPoints = async () => {
    try {
      const res = await fetch(`${BASE_URL}/link/media-links/${flipbookName}`);
      const data = await res.json();
      setGotPoints(data?.data?.sort((a, b) => a.pageNumber - b.pageNumber));
    } catch (err) {
      console.error("Fetch failed:", err);
    }
  };
  console.log(gotPoints,'got points');
  

  useEffect(() => {
    if (flipbookName) {
      getPoints();
    }
  }, [flipbookName]);
  const getYouTubeVideoId = (url) => {
    if (!url) return null;

    // Handle different YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const closeVideoPopup = () => {
    setShowVideoPopup(false);
    setCurrentVideoSrc("");
    setIsYouTubeVideo(false);

    // Pause regular video
    if (videoRef.current) {
      videoRef.current.pause();
      setVideoIsPlaying(false);
    }

    // Pause YouTube video
    if (youtubePlayer) {
      youtubePlayer.pauseVideo();
      setVideoIsPlaying(false);
    }
  };

  return (
    <div className="h-svh  w-full flex flex-col overflow-hidden">
      <div className="relative w-full flex-1 max-w-6xl mx-auto">
        <div
          ref={divRef}
          className="relative h-full bg-[#E94B7A] flex flex-col"
        >
          {/* Book Container - takes remaining space */}
          {/* p-2 sm:p-4 */}
          <div className="flex-1 flex items-center justify-center  ">
            <div
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: "center",
              }}
              className="transition-transform duration-300 ease-out w-full h-full flex items-center justify-center"
            >
              <HTMLFlipBook
                // Mobile settings - full width
                width={window.innerWidth < 640 ? window.innerWidth - 32 : 400}
                height={
                  window.innerWidth < 640 ? (window.innerWidth - 32) * 1.4 : 560
                }
                // Desktop settings
                size="stretch"
                //min width and height
                minWidth={window.innerWidth < 640 ? window.innerWidth : 300}
                minHeight={
                  window.innerWidth < 640 ? window.innerWidth * 1.4 : 420
                }
                //max width and height
                maxWidth={
                  window.innerWidth < 640
                    ? window.innerWidth - 16
                    : (window.innerHeight - 70) / 1.4
                }
                maxHeight={
                  window.innerWidth < 640
                    ? window.innerHeight - 200
                    : window.innerHeight - 70
                }
                mobileScrollSupport={true}
                onFlip={onFlip}
                flippingTime={500}
                ref={bookRef}
                startPage={0}
                autoSize={true}
                useMouseEvents={false}
                className="w-full h-auto max-w-full max-h-full "
              >
                {flipbookImages?.map((imageSrc, index) => (
                  <div
                    key={index}
                    className="relative bg-white overflow-hidden w-full h-full self-center flex justify-center"
                  >
                    <img
                      src={imageSrc}
                      alt={"image " + index}
                      // width={600}
                      // height={600}
                      className="object-contain h-full w-full sm:h-[90vh] sm:w-auto "
                      // onClick={(e) => handleImageClick(e, index)}
                      // priority={true}
                    />

                    {gotPoints
                      .filter((obj) => obj.pageNumber === index + 1)
                      .map((obj, idx) => {
                        // return (
                        //   <div className="" key={idx}>
                        //     <div
                        //       className={`absolute inset-0 w-4 h-4 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 border-2 border-white shadow-lg hover:scale-110 transition-transform ${
                        //         playingMediaId === obj._id
                        //           ? "bg-green-400"
                        //           : "bg-blue-400"
                        //       }`}
                        //       style={{
                        //         left: `${obj.coordinates.x}%`,
                        //         top: `${obj.coordinates.y}%`,
                        //         zIndex: 10,
                        //       }}
                        //       onClick={(e) => {
                        //         handleMediaClick(obj?.link, e);
                             
                        //       }}
                             
                        //     />

                          
                        //   </div>
                        // );
                        const isWebsite = isWebsiteLink(obj?.link);
                        const isYoutube =
                          obj?.link.includes("youtube.com") ||
                          obj?.link.includes("youtu.be");
                        const videoExtensions = [
                          ".mp4",
                          ".webm",
                          ".avi",
                          ".mov",
                          ".wmv",
                          ".flv",
                          ".mkv",
                        ];
                        const isVideo = videoExtensions.some((ext) =>
                          obj?.link.toLowerCase().includes(ext)
                        );
  
                        // Determine button color and icon
                        let buttonColor = "bg-blue-300 hover:bg-blue-600"; // Default for audio
                        let icon = <Volume1 size={8} />;
  
                        if (isWebsite) {
                          buttonColor = "bg-green-500 hover:bg-green-600"; // Green for websites
                          icon = <ExternalLink size={8} />;
                        } else if (isYoutube) {
                          buttonColor = "bg-red-600 hover:bg-red-700"; // YouTube red
                          icon = <Play size={8} />;
                        } else if (isVideo) {
                          buttonColor = "bg-purple-500 hover:bg-purple-600"; // Purple for regular video
                          icon = <Play size={8} />;
                        }
  
                        return (
                          <div key={idx}>
                            <button
                              style={{
                                left: `${obj?.coordinates?.x}%`,
                                top: `${obj?.coordinates.y}%`,
                              }}
                              onClick={(e) =>
                                handleMediaClick(obj?.link, e)
                              }
                              className={`absolute shadow-lg w-4 h-4 pulse ${buttonColor} rounded-full flex items-center justify-center text-white transform -translate-x-1/2 -translate-y-1/2`}
                              title={`${
                                isWebsite
                                  ? "Open Website"
                                  : isYoutube
                                  ? "Play YouTube Video"
                                  : isVideo
                                  ? "Play Video"
                                  : "Play Audio"
                              }: ${obj?.coordinates?.label}`}
                            >
                              <span>{icon}</span>
                            </button>
                            </div>
                        )
  
                     })}
                  </div>
                ))}
              </HTMLFlipBook>
            </div>
          </div>

          {/* Fixed Controls Bar */}
          <div className="bg-gray-800 flex items-center justify-between sm:justify-center px-2 sm:px-4 py-2 gap-1 sm:gap-8 flex-shrink-0">
            <button
              onClick={() => {
                audioRef.current.pause();
                bookRef.current.pageFlip().flipPrev();
                setCurrentPage(currentPage > 0 ? currentPage - 2 : currentPage);
              }}
              className="text-white p-1 md:p-3 hover:bg-gray-700"
              aria-label="Previous page"
            >
              <ChevronLeft size={28} />
            </button>
            {/* 
            <button
              onClick={handleZoomOut}
              className="text-white p-1 md:p-3 hover:bg-gray-700"
              aria-label="Zoom out"
            >
              <Minus size={28} />
            </button> */}

            <div className="hidden md:flex justify-center items-center gap-2">
              <div className="text-white min-w-24 whitespace-nowrap">
                Page {currentPage + 1}-{currentPage + 2} /
                {flipbookImages.length}
              </div>
            </div>

            {/* <button
              onClick={handleZoomIn}
              className="text-white p-1 md:p-3 hover:bg-gray-700"
              aria-label="Zoom in"
            >
              <Plus size={28} />
            </button> */}

            <button
              onClick={() => {
                audioRef.current.pause();
                bookRef.current.pageFlip().flipNext();
                setCurrentPage(
                  currentPage < flipbookImages.length - 2
                    ? currentPage + 2
                    : currentPage
                );
              }}
              className="text-white p-1 md:p-3 hover:bg-gray-700"
              aria-label="Next page"
            >
              <ChevronRight size={28} />
            </button>

            <button
              onClick={toggleFullscreen}
              className="text-white p-1 md:p-3 hover:bg-gray-700"
              aria-label="Full screen"
            >
              <Fullscreen size={28} />
            </button>

            <button
              className="p-1 md:p-3"
              aria-label={isPlaying ? "Mute Audio" : "Play Audio"}
              onClick={toggleAudio}
            >
              {isPlaying ? (
                <Volume2 color="white" size={28} />
              ) : (
                <VolumeX color="white" size={28} />
              )}
            </button>

            <AudioRecorder
              permission={permission}
              setPermission={setPermission}
            />
          </div>
        </div>
      </div>

      <audio ref={audioRef} src={audioSrc ? audioSrc : null}></audio>
      {showVideoPopup && (
        <>
          {/* Backdrop to close popup when clicking outside */}
          <div className="fixed inset-0 z-40" onClick={closeVideoPopup} />
          <div
            className="fixed z-50 bg-black rounded-lg shadow-2xl border-2 border-gray-600"
            style={{
              left: ` ${Math.min(popupPosition.x, window.innerWidth - 320)}px`, // Ensure it doesn't go off screen
              top: `${Math.min(popupPosition.y, window.innerHeight - 240)}px`,
              width: "300px",
              height: "220px",
            }}
          >
            <button
              onClick={closeVideoPopup}
              className="absolute top-1 right-1 z-10 bg-red-600 hover:bg-red-700 text-white rounded-full p-1"
              aria-label="Close video"
            >
              <X size={16} />
            </button>

            {isYouTubeVideo ? (
              <YouTube
                videoId={getYouTubeVideoId(currentVideoSrc)}
                opts={{
                  height: "200",
                  width: "290",
                  playerVars: {
                    autoplay: 1,
                    modestbranding: 1,
                    rel: 0,
                  },
                }}
                onReady={(event) => {
                  setYoutubePlayer(event.target);
                  setVideoIsPlaying(true);
                }}
                onPlay={() => setVideoIsPlaying(true)}
                onPause={() => setVideoIsPlaying(false)}
                onEnd={() => setVideoIsPlaying(false)}
                className="rounded-lg overflow-hidden"
                style={{ padding: "10px" }}
              />
            ) : (
              <video
                ref={videoRef}
                src={currentVideoSrc}
                controls
                autoPlay
                className="w-full h-full rounded-lg"
                onPlay={() => setVideoIsPlaying(true)}
                onPause={() => setVideoIsPlaying(false)}
                onEnded={() => setVideoIsPlaying(false)}
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default App;
