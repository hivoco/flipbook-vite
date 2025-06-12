import React, { useCallback, useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import AudioRecorder from "./components/AudioRecorder";
import { FaWhatsapp } from "react-icons/fa";

import {
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  ExternalLink,
  FileBoxIcon,
  Fullscreen,
  Mail,
  MessageCircle,
  Minus,
  Music,
  Play,
  Plus,
  Volume1,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { FiRotateCw } from "react-icons/fi";

import { BASE_URL } from "../constant";
import YouTube from "react-youtube";
import ContactWidget from "./components/ContactWidget";
import {
  formatPhoneForWhatsApp,
  isEmail,
  isPhoneNumber,
  isWebsiteLink,
} from "./utility/LinkOpener";
import { useResizeRerender } from "./hooks/useResizeRerender";
import MenuPopup from "./components/MenuPopup";
import MultiShadowComponent from "./components/MultiShadowComponent";
import Demo from "./components/MultiShadowComponent";

const App = () => {
  const bookRef = useRef();
  const audioRef = useRef();
  const divRef = useRef();
  const videoRef = useRef();
  const imgContainerRef = useRef(null);
  const [imageContainerHeight, setImageContainerHeight] = useState(0);

  useEffect(() => {
    if (imgContainerRef?.current) {
      setImageContainerHeight(imgContainerRef.current.clientHeight);
    }
  }, []);

  const [audioSrc, setAudioSrc] = useState("");
  const [isPdfLandScape, setIsPdfLandScape] = useState(false);
  //static for now change manually
  const [visible, setVisible] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isOrientationPortrait, setIsOrientationPortrait] = useState(false);

  const [flipbookImages, setFlipbookImages] = useState([]);
  const [contactInfo, setContactInfo] = useState();
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

  useEffect(() => {
    const handler = () => {
      setIsOrientationPortrait(
        screen.orientation.type.includes("landscape") ? false : true
      );
    };

    handler(); // runs on page load  once only

    screen.orientation.addEventListener("change", handler); // runs on orientation change only

    return () => {
      screen.orientation.removeEventListener("change", handler);
    };
  }, []);

  // useEffect(() => {
  //   // setTotalPages(pages.length);
  //   if (flipbookName) {
  //     getFlipbookImages();
  //   }
  // }, [flipbookName]);

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
      // divRef?.current.requestFullscreen();
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

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

  // const isWebsiteLink = (url) => {
  //   const websitePatterns = [
  //     /^https?:\/\//i, // HTTP/HTTPS URLs
  //   ];

  //   // Check if it's not a media file or YouTube
  //   const isYoutube = url.includes("youtube.com") || url.includes("youtu.be");
  //   const videoExtensions = [
  //     ".mp4",
  //     ".webm",
  //     ".avi",
  //     ".mov",
  //     ".wmv",
  //     ".flv",
  //     ".mkv",
  //   ];
  //   const audioExtensions = [
  //     ".mp3",
  //     ".wav",
  //     ".ogg",
  //     ".m4a",
  //     ".aac",

  //     ".flac",
  //     ".wma",
  //   ];
  //   const isVideo = videoExtensions.some((ext) =>
  //     url.toLowerCase().includes(ext)
  //   );
  //   const isAudio = audioExtensions.some((ext) =>
  //     url.toLowerCase().includes(ext)
  //   );

  //   // It's a website link if it starts with http/https but is not YouTube, video, or audio
  //   return (
  //     websitePatterns.some((pattern) => pattern.test(url)) &&
  //     !isYoutube &&
  //     !isVideo &&
  //     !isAudio
  //   );
  // };

  // // Function to check if a string is a phone number
  // const isPhoneNumber = (str) => {
  //   // Remove all non-digit characters for validation
  //   const digitsOnly = str.replace(/\D/g, "");

  //   // Check various phone number patterns
  //   const phonePatterns = [
  //     /^\+?[\d\s\-\(\)]{7,15}$/, // General international format
  //     /^\+?\d{1,4}[\s\-]?\(?\d{1,4}\)?[\s\-]?\d{1,4}[\s\-]?\d{1,9}$/, // Flexible format
  //     /^[\+]?[1-9][\d]{0,15}$/, // Simple international format
  //   ];

  //   // Must have at least 7 digits and match a pattern
  //   return (
  //     digitsOnly.length >= 7 &&
  //     digitsOnly.length <= 15 &&
  //     phonePatterns.some((pattern) => pattern.test(str))
  //   );
  // };

  // // Function to check if a string is an email
  // const isEmail = (str) => {
  //   const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   return emailPattern.test(str);
  // };

  // // Function to format phone number for WhatsApp
  // const formatPhoneForWhatsApp = (phone) => {
  //   // Remove all non-digit characters except +
  //   let formatted = phone.replace(/[^\d+]/g, "");

  //   // If it doesn't start with +, add it
  //   if (!formatted.startsWith("+")) {
  //     formatted = "+" + formatted;
  //   }

  //   return formatted;
  // };

  // Function to handle media (audio/video/youtube/website/phone/email) click

  const handleMediaClick = (mediaUrl, event) => {
    // Check if it's a phone number
    if (isPhoneNumber(mediaUrl)) {
      const formattedPhone = formatPhoneForWhatsApp(mediaUrl);
      const whatsappUrl = `https://wa.me/${formattedPhone.substring(1)}`; // Remove + for WhatsApp URL
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      return;
    }

    // Check if it's an email
    if (isEmail(mediaUrl)) {
      const mailtoUrl = `mailto:${mediaUrl}`;
      window.open(mailtoUrl, "_blank");
      return;
    }

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

  const getFlipbookImages = useCallback(async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/brochure/brochure/${flipbookName}`
      );
      const data = await response.json();
      console.log(data?.data?.contactInfo, "data");

      setFlipbookImages(data?.data?.images);
      setContactInfo(data?.data?.contactInfo);
      setIsPdfLandScape(data?.data?.isLandScape);
    } catch (error) {
      console.error("Error fetching flipbook data:", error);
    }
  }, [flipbookName]);

  const getPoints = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/link/media-links/${flipbookName}`);
      const data = await res.json();
      setGotPoints(data?.data?.sort((a, b) => a.pageNumber - b.pageNumber));
    } catch (err) {
      console.error("Fetch failed:", err);
    }
  }, [flipbookName]);

  // console.log(gotPoints, "got points");

  useEffect(() => {
    if (flipbookName) {
      getPoints();
      getFlipbookImages();
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

  const reRender = useResizeRerender();

  return (
    <div className="relative h-svh w-full flex flex-col overflow-hidden">
      <div className="relative w-full flex-1 max-w-6xl mx-auto">
        <div ref={divRef} className="relative h-full  flex flex-col">
          <div className="flex-1 flex items-center justify-center  ">
            <div className=" transition-transform duration-300 ease-out w-full h-full flex gap-0 items-center justify-center ">
              {/* <div class="absolute pointer-events-none z-100 left-1/2 -translate-x-1/2 h-full top-1/2 -translate-y-1/2 w-[10%]  bg-[linear-gradient(89.43deg,rgba(0,0,0,0)_0.54%,rgba(0,0,0,0.05)_27.67%,rgba(30,30,30,0.5)_50.23%,rgba(0,0,0,0.05)_75.75%,rgba(0,0,0,0)_99.55%)]"></div> */}

              <HTMLFlipBook
                key={reRender}
                size="stretch"
                height={
                  window.innerWidth < 640
                    ? (window.innerWidth - 32) * 1.4
                    : isPdfLandScape
                    ? window.innerHeight
                    : 560
                }
                minHeight={
                  window.innerWidth < 640
                    ? window.innerWidth * 1.4
                    : isPdfLandScape
                    ? window.innerHeight
                    : 420
                }
                maxHeight={
                  window.innerWidth < 640
                    ? window.innerHeight - 200
                    : isPdfLandScape
                    ? window.innerHeight
                    : window.innerHeight - 70
                }
                width={
                  window.innerWidth < 640
                    ? window.innerWidth - 32
                    : isPdfLandScape
                    ? window.innerWidth * 0.9
                    : 400
                }
                minWidth={
                  window.innerWidth < 640
                    ? window.innerWidth
                    : isPdfLandScape
                    ? window.innerWidth * 0.8
                    : isPdfLandScape
                    ? window.innerWidth
                    : 300
                }
                maxWidth={
                  window.innerWidth < 640
                    ? window.innerWidth - 16
                    : isPdfLandScape
                    ? window.innerWidth
                    : (window.innerHeight - 70) / 1.4
                }
                mobileScrollSupport={true}
                onFlip={onFlip}
                flippingTime={500}
                ref={bookRef}
                usePortrait={true}
                startPage={0}
                autoSize={true}
                useMouseEvents={false}
                drawShadow={true}
                maxShadowOpacity={0.5}
                // data-density="hard"
                showCover={true}
                style={{
                  boxShadow: isPdfLandScape
                    ? ""
                    : `15px 0px 0px 0px #7A7A7A66,10px 0px 0px 0px #7A7A7A80, 5px 0px 0px 0px #7A7A7A99,2px 0px 0px 0px #7A7A7AB2,
                     0px 2px 2px 0px #00000033,-2px 0px 2px 0px #00000033, 0px -2px 2px 0px #0000001A`,
                  // with last one : "30px 0px 0px 0px #7A7A7A1A,25px 0px 0px 0px #7A7A7A33,20px 0px 0px 0px #7A7A7A4D,15px 0px 0px 0px #7A7A7A66,10px 0px 0px 0px #7A7A7A80, 5px 0px 0px 0px #7A7A7A99,2px 0px 0px 0px #7A7A7AB2,-4px 0px 4px 0px #0000004D",
                  // "0px 2px 2px 0px #00000033,-2px 0px 2px 0px #00000033,0px -2px 2px 0px #0000001A",  outline shadow potrait
                }}
                renderOnlyPageLengthChange={true}
                // style={{ boxShadow: "-20px 0 30px rgba(0, 0, 0, 0.3)" }}
                className={`
                  rounded-sm  flibook-container relative
                  ${
                    isPdfLandScape
                      ? "!h-[95svh] min-h-[90svh] !max-h-svh "
                      : // : "w-full h-auto max-w-full max-h-full"
                        // "!h-[95svh] min-h-[90svh] !max-h-svh"
                        "!max-h-full !h-auto sm:gradient-bg"
                  }
                  `}
              >
                {/* <MultiShadowComponent /> */}

                {flipbookImages?.map((imageSrc, index) => (
                  <div
                    key={index}
                    className={`relative bg-white overflow-hidden h-full w-full self-center flex justify-center 
                      ${isPdfLandScape ? "w-auto" : "w-full"}
                      `}
                  >
                    {/* <div 
                    className="h-full w-full relative"> */}
                    {/* <MultiShadowComponent /> */}
                    {/* <Demo/> */}
                    {/* </div> */}

                    {/* // w-full on this shows 2 removing it shows */}

                    <img
                      // shadow for landscape pdf
                      style={{
                        boxShadow: isPdfLandScape
                          ? "30px 0px 0px 0px #7A7A7A1A,25px 0px 0px 0px #7A7A7A33,20px 0px 0px 0px #7A7A7A4D,15px 0px 0px 0px #7A7A7A66,10px 0px 0px 0px #7A7A7A80, 5px 0px 0px 0px #7A7A7A99,2px 0px 0px 0px #7A7A7AB2,-4px 0px 4px 0px #0000004D"
                          : ``,
                      }}
                      src={imageSrc}
                      // style={{ boxShadow: "-20px 0 30px rgba(0, 0, 0, 0.3)" }}
                      alt={"image " + index}
                      // width={600}
                      // height={600}
                      // className={`
                      //   ${
                      //     isPdfLandScape
                      //       ? "mx-auto !w-auto !h-full object-contain"
                      //       : "object-contain h-full w-full sm:h-[95vh] sm:w-auto"
                      //   }
                      //   `}

                      className={`object-contain h-full
                      ${index % 2 === 0 ? "pageLeft" : "pageRight"}
                      ${
                        isPdfLandScape
                          ? "w-auto mx-auto"
                          : "w-full  sm:h-[90vh] sm:w-auto"
                      }
                      `}

                      // onClick={(e) => handleImageClick(e, index)}
                      // priority={true}
                    />

                    {gotPoints
                      .filter((obj) => obj.pageNumber === index + 1)
                      .map((obj, idx) => {
                        console.log(obj, idx);
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
                        const isWhatsapp = /^(\+91)?[6-9]\d{9}$/.test(
                          obj?.link
                        );
                        // basic Indian number
                        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                          obj?.link
                        );

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
                        let icon = <Volume1 size={14} />;

                        if (isWhatsapp) {
                          buttonColor = "bg-green-600 hover:bg-green-700";
                          icon = <FaWhatsapp size={14} />;
                        } else if (isEmail) {
                          buttonColor = "bg-red-700 hover:bg-red-800";
                          icon = <Mail size={14} />;
                        } else if (isWebsite) {
                          buttonColor = "bg-green-500 hover:bg-green-600";
                          icon = <ExternalLink size={14} />;
                        } else if (isYoutube) {
                          buttonColor = "bg-red-600 hover:bg-red-700";
                          icon = <Play size={14} />;
                        } else if (isVideo) {
                          buttonColor = "bg-purple-500 hover:bg-purple-600";
                          icon = <Play size={14} />;
                        }

                        return (
                          <div className="" key={idx}>
                            <button
                              style={{
                                left: `${obj?.coordinates?.x}%`,
                                top: `${obj?.coordinates.y}%`,
                              }}
                              onClick={(e) => handleMediaClick(obj?.link, e)}
                              className={`absolute shadow-lg w-6 h-6 pulse ${buttonColor} rounded-full opacity-100   flex items-center justify-center text-white transform -translate-x-1/2 -translate-y-1/2`}
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
                              <span className="">{icon}</span>
                            </button>
                          </div>
                        );
                      })}
                      
                  </div>
                ))}
              </HTMLFlipBook>
            </div>
          </div>

          {/* Fixed Controls Bar */}
          <div
            onMouseOver={() => setVisible(true)}
            onMouseOut={() => setVisible(false)}
            style={{
              opacity: visible ? 1 : 0,
              // backdropFilter: "blur(10px)",
              transition: "opacity 0.3s ease",
              // borderRadius: "12px",
              boxShadow: "0 8px 16px rgba(0,0,0,0.25)",
            }}
            className="bg-black/80 left-0 rounded-t-xl  right-0 bottom-0 sm:bottom-0 md:bottom-0  absolute flex items-center justify-between sm:justify-center px-2 sm:px-4 py-2 gap-1 sm:gap-8 flex-shrink-0"
          >
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
              {isFullscreen ? (
                <MdFullscreenExit size={28} />
              ) : (
                <MdFullscreen size={28} />
              )}
            </button>

            <button
              className="p-1 md:p-3 hover:bg-gray-700"
              aria-label={isPlaying ? "Mute Audio" : "Play Audio"}
              onClick={toggleAudio}
            >
              {isPlaying ? (
                <Volume2 color="white" size={28} />
              ) : (
                <VolumeX color="white" size={28} />
              )}
            </button>
            {/* <AudioRecorder
              permission={permission}
              setPermission={setPermission}
            /> */}
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

      {contactInfo && (
        <ContactWidget
          contactInfo={contactInfo}
          handleMediaClick={handleMediaClick}
        />
      )}

      {isOrientationPortrait && isPdfLandScape && (
        <div className="fixed top-0 left-0 px-4 w-full bg-yellow-500 text-black flex items-center justify-center py-2 shadow-md z-50">
          <FiRotateCw className="mr-4 text-2xl animate-spin-slow" />
          <span className="font-medium">
            Please rotate your device to <strong>landscape</strong> for the best
            experience.
          </span>
        </div>
      )}
    </div>
  );
};

export default App;
