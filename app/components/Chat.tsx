import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useFetcher } from "@remix-run/react";
import { useState } from "react";
import { ScrollArea } from "./ui/scroll-area";

export default function Chat({
  jobId,
  active = false,
}: {
  jobId: string | null;
  active: boolean;
}) {
  const [question, setQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const fetcher = useFetcher();
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setQuestion((formData.get("message") || "") as string);
    setLoading(true);
    fetch("/api/ai/chat", {
      method: "post",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        setAnswer(data.answer);
        setLoading(false);
      });
  };

  return (
    <fetcher.Form className="space-y-2" onSubmit={onSubmit}>
      <ScrollArea>
        <div className="flex justify-end">
          {question && (
            <div className="border-0 bg-gray-0 resize-none  rounded-xl  w-fit bg-gray-200 max-w-[90%] p-2">
              {question}
            </div>
          )}
        </div>

        {answer && (
          <div className="border-1 resize-none  rounded-xl  w-fit bg-gray-50 max-w-[90%] p-2 mt-4">
            {answer}
          </div>
        )}
        {loading && (
          <div className="flex justify-center p-4">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-gray-900"></div>
          </div>
        )}
      </ScrollArea>
      <Input
        placeholder="Ask Yazr"
        className={`border-0 bg-gray-100 ${!active ? "opacity-50" : ""}`}
        name="message"
      />
      <input type="hidden" name="jobId" value={jobId || ""} />
      <Button className="w-full" disabled={!active}>
        Submit
      </Button>
    </fetcher.Form>
  );
}
