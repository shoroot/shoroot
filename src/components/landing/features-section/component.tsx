"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Target, Lock, Bell, BarChart3 } from "lucide-react";
import { FeatureItem, FeaturesSectionProps } from "./types";

const defaultFeatures: FeatureItem[] = [
  {
    icon: "target",
    title: "Easy Betting",
    description:
      "Place bets on various events with just a few clicks. Simple and intuitive interface.",
  },
  {
    icon: "lock",
    title: "Secure & Private",
    description:
      "Your data and transactions are protected. Private bets available for exclusive groups.",
  },
  {
    icon: "bell",
    title: "Real-time Notifications",
    description:
      "Get instant updates on bet status, results, and new opportunities.",
  },
  {
    icon: "chart",
    title: "Track Performance",
    description:
      "Monitor your betting history, wins, and statistics in your personal dashboard.",
  },
];

const iconMap: Record<string, React.ReactNode> = {
  target: <Target className="w-8 h-8 text-primary" />,
  lock: <Lock className="w-8 h-8 text-primary" />,
  bell: <Bell className="w-8 h-8 text-primary" />,
  chart: <BarChart3 className="w-8 h-8 text-primary" />,
};

export function FeaturesSection({
  features = defaultFeatures,
}: FeaturesSectionProps) {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose Shoroot?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the best betting platform with features designed for your
            success
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50"
            >
              <CardHeader className="pb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  {iconMap[feature.icon] || (
                    <Target className="w-8 h-8 text-primary" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
