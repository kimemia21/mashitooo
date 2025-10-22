import React, { useState, useEffect } from 'react';
import { Palette } from 'lucide-react';

const EditModeUI = ({ onSideSelect, onCancel }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Minimal, sophisticated art elements
  const artElements = [
    { 
      type: 'line1',
      svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="10" y1="50" x2="90" y2="50" stroke="#FFD700" stroke-width="2" opacity="0.6"/>
      </svg>`,
      rotation: -25,
      top: '15%',
      left: '10%',
      size: '80px'
    },
    { 
      type: 'circle',
      svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="35" stroke="#00FF88" stroke-width="2" opacity="0.5"/>
      </svg>`,
      rotation: 0,
      top: '20%',
      right: '15%',
      size: '60px'
    },
    { 
      type: 'square',
      svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="25" y="25" width="50" height="50" stroke="#FF3366" stroke-width="2" opacity="0.5"/>
      </svg>`,
      rotation: 15,
      top: '55%',
      left: '8%',
      size: '55px'
    },
    { 
      type: 'line2',
      svg: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="20" y1="20" x2="80" y2="80" stroke="#00BFFF" stroke-width="2" opacity="0.6"/>
      </svg>`,
      rotation: 0,
      bottom: '25%',
      right: '12%',
      size: '70px'
    },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* Sharp Background Image (OLD CODE - beach image) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.vexels.com/media/users/3/358430/raw/96ff7f89c7e9736cec596fb55ecd7972-edgy-urban-hoodie-t-shirt-design.jpg')`,
          transform: 'scale(1.1)',
        }}
      ></div>

      {/* Heavily Blurred Overlay (OLD CODE - beach image) */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: `url('https://images.vexels.com/media/users/3/358430/raw/96ff7f89c7e9736cec596fb55ecd7972-edgy-urban-hoodie-t-shirt-design.jpg')`,
          filter: 'blur(25px) brightness(0.6)',
          transform: 'scale(1.1)',
          maskImage: `radial-gradient(circle 300px at ${mousePos.x}px ${mousePos.y}px, transparent 0%, black 40%)`,
          WebkitMaskImage: `radial-gradient(circle 300px at ${mousePos.x}px ${mousePos.y}px, transparent 0%, black 40%)`,
          transition: 'mask-image 0.15s ease-out, -webkit-mask-image 0.15s ease-out',
        }}
      ></div>

      {/* Subtle vignette for edges (OLD CODE) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      {/* Grid overlay (OLD CODE) */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,100,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,100,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Subtle cursor glow (OLD CODE) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle 200px at ${mousePos.x}px ${mousePos.y}px, rgba(0,255,100,0.08), transparent 60%)`,
          transition: 'all 0.15s ease-out',
        }}
      />

      {/* Minimal floating art elements (NEW CODE) */}
      {artElements.map((element, i) => (
        <div
          key={i}
          className="absolute pointer-events-none select-none transition-opacity duration-700"
          style={{
            top: element.top,
            left: element.left,
            right: element.right,
            bottom: element.bottom,
            transform: `rotate(${element.rotation}deg)`,
            width: element.size,
            height: element.size,
            opacity: 0.3,
            animation: `subtleFloat ${4 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
          }}
          dangerouslySetInnerHTML={{ __html: element.svg }}
        />
      ))}

      {/* Main Content (NEW CODE - styling and text) */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6">
        <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 backdrop-blur-sm border border-white/10 mb-8 shadow-2xl">
          <span className="text-white/70 text-xs font-medium uppercase tracking-[0.3em]">
            Design Studio
          </span>
        </div>

        <h1 className="text-6xl md:text-7xl font-light text-white mb-3 tracking-tight text-center leading-none">
          <span
            className="inline-block text-white/90"
            style={{
              textShadow: '0 2px 40px rgba(255,255,255,0.1)',
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
              fontWeight: '200',
              letterSpacing: '-0.02em',
            }}
          >
            Create Your
          </span>
          <br />
          <span
            className="text-white font-normal"
            style={{
              textShadow: '0 2px 40px rgba(255,255,255,0.15)',
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
              fontWeight: '400',
              letterSpacing: '-0.01em',
            }}
          >
            Signature Piece
          </span>
        </h1>

        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent mb-8"></div>

        <p className="text-sm text-gray-400 max-w-lg mx-auto font-light text-center mb-12 leading-relaxed tracking-wide">
          Design custom apparel with precision and style. Each element you place becomes part of your unique expression—professional tools for creative minds.
        </p>

        {/* CTA Button (NEW CODE) */}
        <button
          onClick={() => onSideSelect('FRONT')}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative group mb-8 transition-all duration-300"
        >
          <div className="relative px-12 py-4 bg-white/10 backdrop-blur-md border border-white/20 hover:border-white/40 shadow-2xl flex items-center gap-3 transition-all duration-300 hover:bg-white/15">
            <span className="text-lg font-light text-white uppercase tracking-[0.2em]">
              Start Designing
            </span>
            <Palette className="w-5 h-5 text-white/70" />
          </div>
        </button>

        {/* Cancel (NEW CODE) */}
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-300 transition-colors duration-300 text-xs font-light px-6 py-2 uppercase tracking-[0.2em]"
        >
          Return
        </button>

        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-gray-600 text-[10px] font-light uppercase tracking-[0.3em]">
            Professional Design Tools
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes subtleFloat {
          0%, 100% {
            transform: translateY(0px) rotate(var(--rotation)) scale(1);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-15px) rotate(var(--rotation)) scale(1.05);
            opacity: 0.35;
          }
        }
      `}</style>
    </div>
  );
};

export default EditModeUI;