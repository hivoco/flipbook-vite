import React from "react";

const RotatePhoneRequest = () => {
  return (
    <div
      className="fixed top-0 left-0  w-full  text-black flex items-center justify-center gap-2 z-50
        px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm
        "
    >
      <img src="/icons/Sign.png" width={20} height={20} alt="rotate icon" />
      <span className="font-medium">Rotate phone for best experience</span>
    </div>
  );
};

export default RotatePhoneRequest;
