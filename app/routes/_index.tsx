import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "YazrAI" },
    { name: "description", content: "Welcome to YazrAI" },
  ];
};

export default function Index() {
  return (
    <div className="max-w-8xl mx-auto  min-h-screen p-24">
      <h1>Yazr AI</h1>
      <h2>Turn your archived invesment research into actionable insights</h2>
      <h2>
        Invesment decks, notes and financial statements into a benchmarkable
        asset and knowledge base
      </h2>
      <Separator className="my-8" />
      <Link to="/login">
        <Button>Get Started</Button>
      </Link>
    </div>
  );
}
