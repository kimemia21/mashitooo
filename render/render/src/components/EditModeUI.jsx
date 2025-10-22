import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

const EditModeUI = ({ onSideSelect, onCancel }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const stickers = [
    { emoji: '🔥', rotation: -10, top: '15%', left: '8%', size: '50px' },
    { emoji: '⚡', rotation: 12, top: '20%', right: '10%', size: '48px' },
    { emoji: '💎', rotation: -15, top: '50%', left: '6%', size: '45px' },
    { emoji: '👁️', rotation: 18, bottom: '25%', right: '8%', size: '42px' },
    { emoji: '🎯', rotation: -8, bottom: '35%', left: '12%', size: '46px' },
    { emoji: '✨', rotation: 15, top: '35%', right: '14%', size: '44px' },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* Blurred Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-300"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1920&q=80')`,
          filter: 'blur(20px) brightness(0.7)',
          transform: 'scale(1.1)',
        }}
      ></div>

      {/* Dynamic unblur region following mouse */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-300"
        style={{
          background: `radial-gradient(circle 250px at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.08), transparent 70%)`,
          backdropFilter: `blur(0px)`,
          WebkitBackdropFilter: `blur(0px)`,
        }}
      />

      {/* Grid overlay */}
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

      {/* Mouse glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle 600px at ${mousePos.x}px ${mousePos.y}px, rgba(0,255,100,0.15), transparent 70%)`,
          transition: 'all 0.3s ease',
        }}
      />

      {/* Floating stickers */}
      {stickers.map((s, i) => (
        <div
          key={i}
          className="absolute pointer-events-none select-none opacity-30 hover:opacity-60 transition-opacity duration-500"
          style={{
            top: s.top,
            left: s.left,
            right: s.right,
            bottom: s.bottom,
            transform: `rotate(${s.rotation}deg)`,
            fontSize: s.size,
            filter: 'drop-shadow(0 0 20px rgba(0,255,100,0.4))',
            animation: `float ${3.5 + i * 0.4}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
          }}
        >
          {s.emoji}
        </div>
      ))}

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 backdrop-blur-md">
        <div className="inline-flex items-center gap-3 px-5 py-2 bg-gradient-to-r from-green-600 to-green-500 border-2 border-white mb-6 shadow-2xl transform -rotate-1">
          <span className="text-white text-xs font-black uppercase tracking-widest">
            UNLEASH
          </span>
        </div>

        <h1 className="text-7xl md:text-8xl font-black text-white mb-2 tracking-tight text-center leading-none">
          <span
            className="inline-block text-green-400"
            style={{
              textShadow:
                '0 0 40px rgba(0,255,100,0.5), 4px 4px 0px rgba(0,0,0,0.8)',
            }}
          >
            EDIT
          </span>
          <br />
          <span
            className="text-white"
            style={{
              textShadow:
                '0 0 30px rgba(255,255,255,0.2), 3px 3px 0px rgba(0,0,0,0.6)',
            }}
          >
            MODE
          </span>
        </h1>

        <div className="text-6xl mb-4 relative">
          <div
            className="absolute inset-0 blur-2xl opacity-50"
            style={{
              background:
                'radial-gradient(circle, rgba(0,255,100,0.6), transparent 70%)',
            }}
          ></div>
          <span className="relative drop-shadow-2xl">🐕</span>
        </div>

        <p className="text-base text-gray-300 max-w-md mx-auto font-light text-center mb-10 leading-relaxed">
          Raw power meets smooth design. Drop stickers, paint your vibe, make{' '}
          <span className="text-green-400 font-semibold">street art</span> that
          bites back.
        </p>

        {/* CTA Button */}
        <button
          onClick={() => onSideSelect('FRONT')}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative group mb-10 transition-all duration-300 hover:scale-110"
        >
          <div
            className={`absolute -inset-2 bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-lg blur-lg opacity-60 group-hover:opacity-100 transition duration-500 ${
              isHovered ? 'animate-pulse' : ''
            }`}
          ></div>
          <div className="relative px-14 py-5 bg-gradient-to-r from-green-500 to-green-600 border-2 border-green-300 shadow-2xl flex items-center gap-3 transform hover:-skew-x-3 transition-all duration-300">
            <span className="text-2xl font-black text-black uppercase tracking-wide">
              CREATE
            </span>
            <Zap className="w-6 h-6 text-black" />
          </div>
        </button>

        {/* Cancel */}
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-200 transition-colors duration-300 text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/5"
        >
          ← Nah, maybe later
        </button>

        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">
            BOLD DESIGNS. ZERO LIMITS. 🔥
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
};

export default EditModeUI;
