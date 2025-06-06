export const isWebsiteLink = (url) => {
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

// Function to check if a string is a phone number
export const isPhoneNumber = (str) => {
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
export const isEmail = (str) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(str);
};

// Function to format phone number for WhatsApp
export const formatPhoneForWhatsApp = (phone) => {
  // Remove all non-digit characters except +
  let formatted = phone.replace(/[^\d+]/g, "");

  // If it doesn't start with +, add it
  if (!formatted.startsWith("+")) {
    formatted = "+" + formatted;
  }

  return formatted;
};

//   // Function to handle media (audio/video/youtube/website/phone/email) click
//   const handleMediaClick = (mediaUrl, event) => {
//     // Check if it's a phone number
//     if (isPhoneNumber(mediaUrl)) {
//       const formattedPhone = formatPhoneForWhatsApp(mediaUrl);
//       const whatsappUrl = `https://wa.me/${formattedPhone.substring(1)}`; // Remove + for WhatsApp URL
//       window.open(whatsappUrl, "_blank", "noopener,noreferrer");
//       return;
//     }

//     // Check if it's an email
//     if (isEmail(mediaUrl)) {
//       const mailtoUrl = `mailto:${mediaUrl}`;
//       window.open(mailtoUrl, "_blank");
//       return;
//     }

//     // Check if it's a website link
//     if (isWebsiteLink(mediaUrl)) {
//       window.open(mediaUrl, "_blank", "noopener,noreferrer");
//       return;
//     }

//     // Check if it's a YouTube URL
//     const isYoutube =
//       mediaUrl.includes("youtube.com") || mediaUrl.includes("youtu.be");

//     // Check if it's a regular video file
//     const videoExtensions = [
//       ".mp4",
//       ".webm",
//       ".avi",
//       ".mov",
//       ".wmv",
//       ".flv",
//       ".mkv",
//     ];
//     const isVideo = videoExtensions.some((ext) =>
//       mediaUrl.toLowerCase().includes(ext)
//     );

//     if (isYoutube || isVideo) {
//       // Handle video - position popup near the clicked button
//       const rect = event.target.getBoundingClientRect();
//       const scrollTop =
//         window.pageYOffset || document.documentElement.scrollTop;
//       const scrollLeft =
//         window.pageXOffset || document.documentElement.scrollLeft;

//       setPopupPosition({
//         x: rect.right + scrollLeft + 10, // 10px to the right of button
//         y: rect.top + scrollTop,
//       });

//       setCurrentVideoSrc(mediaUrl);
//       setIsYouTubeVideo(isYoutube);
//       setShowVideoPopup(true);

//       // Pause any playing audio
//       if (audioRef.current) {
//         audioRef.current.pause();
//         setIsPlaying(false);
//       }
//     } else {
//       // Handle audio
//       setAudioSrc(mediaUrl);
//       setShowVideoPopup(false);
//     }
//   };
