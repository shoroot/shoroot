export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqSectionProps {
  items?: FaqItem[];
}
