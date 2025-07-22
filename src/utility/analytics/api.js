import { BASE_URL } from "../../../constant";

export async function startSession(data) {
  try {
    const res = await fetch(BASE_URL + "/user/start-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to start session");

    const result = await res.json();
    console.log("Session started:", result);
    return result;
  } catch (err) {
    console.error("Error:", err.message);
  }
}

export async function endSession(data) {
  try {
    const res = await fetch(BASE_URL + "/user/end-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to start session");

    const result = await res.json();
    console.log("Session started:", result);
    return result;
  } catch (err) {
    console.error("Error:", err.message);
  }
}

export async function postData(payload) {
  try {
    const res = await fetch(BASE_URL + "/user/active-ping", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`Error: ${res.status}`);
    const data = await res.json();
    console.log("Success:", data);
  } catch (err) {
    console.error("Request failed:", err);
  }
}

// http://localhost:8831/user/event

// {
//   "sessionId":"ce5823a3-7b30-4e54-a264-c398c932e1a9",
//   "userId":"1234",
//   "flipbookId":"test",
//    "eventType":"button_click",
//   "pageNumber":1,
//   "timeOnPage":5,
//   "buttonId":"mongoid",
//   "buttonText":"youtube",
//   "elementId":"mongoid",
//   "clickPosition":{
//     "x":"23",
//     "y":34
//   },
//   "value":"https://google.com"
// }

export async function logEvent(data) {
  try {
    const response = await fetch(BASE_URL + "/user/event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Success:", result);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

export async function recordPageView(data) {
  try {
    const response = await fetch(BASE_URL + "/user/record-page-view", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Failed");
    const resData = await response.json();
    // console.log(resData);
  } catch (err) {
    console.log(err);
  }
}
