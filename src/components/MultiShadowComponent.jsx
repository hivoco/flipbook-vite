import React from "react";

const MultiShadowComponent = () => {
  const shadowStyles = [
    { boxShadow: "30px 0px 0px 0px #7A7A7A1A" },
    { boxShadow: "25px 0px 0px 0px #7A7A7A33" },
    { boxShadow: "20px 0px 0px 0px #7A7A7A4D" },
    { boxShadow: "15px 0px 0px 0px #7A7A7A66" },
    { boxShadow: "10px 0px 0px 0px #7A7A7A80" },
    { boxShadow: "5px 0px 0px 0px #7A7A7A99" },
  ];

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      <div className="relative w-full h-full ">
        {shadowStyles.map((style, index) => (
          <div
            key={index}
            className="absolute top-0 left-0 w-full h-full rounded-sm"
            style={style}
          />
        ))}
      </div>
    </div>
  );
};
export default MultiShadowComponent;

// // Demo wrapper to show the component in action
// const Demo = () => {
//   return (
//     <div className="w-full h-full">
//       <div className="max-w-md mx-auto h-96 bg-blue-50 rounded-lg">
//         <div className="h-full w-full relative">
//           <MultiShadowComponent/>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Demo;
