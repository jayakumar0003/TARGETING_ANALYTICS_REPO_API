import React from 'react';
import img from "../../public/WPP_1-removebg-preview.png";

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  title = "Single Source Of Truth", 
}) => {
  
  const renderTitleWithLargeFirstLetters = (text: string): React.ReactNode => {
    return text.split(' ').map((word, index) => (
      <span key={index} className="inline-block mr-2">
        <span className="text-3xl md:text-5xl font-bold">{word.charAt(0)}</span>
        <span className="text-2xl md:text-4xl">{word.slice(1)}</span>
      </span>
    ));
  };

  return (
    <div className="relative px-4 md:px-8 lg:px-10 py-3 md:py-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
  {/* Subtle Grid Background */}
  <div
    className="absolute inset-0 opacity-[0.06]"
    style={{
      backgroundImage: `
        linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)
      `,
      backgroundSize: "40px 40px"
    }}
  />

  {/* Minimal Gradient Overlay */}
  <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95" />

  {/* CONTENT */}
  <div className="relative flex items-center justify-between">
    {/* TITLE - with enlarged first letters */}
    <div className="flex flex-col justify-center">
      <div className="relative inline-block">
        <h1 className="text-2xl md:text-4xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 font-mono">
          {renderTitleWithLargeFirstLetters(title)}
        </h1>
        <div className="mt-1 h-[2px] ml-8 w-10/12 bg-gradient-to-r from-transparent via-slate-400 to-transparent" />
      </div>
    </div>

    {/* LOGO - Simplified */}
    <div className="relative">
      <div className="relative bg-slate-800/70 rounded-xl p-2 md:p-3 border border-slate-700/40 backdrop-blur-sm">
        <img
          src={img}
          alt="WPP Logo"
          className="h-12 md:h-14 object-contain"
        />
      </div>
    </div>
  </div>
</div>
  );
};

export default Header;