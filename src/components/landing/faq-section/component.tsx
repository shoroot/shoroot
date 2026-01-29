"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FaqItem, FaqSectionProps } from "./types";

const defaultFaqItems: FaqItem[] = [
  {
    question: "How do I create an account?",
    answer:
      "Click the 'Sign Up' button and fill in your email and password. You'll be ready to start betting in seconds!",
  },
  {
    question: "How does betting work?",
    answer:
      "Browse available bets, select your preferred option, and place your bet. Once the event concludes, winners are determined and notified.",
  },
  {
    question: "How can I participate in a bet?",
    answer:
      "Navigate to the dashboard, find an active bet you're interested in, click 'Participate', and choose your option.",
  },
  {
    question: "What happens when a bet is resolved?",
    answer:
      "The admin determines the winning option. All participants are notified, and winners can see their success in their dashboard.",
  },
  {
    question: "How do I track my bets?",
    answer:
      "Your personal dashboard shows all your participations, active bets, and historical performance.",
  },
];

function FaqAccordionItem({
  item,
  isOpen,
  onToggle,
  index,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 px-2 text-left hover:bg-muted/50 transition-colors rounded-lg"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-medium text-foreground pr-4">
          {item.question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="pb-5 px-2 text-muted-foreground leading-relaxed">
          {item.answer}
        </p>
      </div>
    </div>
  );
}

export function FaqSection({ items = defaultFaqItems }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Got questions? We've got answers.
          </p>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm">
          {items.map((item, index) => (
            <FaqAccordionItem
              key={index}
              item={item}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
