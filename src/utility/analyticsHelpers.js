export async function getUserLocation() {
  try {
    const response = await fetch("https://ipinfo.io/json?token=ca37afcc002197"); // Replace with your token
    if (!response.ok) throw new Error("Failed to fetch location");
    const data = await response.json();

    return {
      city: data.city,
      region: data.region,
      country: data.country,
      loc: data.loc, // latitude,longitude string
      timezone: data.timezone,
      ip: data.ip,
    };
  } catch (error) {
    console.error("Location fetch error:", error);
    return null;
  }
}

export function generateUniqueId(prefix = "") {
  const timestamp = Date.now().toString(36); // Base-36 encoded timestamp
  const randomPart = Math.random().toString(36).substring(2, 10); // 8-character random string
  return `${prefix}${timestamp}-${randomPart}`;
}

export function getDeviceInfo() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const platform = navigator.platform;

  // Type Detection
  let type = "desktop";
  if (/android/i.test(userAgent)) {
    type = "mobile";
  } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
    type = /iPad/.test(userAgent) ? "tablet" : "mobile";
  } else if (/Mobile|Tablet|Phone/i.test(userAgent)) {
    type = /Tablet/.test(userAgent) ? "tablet" : "mobile";
  }

  // Browser Detection
  let browser = "Unknown";
  if (/chrome|crios/i.test(userAgent)) browser = "Chrome";
  else if (/firefox|fxios/i.test(userAgent)) browser = "Firefox";
  else if (/safari/i.test(userAgent)) browser = "Safari";
  else if (/edg/i.test(userAgent)) browser = "Edge";
  else if (/opr|opera/i.test(userAgent)) browser = "Opera";

  // OS Detection
  let os = "Unknown";
  if (/Win/i.test(platform)) os = "Windows";
  else if (/Mac/i.test(platform)) os = "macOS";
  else if (/Linux/i.test(platform)) os = "Linux";
  else if (/Android/i.test(userAgent)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(userAgent)) os = "iOS";

  // Screen Resolution
  const screenResolution = `${window.screen.width}x${window.screen.height}`;

  return {
    type,
    browser,
    os,
    screenResolution,
  };
}


export function getUTMParams() {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    source: urlParams.get("utm_source"),
    medium: urlParams.get("utm_medium"),
    campaign: urlParams.get("utm_campaign"),
    term: urlParams.get("utm_term"),
    content: urlParams.get("utm_content"),
  };
}
