"use client";

import { useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CarouselItem, HeroCarouselProps } from "./types";
import { useAutoPlay } from "./utils";

const defaultCarouselItems: CarouselItem[] = [
  {
    id: 1,
    image: "/shoroot-community.png",
    title: "Welcome to Shoroot",
    subtitle: "The ultimate betting platform",
    primaryButton: {
      text: "Get Started",
      link: "/auth/signup",
    },
    variant: "split",
  },
  {
    id: 2,
    image: "/mr-shoroot-betting-horse.png",
    title: "Bet on Your Favorites",
    subtitle: "Sports, events, and more",
    primaryButton: {
      text: "Join Now",
      link: "/auth/signup",
    },
    secondaryButton: {
      text: "View Matches",
      link: "/football",
    },
    variant: "split",
  },
  {
    id: 3,
    image: "/mr-shoroot-counting-cash.png",
    title: "Win Big",
    subtitle: "Track your performance and win",
    primaryButton: {
      text: "Start Betting",
      link: "/auth/login",
    },
    variant: "split",
  },
];

function FullscreenSlide({ item }: { item: CarouselItem }) {
  return (
    <>
      {/* Background with overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-transparent z-10" />
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${item.image})` }}
      />

      {/* Content */}
      <div className="relative z-20 container mx-auto px-12 sm:px-16 md:px-20 h-full flex items-center">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight">
            {item.title}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            {item.subtitle}
          </p>
          {(item.primaryButton || item.secondaryButton) && (
            <div className="flex flex-wrap gap-4 pt-4">
              {item.primaryButton && (
                <Link href={item.primaryButton.link}>
                  <Button size="lg" className="text-lg px-8">
                    {item.primaryButton.text}
                  </Button>
                </Link>
              )}
              {item.secondaryButton && (
                <Link href={item.secondaryButton.link}>
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    {item.secondaryButton.text}
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function SplitSlide({ item }: { item: CarouselItem }) {
  return (
    <div className="absolute inset-0 flex">
      {/* Left side - Text content */}
      <div className="w-full lg:w-1/2 h-full flex items-center relative z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-transparent lg:to-background/80 z-0" />
        <div className="relative z-10 px-12 sm:px-16 md:px-20 py-12 space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
            {item.title}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            {item.subtitle}
          </p>
          {(item.primaryButton || item.secondaryButton) && (
            <div className="flex flex-wrap gap-4 pt-4">
              {item.primaryButton && (
                <Link href={item.primaryButton.link}>
                  <Button size="lg" className="text-lg px-8">
                    {item.primaryButton.text}
                  </Button>
                </Link>
              )}
              {item.secondaryButton && (
                <Link href={item.secondaryButton.link}>
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    {item.secondaryButton.text}
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block w-1/2 h-full relative">
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-background/20 z-10" />
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}

export function HeroCarousel({
  items = defaultCarouselItems,
  autoPlayInterval = 5000,
}: HeroCarouselProps) {
  const { currentIndex, goToNext, goToPrevious, goToSlide, pause, resume } =
    useAutoPlay(items.length, autoPlayInterval, true);

  const handlePrevious = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      goToPrevious();
    },
    [goToPrevious],
  );

  const handleNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      goToNext();
    },
    [goToNext],
  );

  const handleDotClick = useCallback(
    (index: number) => (e: React.MouseEvent) => {
      e.stopPropagation();
      goToSlide(index);
    },
    [goToSlide],
  );

  return (
    <section
      className="relative w-full h-[450px] sm:h-[500px] md:h-[550px] lg:h-[600px] xl:max-w-[1200px] xl:mx-auto xl:rounded-2xl xl:my-8 overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/20"
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      {/* Carousel Slides */}
      <div className="relative w-full h-full">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {item.variant === "split" ? (
              <SplitSlide item={item} />
            ) : (
              <FullscreenSlide item={item} />
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-background/80 hover:bg-background shadow-lg transition-all hover:scale-110"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-background/80 hover:bg-background shadow-lg transition-all hover:scale-110"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-foreground" />
          </button>
        </>
      )}

      {/* Navigation Dots */}
      {items.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={handleDotClick(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-primary w-8"
                  : "bg-primary/30 hover:bg-primary/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
