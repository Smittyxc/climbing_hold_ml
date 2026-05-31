import React from "react";
import { Link } from "react-router-dom";
import { ChartBar, Rocket, ShieldAlert, User } from "lucide-react";

// Import shadcn components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useSession } from "@/context/SessionContext";
import supabaseClient from "@/lib/supabaseClient";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
}) => {
  return (
    <Card className="transition-shadow duration-300 hover:shadow-lg">
      <CardContent className="pt-6 flex flex-col items-center text-center">
        <div className="p-3 bg-zinc-100 rounded-full mb-4 text-black-600">
          {icon}
        </div>
        <CardTitle className="mb-2">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  );
};

const LandingPage = () => {
  const { session } = useSession();
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <header className="bg-linear-to-r from-orange-700 to-orange-800 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <p className="text-2xl font-bold">Hazel Climbing</p>
          </div>

          {/* Hero Section */}
          <div className="flex flex-col md:flex-row items-center py-16 gap-8">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Build.<br></br> Set.<br></br>Send.
              </h1>
              <p className="text-xl mb-8">
                Straightforward home wall and route management.
              </p>
              <div className="flex space-x-4">
                {session?.user ? (
                  <Button
                    variant="secondary"
                    className="text-zinc-600 hover:bg-zinc-100"
                    onClick={() => {
                      supabaseClient.auth.signOut();
                    }}
                  >
                    Sign out
                  </Button>
                ) : (
                  <Link to="/auth">
                    <Button
                      variant="secondary"
                      className="text-zinc-600 hover:bg-zinc-100"
                    >
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-12 text-gray-800">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Rocket size={24} />}
              title="Lightning Fast"
              description="Our solutions are optimized for performance, ensuring you get results quickly."
            />
            <FeatureCard
              icon={<ShieldAlert size={24} />}
              title="Secure & Reliable"
              description="Bank-level security protocols to keep your data safe and your business running."
            />
            <FeatureCard
              icon={<ChartBar size={24} />}
              title="Data-Driven"
              description="Make informed decisions with our advanced analytics and reporting tools."
            />
            <FeatureCard
              icon={<User size={24} />}
              title="Customer Focused"
              description="24/7 support and a team dedicated to your success every step of the way."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
