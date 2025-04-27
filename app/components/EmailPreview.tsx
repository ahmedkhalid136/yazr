import { Paperclip } from "lucide-react";
import { Link } from "@remix-run/react";

export interface EmailPreviewProps {
  id: string;
  date: string;
  sender: string;
  email: string;
  status: string;
  subject: string;
  content: string;
}

export default function EmailPreview({
  id,
  date,
  sender,
  email,
  status,
  subject,
  content,
}: EmailPreviewProps) {
  return (
    <Link to={`/email/${id}`}>
      <div className="flex justify-start items-center">
        <div className="min-w-[180px] w-[180px] h-[120px] bg-gray-100 rounded-lg py-2 px-4">
          <p className="text-[10px] text-gray-500 font-light">
            {new Date(date).toLocaleString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </p>
          <p className="text-sm font-medium mt-4">{sender}</p>
          <p className="text-xs text-gray-500 font-light">{email}</p>
          <p className="text-[10px] text-gray-500 uppercase mt-5 font-semibold tracking-wide">
            {status}
          </p>
        </div>
        <div className="w-full px-4">
          <div className="w-full px-4 border rounded-lg p-2 h-[120px] overflow-hidden">
            <h2 className="text-sm font-medium">Subject: {subject}</h2>
            <p className="text-xs text-gray-900 leading-relaxed h-[68px] overflow-hidden text-ellipsis font-light">
              {content}
            </p>
            <div className="flex justify-end gap-2 items-center">
              <Paperclip className="w-4 h-4 text-gray-500" />
              <p className="text-xs text-gray-500 font-light">Attachments</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
