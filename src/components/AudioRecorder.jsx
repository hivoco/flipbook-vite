import React, { useEffect, useRef } from "react";
import useAudioRecorder from "../hooks/useAudioRecorder.js";
const AudioRecorder = ({ permission, setPermission }) => {
  const {
    // permission,
    recordingStatus,
    audioURL,
    error,
    requestPermission,
    startRecording,
    stopRecording,
    clearRecording,
    handleStart,
  } = useAudioRecorder({ permission, setPermission });

  const audioRef = useRef(null);

  useEffect(() => {
    if (permission) {
      setTimeout(() => {
        // startRecording();
        handleStart();
      }, 500);
    }
  }, [permission]);

  // useEffect(() => {
  //   setPermission(true);
  // }, []);

  return (
    <div className=" flex flex-col justify-center items-center max-w-md ">
      {/* {!permission && (
        <button
          onClick={() => {
            requestPermission();
            setPermission(true);
          }}
          className="absolut cursor-pointer right-2 md:right-25 bottom-10 md:bottom-10 bg-black flex items-center gap-2  text-white font-medium px-2 md:px-3 py-0.5 md:py-2 md rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition"
        >
          <div className="w-4 h-4 rounded-full bg-red-600" />
          <span className="text-2xl text-white">REC</span>
        </button>
      )} */}

      {/* {error && (
        <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-4 text-red-700">
          {error}
        </div>
      )} */}

      {permission && !error && (
        <div className="space-y-4">
          <button
            onClick={stopRecording}
            disabled={recordingStatus !== "recording"}
            className={`${
              recordingStatus !== "recording"
                ? "bg-red-600 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            } absolut cursor-pointer right-2 md:right-5 bottom-10 md:bottom-20 flex items-center gap-2  text-white font-medium rounded-sm px-2 md:px-3 py-0.5 md:py-2  focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition`}
          >
            <div className="hidden sm:block h-4 w-4 bg-white rounded-sm "></div>
            <span className="text-2xl">Stop</span>
          </button>

          {audioURL && (
            <div className="fixed inset-0 flex items-center justify-center z-50  bg-opacity-40 backdrop-blur-sm">
              <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                <div className="mb-4">
                  <audio
                    ref={audioRef}
                    controls
                    src={audioURL}
                    className="w-full rounded-md focus:outline-none"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      clearRecording();
                      setPermission(false);
                      // audioRef.current = null
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Clear Recording
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
