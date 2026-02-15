"use client"

import Image from "next/image"

interface HeroSectionProps {
  onOrderClick: () => void
}

export function HeroSection({ onOrderClick }: HeroSectionProps) {
  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-takoyaki.jpg"
          alt="Fresh takoyaki on a traditional serving tray"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        {/* Japanese decorative element */}
        <div className="flex items-center gap-3 text-muted-foreground text-sm tracking-[0.3em] uppercase">
          <span className="h-px w-8 bg-primary" />
          <span>{"Authentic Japanese Street Food"}</span>
          <span className="h-px w-8 bg-primary" />
        </div>

        {/* Brand title */}
        <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-black text-foreground tracking-tight text-balance">
          Takoyaki
        </h1>

        {/* Japanese subtitle */}
        <p className="font-display text-2xl md:text-3xl text-muted-foreground tracking-widest">
          {"たこ焼き"}
        </p>

        {/* Tagline */}
        <p className="text-lg md:text-xl text-muted-foreground tracking-wide">
          {"Fresh \u2022 Hot \u2022 Made to Order"}
        </p>

        {/* CTA Button */}
        <button
          onClick={onOrderClick}
          className="mt-4 bg-primary text-primary-foreground font-bold text-lg px-10 py-4 rounded-md
                     hover:bg-primary/90 active:scale-[0.98] transition-all duration-200
                     shadow-[0_0_30px_rgba(225,6,0,0.3)] hover:shadow-[0_0_40px_rgba(225,6,0,0.4)]"
        >
          Order Now
        </button>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 z-10 flex flex-col items-center gap-2 animate-pulse-soft">
        <span className="text-xs text-muted-foreground tracking-widest uppercase">{"Scroll"}</span>
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none" className="text-muted-foreground">
          <path d="M8 4L8 20M8 20L14 14M8 20L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </section>
  )
}
