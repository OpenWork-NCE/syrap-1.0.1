import React from "react";

export const OGImage = () => {
  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {/* Using the syhpui.jpg image for Open Graph */}
      <img
        src="/syhpui.jpg"
        alt="SYHPUI"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
};
