import React, { useState } from "react";
import {
  Settings,
  X,
  Monitor,
  Smartphone,
  Moon,
  Sun,
  Volume2,
  VolumeX,
} from "lucide-react";

export default function MenuPopup({menuOpen, setMenuOpen}) {
  const [orientation, setOrientation] = useState("portrait");
  const [theme, setTheme] = useState("light");
  const [sound, setSound] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const togglePopup = () => setMenuOpen(!menuOpen);

  return (
    <div className=" flex items-center justify-center p-4">
      {/* Popup Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
              <button
                onClick={togglePopup}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Settings Content */}
            <div className="p-6 space-y-6">
              {/* Orientation Setting */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Display Orientation
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setOrientation("portrait")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                      orientation === "portrait"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    <Smartphone className="w-5 h-5" />
                    Portrait
                  </button>
                  <button
                    onClick={() => setOrientation("landscape")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                      orientation === "landscape"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    <Monitor className="w-5 h-5" />
                    Landscape
                  </button>
                </div>
              </div>

              {/* Theme Setting */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Theme
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                      theme === "light"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    <Sun className="w-5 h-5" />
                    Light
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                      theme === "dark"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    }`}
                  >
                    <Moon className="w-5 h-5" />
                    Dark
                  </button>
                </div>
              </div>

              {/* Sound Setting */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {sound ? (
                    <Volume2 className="w-5 h-5 text-gray-600" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-gray-600" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    Sound Effects
                  </span>
                </div>
                <button
                  onClick={() => setSound(!sound)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    sound ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      sound ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Notifications Setting */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Push Notifications
                </span>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Auto-save Setting */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Auto-save Frequency
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="30">Every 30 seconds</option>
                  <option value="60">Every minute</option>
                  <option value="300">Every 5 minutes</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
