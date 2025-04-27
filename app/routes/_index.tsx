import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "YazrAI" },
    { name: "description", content: "Welcome to YazrAI" },
  ];
};

export default function Index() {
  return <div className="max-w-8xl mx-auto  min-h-screen p-12">Loading...</div>;
}
