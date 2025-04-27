import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Markdown({ text }: { text: string }) {
  return (
    <div className="w-full h-full p-6 gap-6 md:min-w-[800px] md:w-[800px] overflow-x-auto">
      <div className="flex flex-col justify-start items-start gap-4">
        <ReactMarkdown children={text} remarkPlugins={[remarkGfm]} />,
      </div>
    </div>
  );
}
