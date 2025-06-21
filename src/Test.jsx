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
  Images,
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

import { useResizeRerender } from "./hooks/useResizeRerender";
import MenuPopup from "./components/MenuPopup";
import MultiShadowComponent from "./components/MultiShadowComponent";
import Demo from "./components/MultiShadowComponent";
import HoverCarousel from "./components/HoverCarousel";

const Test = () => {
  const bookRef = useRef();
  const audioRef = useRef();
  const divRef = useRef();
  const videoRef = useRef();

  const [audioSrc, setAudioSrc] = useState("");
  const [isPdfLandScape, setIsPdfLandScape] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isOrientationPortrait, setIsOrientationPortrait] = useState(false);

  const [flipbookImages, setFlipbookImages] = useState([]);
  const [contactInfo, setContactInfo] = useState();
  const [flipbookName, setFlipbookName] = useState("");
  const [showCarousel, setShowCarousel] = useState(null);
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
    handleResize();

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

    handler();
    screen.orientation.addEventListener("change", handler);

    return () => {
      screen.orientation.removeEventListener("change", handler);
    };
  }, []);

  const onFlip = (e) => {
    console.log("Current page: " + e.data);
    setCurrentPage(e.data + 1);
    setActiveGotPoint(null);
    // Close carousel when page flips
    setShowCarousel(null);
  };

  const handleZoomIn = () => {
    setZoomLevel(Math.min(zoomLevel + 0.1, 1.5));
  };

  const handleZoomOut = () => {
    setZoomLevel(Math.max(zoomLevel - 0.1, 0.8));
  };

  const toggleFullscreen = () => {
    const elem = document.documentElement;

    if (!document.fullscreenElement) {
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
    const websitePatterns = [/^https?:\/\//i];

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

    return (
      websitePatterns.some((pattern) => pattern.test(url)) &&
      !isYoutube &&
      !isVideo &&
      !isAudio
    );
  };

  const isPhoneNumber = (str) => {
    const digitsOnly = str.replace(/\D/g, "");
    const phonePatterns = [
      /^\+?[\d\s\-\(\)]{7,15}$/,
      /^\+?\d{1,4}[\s\-]?\(?\d{1,4}\)?[\s\-]?\d{1,4}[\s\-]?\d{1,9}$/,
      /^[\+]?[1-9][\d]{0,15}$/,
    ];

    return (
      digitsOnly.length >= 7 &&
      digitsOnly.length <= 15 &&
      phonePatterns.some((pattern) => pattern.test(str))
    );
  };

  const isEmail = (str) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(str);
  };

  const formatPhoneForWhatsApp = (phone) => {
    let formatted = phone.replace(/[^\d+]/g, "");
    if (!formatted.startsWith("+")) {
      formatted = "+" + formatted;
    }
    return formatted;
  };

  // Fixed handleMediaClick function - only for media links, not carousel
  const handleMediaClick = (mediaUrl, event, pointData) => {
    console.log("handleMediaClick called with:", mediaUrl, pointData);

    // Handle other media types (phone, email, website, video, audio)
    if (isPhoneNumber(mediaUrl)) {
      const formattedPhone = formatPhoneForWhatsApp(mediaUrl);
      const whatsappUrl = `https://wa.me/${formattedPhone.substring(1)}`;
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (isEmail(mediaUrl)) {
      const mailtoUrl = `mailto:${mediaUrl}`;
      window.open(mailtoUrl, "_blank");
      return;
    }

    if (isWebsiteLink(mediaUrl)) {
      window.open(mediaUrl, "_blank", "noopener,noreferrer");
      return;
    }

    const isYoutube =
      mediaUrl.includes("youtube.com") || mediaUrl.includes("youtu.be");
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
      const rect = event.target.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft =
        window.pageXOffset || document.documentElement.scrollLeft;

      setPopupPosition({
        x: rect.right + scrollLeft + 10,
        y: rect.top + scrollTop,
      });

      setCurrentVideoSrc(mediaUrl);
      setIsYouTubeVideo(isYoutube);
      setShowVideoPopup(true);

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

  useEffect(() => {
    if (flipbookName) {
      getPoints();
      getFlipbookImages();
    }
  }, [flipbookName]);

  const getYouTubeVideoId = (url) => {
    if (!url) return null;
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

    if (videoRef.current) {
      videoRef.current.pause();
      setVideoIsPlaying(false);
    }

    if (youtubePlayer) {
      youtubePlayer.pauseVideo();
      setVideoIsPlaying(false);
    }
  };

  // Close carousel when clicking outside
  const handlePageClick = (e) => {
    // Check if click is not on a point button or carousel
    if (
      !e.target.closest(".point-button") &&
      !e.target.closest(".carousel-container")
    ) {
      setShowCarousel(null);
    }
  };

  const reRender = useResizeRerender();

  return (
    <div className="relative h-svh w-full flex flex-col overflow-hidden">
      <div className="relative w-full flex-1 max-w-6xl mx-auto">
        <div ref={divRef} className="relative h-full flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="transition-transform duration-300 ease-out w-full h-full flex gap-0 items-center justify-center">
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
                useMouseEvents={true}
                drawShadow={true}
                maxShadowOpacity={0.5}
                showCover={true}
                style={{
                  boxShadow: isPdfLandScape
                    ? ""
                    : currentPage === 0
                    ? ""
                    : `15px 0px 0px 0px #7A7A7A66,10px 0px 0px 0px #7A7A7A80, 5px 0px 0px 0px #7A7A7A99,2px 0px 0px 0px #7A7A7AB2,
                     0px 2px 2px 0px #00000033,-2px 0px 2px 0px #00000033, 0px -2px 2px 0px #0000001A`,
                }}
                renderOnlyPageLengthChange={true}
                className={`
                  rounded-sm flibook-container relative select-none  
                  ${
                    isPdfLandScape
                      ? "!h-[95svh] min-h-[90svh] !max-h-svh"
                      : `!max-h-full !h-auto`
                  }
                  ${
                    !isPdfLandScape &&
                    window.innerWidth > 640 &&
                    currentPage !== 0
                      ? "gradient-bg"
                      : ""
                  }
                  ${
                    isPdfLandScape && !isFullscreen && windowWidth > 1000
                      ? "single-page"
                      : ""
                  }
                `}
              >
                {flipbookImages?.map((imageSrc, index) => (
                  <div
                    key={index}
                    className={`relative bg-white overflow-hidden h-full w-full self-center flex justify-center
                      ${
                        index === 0 && !isPdfLandScape
                          ? " sm:right-1/2 sm:-translate-x-1/2"
                          : ""
                      } 
                      ${isPdfLandScape ? "w-auto" : "w-full"}
                    `}
                    onClick={handlePageClick}
                  >
                    <img
                      style={{
                        boxShadow: isPdfLandScape
                          ? `15px 0px 0px 0px #7A7A7A66,10px 0px 0px 0px #7A7A7A80, 5px 0px 0px 0px #7A7A7A99,2px 0px 0px 0px #7A7A7AB2,
                     0px 2px 2px 0px #00000033,-2px 0px 2px 0px #00000033, 0px -2px 2px 0px #0000001A`
                          : ``,
                      }}
                      src={imageSrc}
                      alt={"image " + index}
                      className={`object-contain h-full relative 
                      ${
                        isPdfLandScape
                          ? "w-auto mx-auto "
                          : "w-full sm:h-[90vh] sm:w-auto"
                      }
                      `}
                    />

                    {console.log(showCarousel, "show carousel")}
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
                        let buttonColor = "bg-gray-500 hover:bg-gray-600"; // Default for carousel
                        let icon = <Images size={14} />; // Default carousel icon (Images from lucide-react)

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
                            icon = <ExternalLink size={14} />;
                          } else if (isYoutube) {
                            buttonColor = "bg-red-600 hover:bg-red-700";
                            icon = <Play size={14} />;
                          } else if (isVideo) {
                            buttonColor = "bg-purple-500 hover:bg-purple-600";
                            icon = <Play size={14} />;
                          }
                        }

                        return (
                          <div
                            onMouseEnter={() => {
                              if (obj?.isImage && obj?.images) {
                                console.log(
                                  "Hover enter - showing carousel for:",
                                  obj._id
                                );
                                setShowCarousel(obj._id);
                              }
                            }}
                            onMouseLeave={() => {
                              if (obj?.isImage && obj?.images) {
                                console.log("Hover leave - hiding carousel");
                                setShowCarousel(null);
                              }
                            }}
                            key={`${idx}-${showCarousel === obj._id}`}
                            className="rendering points"
                          >
                            <button
                              style={{
                                left: `${obj?.coordinates?.x}%`,
                                top: `${obj?.coordinates?.y}%`,
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log(
                                  "Button clicked, obj.link:",
                                  obj?.link
                                );

                                // Only handle media link points on click
                                if (obj?.link) {
                                  console.log(
                                    "Handling media link:",
                                    obj?.link
                                  );
                                  handleMediaClick(obj?.link, e);
                                }
                                // Image points are now handled by hover, not click
                              }}
                              className={`absolute shadow-lg w-10 h-10 pulse ${buttonColor} rounded-full z-50 opacity-100 flex items-center justify-center text-white transform -translate-x-1/2 -translate-y-1/2`}
                              title={`${
                                isWebsite
                                  ? "Open Website"
                                  : isYoutube
                                  ? "Play YouTube Video"
                                  : isVideo
                                  ? "Play Video"
                                  : obj?.isImage
                                  ? "Hover to View Gallery"
                                  : "Play Audio"
                              }: ${obj?.coordinates?.label}`}
                            >
                              <span>{icon}</span>
                            </button>

                            {/* Carousel removed from here - now at top level */}
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
              transition: "opacity 0.3s ease",
              boxShadow: "0 8px 16px rgba(0,0,0,0.25)",
            }}
            className="bg-black/80 left-0 rounded-t-xl right-0 bottom-0 sm:bottom-0 md:bottom-0 absolute flex items-center justify-between sm:justify-center px-2 sm:px-4 py-2 gap-1 sm:gap-8 flex-shrink-0"
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

            <div className="hidden md:flex justify-center items-center gap-2">
              <div className="text-white min-w-24 whitespace-nowrap">
                Page {currentPage + 1}-{currentPage + 2} /{" "}
                {flipbookImages.length}
              </div>
            </div>

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
              onClick={(e) => toggleFullscreen(e)}
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
          </div>
        </div>
      </div>

      <audio ref={audioRef} src={audioSrc ? audioSrc : null}></audio>

      {/* Video Popup */}
      {showVideoPopup && (
        <>
          <div className="fixed inset-0 z-40" onClick={closeVideoPopup} />
          <div
            className="fixed z-50 bg-black rounded-lg shadow-2xl border-2 border-gray-600"
            style={{
              left: `${Math.min(popupPosition.x, window.innerWidth - 320)}px`,
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

      {/* Carousel - Shows on hover, positioned near the point */}
      {showCarousel && (
        <>
          {(() => {
            // Find the current point data
            const currentPoint = gotPoints.find(
              (point) => point._id === showCarousel
            );
            if (!currentPoint) return null;

            return (
              <div
                className="fixed w-64 h-64 z-[9999] bg-white rounded-lg shadow-2xl border-2 border-gray-300 pointer-events-none"
                style={{
                  left: `calc(${currentPoint.coordinates?.x}% )`,
                  top: `calc(${currentPoint.coordinates?.y}% )`,

                  // Ensure it stays in viewport
                  maxWidth: "150px",
                  maxHeight: "150px",
                }}
              >
                <div className="w-full h-full p-2">
                  <div className="w-full h-full">
                    {currentPoint?.images ? (
                      <HoverCarousel
                        images={currentPoint.images}
                        isHovered={true}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                        No images available
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
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

export default Test;
