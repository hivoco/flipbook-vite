import { LoaderCircle } from "lucide-react";
import React from "react";

const Loading = () => {
  return (
    <div className="size-5 flex flex-col items-center justify-center">
      <span>
        <LoaderCircle className="animate-spin" size={48} />
      </span>
      <p className="">Loading....</p>
    </div>
  );
};

export default Loading;
