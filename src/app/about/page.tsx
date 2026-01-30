import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4 text-foreground">
            Meet the Founders
          </h1>
          <p className="text-center text-muted-foreground mb-12">
            The story behind Shoroot
          </p>

          <Card className="overflow-hidden border-border">
            <CardContent className="p-8">
              <div className="flex flex-col items-center mb-8">
                <div className="relative w-64 h-64 mb-6 rounded-full overflow-hidden border-4 border-primary/20">
                  <Image
                    src="/founders-banana-head.png"
                    alt="Shoroot Founders"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>

              <div className="prose prose-neutral dark:prose-invert max-w-none">
                <p className="text-lg leading-relaxed text-foreground mb-6">
                  We created Shoroot because we believe betting should be fun, social, 
                  and accessible to everyone. Traditional betting platforms often feel 
                  intimidating, overly complex, or lack the community aspect that makes 
                  watching sports and events truly enjoyable.
                </p>

                <p className="text-lg leading-relaxed text-foreground mb-6">
                  Our vision was to build a platform where friends can easily create and 
                  join bets on anything they care about—from football matches to custom 
                  events—without the friction and complexity of legacy systems. We wanted 
                  to bring people together around friendly competition and shared experiences.
                </p>

                <p className="text-lg leading-relaxed text-foreground mb-6">
                  At Shoroot, we prioritize transparency, fairness, and responsible gaming. 
                  Every bet is designed to be clear and straightforward, with no hidden fees 
                  or confusing terms. We have built-in safeguards to ensure users bet within 
                  their means and can enjoy the platform as a form of entertainment.
                </p>

                <p className="text-lg leading-relaxed text-foreground">
                  We are excited to have you join our growing community. Whether you are 
                  placing your first bet or creating a custom pool for your friends, we are 
                  here to make the experience seamless and enjoyable. Welcome to Shoroot—
                  where every bet is an opportunity to connect, compete, and celebrate together.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
