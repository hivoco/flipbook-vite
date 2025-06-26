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
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { FiChevronLeft, FiRotateCw } from "react-icons/fi";

import { BASE_URL } from "../constant";
import YouTube from "react-youtube";
import ContactWidget from "./components/ContactWidget";

import { useResizeRerender } from "./hooks/useResizeRerender";
import MenuPopup from "./components/MenuPopup";
import HoverCarousel from "./components/HoverCarousel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faL, faPhotoFilm } from "@fortawesome/free-solid-svg-icons";
import { faYoutube } from "@fortawesome/free-brands-svg-icons";
import PlaySound from "./components/PlaySound";

const App = () => {
  const bookRef = useRef();
  const audioRef = useRef();
  const divRef = useRef();
  const videoRef = useRef();
  const FlipSoundRef = useRef(null);

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
  console.log(currentPage, "currentPage");

  // const [permission, setPermission] = useState(false);
  // const [totalPages, setTotalPages] = useState();
  // const [zoomLevel, setZoomLevel] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  // const [visibleTooltip, setVisibleTooltip] = useState(null);
  const [videoIsPlaying, setVideoIsPlaying] = useState(false);
  // const [activeGotPoint, setActiveGotPoint] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [currentVideoSrc, setCurrentVideoSrc] = useState("");
  const [isYouTubeVideo, setIsYouTubeVideo] = useState(false);
  const [youtubePlayer, setYoutubePlayer] = useState(null);
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const lastMouseY = useRef(0);

  // const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  // const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  // const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  // useEffect(() => {
  //   const handleResize = () => {
  //     setWindowWidth(window.innerWidth);
  //     setWindowHeight(window.innerHeight);
  //   };

  //   window.addEventListener("resize", handleResize);
  //   handleResize(); // set initially

  //   return () => window.removeEventListener("resize", handleResize);
  // }, []);

  useEffect(() => {
    const name = window.location.pathname.split("/").pop();
    setFlipbookName(name);
    // let timer;

    // const handleMouseMove = (e) => {
    //   const currentY = e.clientY;
    //   if (currentY > lastMouseY.current) {
    //     // clearTimeout(timer);
    //     setVisible(true);
    //     // timer = setTimeout(() => {
    //     //   setVisible(false);
    //     // }, 5000);
    //   } else {
    //     setVisible(false);
    //   }

    //   lastMouseY.current = currentY;
    // };

    // document.addEventListener("mousemove", handleMouseMove);
    // return () => {
    //   // clearTimeout(timer);
    //   document.removeEventListener("mousemove", handleMouseMove);
    // };
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
    console.log("Current page: " + e.data);
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

      console.log(data, "data");

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

                      {/* {isPdfLandScape && (
                        <>
                          <ChevronFirst
                            onClick={() =>
                              bookRef.current.pageFlip().turnToPage(0)
                            }
                            className="absolute bottom-0 left-5 -translate-y-1/2  hidden lg:inline text-gray-400 "
                            size={20}
                          />

                          <ChevronLeft
                            size={28}
                            className="absolute top-1/2 left-5 -translate-y-1/2  hidden lg:inline text-gray-400 "
                            // className="absolute left-0 top-1/2 -translate-y-1/2"
                            onClick={() =>
                              bookRef.current.pageFlip().flipPrev()
                            }
                          />
                        </>
                      )} */}

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
                              buttonColor = "bg-green-600 hover:bg-green-700";
                              icon = <FaWhatsapp size={14} />;
                            } else if (isEmail) {
                              buttonColor = "bg-red-700 hover:bg-red-800";
                              icon = <Mail size={14} />;
                            } else if (isWebsite) {
                              buttonColor = "bg-green-500 hover:bg-green-600";
                              icon = <ExternalLink className="" size={14} />;
                            } else if (isYoutube) {
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
                                // turnToPage={}
                                onClick={(e) => {
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
                                    className={`absolute z-50  opacity-100  transform translate-x-[0px] translate-y-[40px] `}
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
                <div className="size-5 flex flex-col items-center justify-center">
                  <span>
                    <LoaderCircle className="animate-spin" size={48} />
                  </span>
                  <p className="">Loading....</p>
                </div>
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
                  // bookRef.current.pageFlip().turnToPrevPage();
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
            onMouseMove={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
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

      {contactInfo && isExpanded && (
        <ContactWidget
          contactInfo={contactInfo}
          setIsExpanded={setIsExpanded}
        />
      )}

      {isOrientationPortrait && isPdfLandScape && (
        <div className="fixed top-0 left-0 px-4 w-full bg-yellow-500 text-black flex items-center justify-center py-2 shadow-md z-50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={48}
            height={48}
            viewBox="0 0 48 48"
          >
            <g fill="none">
              <path
                fill="#25b7d3"
                d="M24 47.998c13.255 0 24-10.745 24-24C48 10.746 37.255 0 24 0S0 10.745 0 23.999s10.745 23.999 24 23.999"
              ></path>
              <path
                fill="#fff"
                d="M37.964 32.144a2.327 2.327 0 0 1-2.327 2.327h-9.31A2.327 2.327 0 0 1 24 32.144V12.363a2.327 2.327 0 0 1 2.327-2.327h9.31a2.327 2.327 0 0 1 2.327 2.327z"
              ></path>
              <path
                fill="#3e3e3f"
                d="M37.091 14.398H24.873v15.709h12.218z"
              ></path>
              <path
                fill="#cfd3d4"
                d="M27.928 13.092a.437.437 0 1 0 0-.874a.437.437 0 0 0 0 .874m6.545-.438a.437.437 0 0 1-.437.436h-4.363a.437.437 0 0 1 0-.872h4.363c.241 0 .437.195.437.436"
              ></path>
              <path
                fill="#5b5c5f"
                d="m24.873 26.596l12.199-12.198H24.873z"
              ></path>
              <path
                fill="#fff"
                d="M11.782 18.763h-1.746l2.618 3.49l2.618-3.49h-1.745v-3.491q0-1.746 1.746-1.746h3.49v1.746l3.491-2.618l-3.49-2.618v1.745h-3.492q-3.49 0-3.49 3.49zm20.363 5.236a2.327 2.327 0 0 1 2.327 2.327v9.308a2.327 2.327 0 0 1-2.327 2.328H12.363a2.327 2.327 0 0 1-2.327-2.328v-9.308a2.327 2.327 0 0 1 2.327-2.327z"
              ></path>
              <path
                fill="#3e3e3f"
                d="M30.109 24.871h-15.71V37.09h15.71z"
              ></path>
              <path
                fill="#cfd3d4"
                d="M12.655 34.472a.437.437 0 1 0 0-.874a.437.437 0 0 0 0 .874m-.001-6.982c.241 0 .437.195.437.436v4.363a.436.436 0 0 1-.873 0v-4.363c0-.241.196-.437.436-.437m19.637 4.8a1.31 1.31 0 1 0 0-2.618a1.31 1.31 0 0 0 0 2.618"
              ></path>
              <path fill="#fff" d="M32.946 30.326h-1.31v1.31h1.31z"></path>
              <path fill="#5b5c5f" d="m14.4 37.07l12.198-12.2H14.4z"></path>
            </g>
          </svg>

          <span className="font-medium">
            Please rotate your device to <strong>landscape</strong> for the best
            experience.
          </span>
        </div>
      )}

      <audio ref={FlipSoundRef} src="/page-sound.mp3" />
    </div>
  );
};

export default App;
