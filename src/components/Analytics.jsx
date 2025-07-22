import React, { useEffect, useState } from "react";

const Analytics = () => {
  const [data, SetData] = useState([]);

  useEffect(() => {
    let startTime = Date.now();

    window.addEventListener("beforeunload", () => {
      let endTime = Date.now();
      let timeSpent = (endTime - startTime) / 1000; // in seconds
      navigator.sendBeacon("/log-time", JSON.stringify({ timeSpent }));
    });
  }, []);

  async function getData() {
    const response = await fetch("getData/route1");
    const data = await response.json();
    SetData(data);
  }

  return <div></div>;
};

export default Analytics;
