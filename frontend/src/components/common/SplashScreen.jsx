import React from 'react';

const SplashScreen = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-bg selection:bg-brand-orange/30">
            <div className="relative flex flex-col items-center justify-center fade-in">
                {/* Logo Container */}
                <div className="relative w-24 h-24 mb-6">
                    {/* Background glow */}
                    <div className="absolute inset-0 bg-brand-orange/20 rounded-full blur-xl animate-pulse" />

                    {/* Actual Logo */}
                    <img
                        src="/JusticeLinker-favicon.png"
                        alt="JusticeLinker Logo"
                        className="relative z-10 w-full h-full object-contain drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]"
                    />

                    {/* Shine sweeping effect */}
                    <div className="absolute inset-0 z-20 overflow-hidden rounded-xl">
                        <div className="w-[150%] h-[150%] absolute top-[-25%] left-[-150%] bg-gradient-to-r from-transparent via-white/30 to-transparent -rotate-45 animate-shine" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                    <span className="text-navy-200">Justice</span>
                    <span className="text-brand-orange">Linker</span>
                </h1>

                {/* Subtitle / Loading text */}
                <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        </div>
    );
};

export default SplashScreen;
