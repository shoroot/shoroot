export type CarouselVariant = "fullscreen" | "split";

export interface CarouselButton {
  text: string;
  link: string;
}

export interface CarouselItem {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  primaryButton?: CarouselButton;
  secondaryButton?: CarouselButton;
  variant?: CarouselVariant;
}

export interface HeroCarouselProps {
  items?: CarouselItem[];
  autoPlayInterval?: number;
}
