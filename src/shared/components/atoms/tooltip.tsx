import { useState } from "react";

interface TooltipProps { 
  children: React.ReactNode; 
  content: string; 
  side?: "top" | "bottom" | "left" | "right" 
}

export const Tooltip = ({ children, content, side = "top" }: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
      >
        {children}
      </div>
      {isVisible && (
        <div className={`absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg transition-opacity duration-200 ${
          side === "top" ? "bottom-full mb-2 left-1/2 transform -translate-x-1/2" :
          side === "bottom" ? "top-full mt-2 left-1/2 transform -translate-x-1/2" :
          side === "left" ? "right-full mr-2 top-1/2 transform -translate-y-1/2" :
          "left-full ml-2 top-1/2 transform -translate-y-1/2"
        }`}>
          {content}
          <div className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
            side === "top" ? "top-full left-1/2 -translate-x-1/2 -mt-1" :
            side === "bottom" ? "bottom-full left-1/2 -translate-x-1/2 -mb-1" :
            side === "left" ? "left-full top-1/2 -translate-y-1/2 -ml-1" :
            "right-full top-1/2 -translate-y-1/2 -mr-1"
          }`} />
        </div>
      )}
    </div>
  );
};
