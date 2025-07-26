import React, { useCallback, useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import AudioRecorder from "./components/AudioRecorder";
import { FaWhatsapp } from "react-icons/fa";

import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  ExternalLink,
  FileBoxIcon,
  Fullscreen,
  Images,
  LoaderCircle,
  Mail,
  MessageCircle,
  MessageCircleMore,
  Minus,
  Music,
  Play,
  Plus,
  Volume1,
  Volume2,
  VolumeX,
  X,
  Youtube,
} from "lucide-react";
import {
  MdCleaningServices,
  MdFullscreen,
  MdFullscreenExit,
} from "react-icons/md";
import { FiChevronLeft, FiRotateCw } from "react-icons/fi";

import { BASE_URL } from "../constant";
import YouTube from "react-youtube";
import ContactWidget from "./components/ContactWidget";

import { useResizeRerender } from "./hooks/useResizeRerender";
import MenuPopup from "./components/MenuPopup";
import HoverCarousel from "./components/HoverCarousel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhotoFilm } from "@fortawesome/free-solid-svg-icons";
import { faYoutube } from "@fortawesome/free-brands-svg-icons";
import PlaySound from "./components/PlaySound";
import { getYouTubeVideoId } from "./utility/utility";
import RotatePhoneRequest from "./components/RotatePhoneRequest";
import Loading from "./components/Loading";
import { endSession, logEvent, startSession } from "./utility/analytics/api";

import {
  generateUniqueId,
  getDeviceInfo,
  getUserLocation,
  getUTMParams,
} from "./utility/analyticsHelpers";
import useStateTimer from "./utility/analytics/hooks/useStateTimer";
import usePingActiveUsers from "./utility/analytics/hooks/usePingActiveUsers";
import usePageDwellTime from "./utility/analytics/hooks/usePageDwellTime";

const App = () => {
  const bookRef = useRef();
  const audioRef = useRef();
  const divRef = useRef();
  const videoRef = useRef();
  const FlipSoundRef = useRef(null);
  const [permission, setPermission] = useState(false);

  // const {
  //   recordingStatus,
  //   audioURL,
  //   error,
  //   handleStart,
  //   stopRecording,
  //   clearRecording,
  // } = useAudioRecorder({ permission, setPermission });

  const [audioSrc, setAudioSrc] = useState("");
  const [displayOverlay, setDisplayOverlay] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const [isPdfLandScape, setIsPdfLandScape] = useState(false);
  const [isPageFlipSoundOn, setIsPageFlipSoundOn] = useState(false);

  //static for now change manually
  const [visible, setVisible] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isOrientationPortrait, setIsOrientationPortrait] = useState(false);

  const [flipbookImages, setFlipbookImages] = useState([]);

  const [contactInfo, setContactInfo] = useState();
  const [flipbookName, setFlipbookName] = useState("");
  const [showCarousel, setShowCarousel] = useState(null);
  // const [playingMediaId, setPlayingMediaId] = useState(null);

  // const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const [lastPageNumber, setLastPageNumber] = useState(1);

  // const [permission, setPermission] = useState(false);
  // const [totalPages, setTotalPages] = useState();
  // const [zoomLevel, setZoomLevel] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  // const [visibleTooltip, setVisibleTooltip] = useState(null);
  const [videoIsPlaying, setVideoIsPlaying] = useState(false);
  // const [activeGotPoint, setActiveGotPoint] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [currentVideoSrc, setCurrentVideoSrc] = useState("");
  const [isVideoVertical, setIsVideoVertical] = useState(false);
  const [isYouTubeVideo, setIsYouTubeVideo] = useState(false);
  const [youtubePlayer, setYoutubePlayer] = useState(null);
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const lastMouseY = useRef(0);
  const [sessionId, setSessionId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [flipbookCompleted, setFlipbookCompleted] = useState(false);

  useEffect(() => {
    const name = window.location.pathname.split("/").pop();
    setFlipbookName(name);
  }, []);

  useEffect(() => {
    const handler = () => {
      setIsOrientationPortrait(
        screen.orientation.type?.includes("landscape") ? false : true
      );
    };

    handler(); // runs on page load  once only

    screen.orientation.addEventListener("change", handler); // runs on orientation change only

    return () => {
      screen.orientation.removeEventListener("change", handler);
    };
  }, []);

  const onFlip = useCallback((e) => {
    setCurrentPage(e.data);
  }, []);

  const toggleFullscreen = () => {
    setCurrentPage(0); // syncs the state with flipbook
    const elem = document.documentElement;

    if (!document.fullscreenElement) {
      // divRef?.current.requestFullscreen();
      elem.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      // keep this state  in sync when closed using esc btn
      if (!document.fullscreenElement) {
        setCurrentPage(0);
        // when closing the fullscreen using esc btn , keep the opened page in sync
      }
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

  const isWebsiteLink = (url) => {
    const websitePatterns = [
      /^https?:\/\//i, // HTTP/HTTPS URLs
    ];

    // Check if it's not a media file or YouTube
    const isYoutube = url?.includes("youtube.com") || url?.includes("youtu.be");
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
      url.toLowerCase()?.includes(ext)
    );
    const isAudio = audioExtensions.some((ext) =>
      url.toLowerCase()?.includes(ext)
    );

    // It's a website link if it starts with http/https but is not YouTube, video, or audio
    return (
      websitePatterns.some((pattern) => pattern.test(url)) &&
      !isYoutube &&
      !isVideo &&
      !isAudio
    );
  };

  // Function to check if a string is a phone number
  const isPhoneNumber = (str) => {
    // Remove all non-digit characters for validation
    const digitsOnly = str.replace(/\D/g, "");

    // Check various phone number patterns
    const phonePatterns = [
      /^\+?[\d\s\-\(\)]{7,15}$/, // General international format
      /^\+?\d{1,4}[\s\-]?\(?\d{1,4}\)?[\s\-]?\d{1,4}[\s\-]?\d{1,9}$/, // Flexible format
      /^[\+]?[1-9][\d]{0,15}$/, // Simple international format
    ];

    // Must have at least 7 digits and match a pattern
    return (
      digitsOnly.length >= 7 &&
      digitsOnly.length <= 15 &&
      phonePatterns.some((pattern) => pattern.test(str))
    );
  };

  // Function to check if a string is an email
  const isEmail = (str) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(str);
  };

  // Function to format phone number for WhatsApp
  const formatPhoneForWhatsApp = (phone) => {
    // Remove all non-digit characters except +
    let formatted = phone.replace(/[^\d+]/g, "");

    // If it doesn't start with +, add it
    if (!formatted.startsWith("+")) {
      formatted = "+" + formatted;
    }

    return formatted;
  };

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
      mediaUrl?.includes("youtube.com") || mediaUrl?.includes("youtu.be");

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
      mediaUrl?.toLowerCase()?.includes(ext)
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
      audioRef.current.play();
      setShowVideoPopup(false);
    }
  };

  useEffect(() => {
    if (!audioRef.current || !audioSrc) return;
    audioRef.current.play();
  }, [audioSrc]);

  const [gotPoints, setGotPoints] = useState([]);

  const getFlipbookImages = useCallback(async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/brochure/brochure/${flipbookName}`
      );
      const data = await response.json();
      console.log(data, "datat");

      // console.log(data, "data");
      setPermission(data?.data?.isRecordingEnable);
      setFlipbookImages(data?.data?.images);
      setContactInfo(data?.data?.contactInfo);
      setIsPdfLandScape(data?.data?.isLandScape);
      setIsPageFlipSoundOn(data?.data?.pageFlipSound);
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

  const closeVideoPopup = () => {
    setShowVideoPopup(false);
    setCurrentVideoSrc("");
    setIsYouTubeVideo(false);
    setDisplayOverlay(false);
    //remove black overlay

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

  useEffect(() => {
    if (FlipSoundRef?.current && isPageFlipSoundOn) {
      FlipSoundRef.current?.play();
    }
    setFlipbookCompleted(currentPage + 1 === flipbookImages.length);

    sessionStorage.setItem(
      "flipbookCompleted",
      currentPage + 1 === flipbookImages.length
    );
  }, [currentPage, isPageFlipSoundOn]);

  function displayPageNumInBar(pageNum) {
    const total = flipbookImages.length;
    if (isPdfLandScape || window.innerWidth < 640)
      return `${pageNum + 1} / ${total}`;

    if (pageNum === 0 || pageNum + 1 === total) {
      return `${pageNum + 1}/${total}`;
    }

    return `${pageNum + 1}-${pageNum + 2}/${total}`;
  }

  async function startUserSession(flipbookName) {
    let userId = localStorage.getItem("userId");
    if (!userId) {
      userId = generateUniqueId();
      localStorage.setItem("userId", userId);
    }
    setUserId(userId);

    const location = await getUserLocation();

    const res = await startSession({
      userId: userId,
      flipbookId: flipbookName,
      source: "direct",
      referrer: "unknown",
      utm: getUTMParams(),
      device: getDeviceInfo(),
      location: location,
    });

    const data = await res.sessionId;
    console.log(data, "data");

    sessionStorage.setItem("sessionId", data);
    setSessionId(data);
  }

  async function endUserSession() {
    endSession({
      sessionId: sessionId || sessionStorage.getItem("sessionId"),
      completed:
        flipbookCompleted || sessionStorage.getItem("flipbookCompleted"),
    });
  }

  useEffect(() => {
    if (flipbookName) {
      startUserSession(flipbookName);
    }
  }, [flipbookName]);

  usePingActiveUsers({
    sessionId: sessionId,
    userId: userId,
    flipbookId: flipbookName,
  });

  const timeInState = useStateTimer(currentPage);

  usePageDwellTime({
    currentPage: currentPage,
    lastPageNumber: isPdfLandScape
      ? [lastPageNumber]
      : [lastPageNumber - 1, lastPageNumber],
    sessionId: sessionId || sessionStorage.getItem("sessionId"),
    timeInState: timeInState,
  });

  function log(eventType, mongoid, buttonText, coordinatesObj, url) {
    logEvent({
      sessionId: sessionId || sessionStorage.getItem("sessionId"),
      userId: userId || localStorage.getItem("userId"),
      flipbookId: flipbookName,
      eventType: eventType,
      pageNumber: currentPage,
      timeOnPage: timeInState,
      buttonId: mongoid,
      buttonText: buttonText,
      elementId: mongoid,
      clickPosition: coordinatesObj,
      value: url,
    });
  }

  useEffect(() => {
    const handleUnload = (e) => {
      if (sessionId || sessionStorage.getItem("sessionId")) {
        endUserSession();
      }
      e.preventDefault(); // Required for Chrome
      e.returnValue = ""; // Required for older browsers
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  return (
    <div className="relative h-svh w-full flex flex-col overflow-hidden">
      {displayOverlay && (
        <div className="absolute  z-0 pointer-events-none w-screen h-screen top-0 left-0 bg-black/70 " />
      )}

      <div className="relative w-full flex-1 max-w-6xl mx-auto">
        <div ref={divRef} className="relative h-full  flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="relative transition-transform duration-300 ease-out w-full h-full flex gap-0 items-center justify-center ">
              {flipbookImages.length > 0 && gotPoints.length >= 0 ? (
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
                  swipeDistance={50}
                  useMouseEvents={!(window.innerWidth > 1000)}
                  // useMouseEvents={true}
                  drawShadow={true}
                  maxShadowOpacity={0.5}
                  // data-density={isPdfLandScape ? "hard" : "soft"}
                  showCover={window.innerWidth > 1000 && !isPdfLandScape}
                  // show cover not looking good in single image /landscape view
                  style={{
                    // stacked page animation as well as shadow
                    boxShadow: isPdfLandScape
                      ? ""
                      : currentPage === 0
                      ? ""
                      : `15px 0px 0px 0px #7A7A7A66,10px 0px 0px 0px #7A7A7A80, 5px 0px 0px 0px #7A7A7A99,2px 0px 0px 0px #7A7A7AB2,
                     0px 2px 2px 0px #00000033,-2px 0px 2px 0px #00000033, 0px -2px 2px 0px #0000001A`,
                    // with last one : "30px 0px 0px 0px #7A7A7A1A,25px 0px 0px 0px #7A7A7A33,20px 0px 0px 0px #7A7A7A4D,15px 0px 0px 0px #7A7A7A66,10px 0px 0px 0px #7A7A7A80, 5px 0px 0px 0px #7A7A7A99,2px 0px 0px 0px #7A7A7AB2,-4px 0px 4px 0px #0000004D",
                    // "0px 2px 2px 0px #00000033,-2px 0px 2px 0px #00000033,0px -2px 2px 0px #0000001A",  outline shadow potrait
                  }}
                  renderOnlyPageLengthChange={false}
                  // style={{ boxShadow: "-20px 0 30px rgba(0, 0, 0, 0.3)" }}
                  className={`
                  rounded-sm  flibook-container relative select-none  

                  ${
                    isPdfLandScape
                      ? "!h-[95svh] min-h-[90svh] !max-h-[99svh]"
                      : // : "w-full h-auto max-w-full max-h-full"
                        // "!h-[95svh] min-h-[90svh] !max-h-svh"
                        `!max-h-full !h-auto 
                        }`
                  }

                  ${
                    !isPdfLandScape &&
                    window.innerWidth > 640 &&
                    currentPage !== 0
                      ? "gradient-bg"
                      : ""
                  }

                  ${
                    isPdfLandScape && !isFullscreen && window.innerWidth > 1000
                      ? "single-page"
                      : ""
                  }
                  `}

                  //tailwind cant process this : sm:class Defined In index.css
                >
                  {flipbookImages?.map((imageSrc, index) => (
                    <div
                      key={index}
                      className={`relative bg-white overflow-hidden h-full w-full self-center  justify-center  items-center 
                      ${
                        index === 0 && !isPdfLandScape
                          ? " lg:right-1/2 lg:-translate-x-1/2"
                          : ""
                      }
                      ${isPdfLandScape ? "w-auto  " : "w-full"}
                      `}
                    >
                      {displayOverlay && (
                        <div className="absolute  z-40 pointer-events-none w-screen h-screen top-0 left-0 bg-black/70 " />
                      )}

                      <img
                        // shadow for landscape pdf
                        style={{
                          boxShadow: isPdfLandScape
                            ? //stack right
                              `
                            15px 0px 0px 0px #7A7A7A66,10px 0px 0px 0px #7A7A7A80, 5px 0px 0px 0px #7A7A7A99,2px 0px 0px 0px #7A7A7AB2,
                            0px 2px 2px 0px #00000033,-2px 0px 2px 0px #00000033, 0px -2px 2px 0px #0000001A,

                            0 25px 40px rgba(0, 0, 0, 0.4),
                            0 35px 60px rgba(0, 0, 0, 0.2),
                            0 8px 15px rgba(0, 0, 0, 0.3),
                            0 0 0 1px rgba(255, 255, 255, 0.1)`
                            : //shadow around the image
                              // old "30px 0px 0px 0px #7A7A7A1A,25px 0px 0px 0px #7A7A7A33,20px 0px 0px 0px #7A7A7A4D,15px 0px 0px 0px #7A7A7A66,10px 0px 0px 0px #7A7A7A80, 5px 0px 0px 0px #7A7A7A99,2px 0px 0px 0px #7A7A7AB2,-4px 0px 4px 0px #0000004D"
                              ``,
                        }}
                        src={imageSrc}
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

                        className={`object-contain h-full relative 
                        ${
                          isPdfLandScape
                            ? "w-auto mxauto justify-self-center"
                            : "w-full  lg:h-[90vh] lg:w-auto"
                        }
                        `}
                      />

                      {/* {isPdfLandScape && (
                        <>
                          <ChevronLast
                            onClick={() =>
                              bookRef.current
                                .pageFlip()
                                .turnToPage(flipbookImages.length - 1)
                            }
                            className="absolute bottom-0 right-5 -translate-y-1/2  hidden lg:inline text-gray-400 "
                            size={20}
                          />

                          <ChevronRight
                            size={28}
                            className="absolute top-1/2 right-5 -translate-y-1/2  hidden lg:inline text-gray-400 "
                            // className="absolute left-0 top-1/2 -translate-y-1/2"
                            onClick={() =>
                              bookRef.current.pageFlip().flipNext()
                            }
                          />
                        </>
                      )} */}

                      {/* // page number in backend from 1  */}
                      {gotPoints
                        .filter((obj) => obj.pageNumber === index + 1)
                        .map((obj, idx) => {
                          // Initialize variables outside the if block
                          let isWhatsapp = false;
                          let isEmail = false;
                          let isWebsite = false;
                          let isYoutube = false;
                          let isVideo = false;
                          let typeOfBtn;

                          // Determine button color and icon
                          let buttonColor = "bg-[#006AE6] hover:bg-[#006AE7]"; // Default for carousel

                          let icon = (
                            <FontAwesomeIcon
                              size={14}
                              icon={faPhotoFilm}
                              beatFade
                              style={{ color: "#ffffff" }}
                            />
                          );

                          // <FontAwesomeIcon  className="text-white"  icon="fa-solid fa-photo-film" />
                          // <Images size={14} />; // Default carousel icon (Images from lucide-react)
                          if (obj?.link) {
                            isWhatsapp = /^(\+91)?[6-9]\d{9}$/.test(obj?.link);

                            // Basic Indian number validation
                            isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                              obj?.link
                            );

                            isWebsite = isWebsiteLink(obj?.link);
                            isYoutube =
                              obj?.link?.includes("youtube.com") ||
                              obj?.link?.includes("youtu.be");
                            const videoExtensions = [
                              ".mp4",
                              ".webm",
                              ".avi",
                              ".mov",
                              ".wmv",
                              ".flv",
                              ".mkv",
                            ];
                            isVideo = videoExtensions.some((ext) =>
                              obj?.link?.toLowerCase()?.includes(ext)
                            );

                            // Override defaults for links
                            buttonColor = "bg-blue-300 hover:bg-blue-600"; // Default for audio
                            icon = <Volume1 size={14} />;

                            if (isWhatsapp) {
                              typeOfBtn = "Whatsapp";
                              buttonColor = "bg-green-600 hover:bg-green-700";
                              icon = <FaWhatsapp size={14} />;
                            } else if (isEmail) {
                              typeOfBtn = "Email";
                              buttonColor = "bg-red-700 hover:bg-red-800";
                              icon = <Mail size={14} />;
                            } else if (isWebsite) {
                              typeOfBtn = "Website";
                              buttonColor = "bg-purple-600 hover:bg-purple-700";
                              icon = <ExternalLink className="" size={14} />;
                            } else if (isYoutube) {
                              typeOfBtn = "Youtube";
                              buttonColor = "bg-red-600 ";
                              icon = (
                                <FontAwesomeIcon
                                  size={14}
                                  icon={faYoutube}
                                  beatFade
                                />
                              );
                              // <Youtube size={14} />
                            } else if (isVideo) {
                              typeOfBtn = "Video";
                              buttonColor = "bg-purple-500 hover:bg-purple-600";
                              icon = <Play size={14} />;
                            }
                          }

                          return (
                            <div
                              onClick={() => {
                                console.log("div clicked");
                              }}
                              key={`${idx}-${showCarousel === idx}`}
                              className="rendering points "
                            >
                              <button
                                style={{
                                  left: `${obj?.coordinates?.x}%`,
                                  top: `${obj?.coordinates?.y}%`,
                                }}
                                onMouseOver={() => {
                                  setShowCarousel(obj._id);
                                  if (
                                    obj?.isImage &&
                                    showCarousel === obj._id &&
                                    obj?.pageNumber === index + 1
                                  ) {
                                    setDisplayOverlay(true);
                                  }
                                }}
                                onMouseLeave={() => {
                                  setShowCarousel(null);
                                  if (isYoutube) return;
                                  setDisplayOverlay(false);
                                }}
                                onClick={(e) => {
                                  log(
                                    "button_click",
                                    obj?._id,
                                    typeOfBtn,
                                    {
                                      x: obj?.coordinates?.x,
                                      y: obj?.coordinates?.y,
                                    },
                                    obj?.link
                                  );

                                  e.stopPropagation();
                                  e.preventDefault();
                                  setShowCarousel(obj._id);

                                  if (
                                    (obj?.isImage &&
                                      showCarousel === obj._id &&
                                      obj?.pageNumber === index + 1) ||
                                    isYoutube
                                  ) {
                                    setDisplayOverlay(true);
                                  }
                                  // events wont go to the parent page wont flip when we click this button
                                  if (obj?.link) {
                                    setIsVideoVertical(obj.isVideoforMobile);
                                    console.log(obj.isVideoforMobile, 842);

                                    handleMediaClick(obj?.link, e);
                                  }
                                }}
                                className={`absolute shadow-lg w-10 h-10 pulse ${buttonColor} rounded-full z-50 opacity-100 flex items-center justify-center text-white transform -translate-x-1/2 -translate-y-1/2`}
                                // title={`${
                                //   isWebsite
                                //     ? "Open Website"
                                //     : isYoutube
                                //     ? "Play YouTube Video"
                                //     : isVideo
                                //     ? "Play Video"
                                //     : "Play Audio"
                                // }: ${obj?.coordinates?.label}`}
                              >
                                <span>{icon}</span>
                              </button>

                              {obj?.isImage &&
                                showCarousel === obj._id &&
                                obj?.pageNumber === index + 1 && (
                                  <div
                                    className={`absolute z-60  opacity-100  transform translate-x-0 translate-y-7 `}
                                    style={{
                                      left: `${obj?.coordinates?.x}%`,
                                      top: `${obj?.coordinates?.y}%`,
                                    }}
                                  >
                                    <HoverCarousel
                                      images={obj?.images}
                                      isHovered={true}
                                    />
                                  </div>
                                )}
                            </div>
                          );
                        })}
                    </div>
                  ))}
                </HTMLFlipBook>
              ) : (
                <Loading />
              )}
            </div>
          </div>

          {/* Fixed Controls Bar */}
          <div
            onClick={() => {
              console.log("div clicked");
            }}
            onTouchEnd={() => setVisible((prev) => !prev)}
            onMouseOver={() => setVisible(true)}
            onMouseOut={() => setVisible(false)}
            onMouseMove={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            style={{
              opacity: visible ? 1 : 0,
              transition: "opacity 0.3s ease",
              boxShadow: "0 8px 16px rgba(0,0,0,0.25)",
              background: `linear-gradient(90deg,
              #38B5F9 0%,
              #48BFFA 11%,
              #52C3F7 22%,
              #55C1F4 33%,
              #53BAF0 44%,
              #4CAFED 55%,
              #44A3E9 66%,
              #3D99E8 77%,
              #388FE6 88%,
              #3388E2 100%
              )`,
            }}
            className="bg-black/80  max-w-3xl  lg:max-w-5xl mx-auto   lg:max-h-[10vh] rounded-full absolute z-60 left-0 right-0 bottom-1 sm:bottom-0 md:bottom-1  flex items-center justify-center sm:justify-center px-4 sm:px-4 py-2 gap-4 sm:gap-8 flex-shrink-0 
            "
          >
            <div className="border-2 bg-white/10 border-white rounded-full shadow-[0px_2px_2px_0px_#00000040] py-1 px-3 flex justify-between gap-6 backdrop-blur-lg">
              <button
                onClick={() => {
                  audioRef.current.pause();
                  bookRef.current.pageFlip().flipPrev("top");
                  setLastPageNumber(currentPage + 1);
                }}
                className="text-white p-1 md:p-1.5 size-9 flex justify-center items-center  rounded-full border-2 border-white shadow-[0px_2px_2px_0px_#00000040]"
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </button>

              <div className="font-Inter font-medium flex justify-center items-center gap-2">
                <div className="text-white min-w-24 whitespace-nowrap">
                  Page {displayPageNumInBar(currentPage)}{" "}
                </div>
              </div>

              <button
                onClick={() => {
                  audioRef.current.pause();
                  bookRef.current.pageFlip().flipNext();
                  setLastPageNumber(currentPage + 1);
                }}
                className="text-white p-1 md:p-1.5 size-9 flex justify-center items-center rounded-full border-2 border-white shadow-[0px_2px_2px_0px_#00000040]"
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            <button
              onClick={(e) => {
                toggleFullscreen(e);
                e.stopPropagation();
                e.preventDefault();
                console.log("button clicked");
              }}
              className="text-white p-1 md:p-2 rounded-full border-2 border-white shadow-[0px_2px_2px_0px_#00000040]"
              aria-label="Full screen"
            >
              {isFullscreen ? (
                <MdFullscreenExit size={20} />
              ) : (
                <MdFullscreen size={20} />
              )}
            </button>

            <button
              className="p-1 md:p-2 rounded-full border-2 border-white shadow-[0px_2px_2px_0px_#00000040]"
              aria-label={isPlaying ? "Mute Audio" : "Play Audio"}
              onClick={toggleAudio}
            >
              {isPlaying ? (
                <Volume2 color="white" size={20} />
              ) : (
                <VolumeX color="white" size={20} />
              )}
            </button>

            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              className="text-white p-1 md:p-2 rounded-full border-2 border-white shadow-[0px_2px_2px_0px_#00000040]"
            >
              <MessageCircleMore
                className="group-hover:rotate-12 transition-transform duration-300"
                size={20}
              />
            </button>

            {permission && (
              <AudioRecorder
                permission={permission}
                setPermission={setPermission}
              />
            )}

          </div>
        </div>
      </div>

      {showVideoPopup && (
        <>
          {/* Backdrop to close popup when clicking outside */}
          <div className="fixed inset-0 z-40" onClick={closeVideoPopup} />
          <div
            onMouseMove={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            className="fixed z-50 bg-black rounded-lg shadow-2xl border-2 border-gray-600  flex items-center justify-center"
            style={{
              left: ` ${Math.min(popupPosition.x, window.innerWidth - 320)}px`, // Ensure it doesn't go off screen
              top: `${Math.min(popupPosition.y, window.innerHeight - 340)}px`,
              // width: isVideoVertical ? "180px" : "300px",
              // height: isVideoVertical ? "320px" : "220px",
              width: isVideoVertical ? "180px" : "300px",
              height: isVideoVertical ? "320px" : "270px",
              // aspectRatio: isVideoVertical ? 9 / 16 : 16 / 9,

              // width: isVideoVertical ? "270px" : "450px",
              // height: isVideoVertical ? "480px" : "330px",
              // minWidth: "25%",
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
                  // height: "200",
                  // width: "290",
                  width: isVideoVertical ? "180px" : "300px",
                  height: isVideoVertical ? "320px" : "270px",
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
                // style={{ padding: "10px" }}
              />
            ) : (
              <video
                ref={videoRef}
                src={currentVideoSrc}
                controls
                autoPlay
                className="w-full h-full  rounded-lg"
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

      {contactInfo && isExpanded && (
        <ContactWidget
          contactInfo={contactInfo}
          setIsExpanded={setIsExpanded}
        />
      )}

      {isOrientationPortrait && isPdfLandScape && <RotatePhoneRequest />}

      <audio ref={audioRef} src={audioSrc ? audioSrc : null}></audio>
      <audio ref={FlipSoundRef} src="/page-sound.mp3" />
    </div>
  );
};

export default App;
