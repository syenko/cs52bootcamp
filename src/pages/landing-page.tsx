import { SignInButton } from "@clerk/clerk-react";
import { Logo } from "@/components/logo";
import { H1, Lead } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

export function LandingPage() {
  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center">
      <div className="relative h-[325px] w-[325px] md:h-[450px] md:w-[450px] lg:h-[600px] lg:w-[600px] bg-white rounded-full shadow-lg">
        <div className="absolute inset-6 bg-white rounded-full border-2 border-gray-100">
          <div className="flex flex-col items-center justify-center p-4 text-center w-full h-full">
            <div className="animate-float mb-4">
              <Logo size="xl" />
            </div>

            <div>
              <H1 className="mb-4">When2Eat</H1>
            </div>

            <Lead className="max-w-2xl mb-4 md:mb-8">
              Find friends to eat with!
            </Lead>

            <SignInButton mode="modal">
              <Button size="lg" className="animate-pulse-slow">
                Get Started
              </Button>
            </SignInButton>
          </div>
        </div>
      </div>
    </div>
  );
}
