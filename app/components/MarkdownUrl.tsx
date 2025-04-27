import { useState, useEffect } from "react";

export default function Markdown({ src }: { src: string }) {
  const [md, setMd] = useState("");
  useEffect(() => {
    fetch(src)
      .then((res) => res.text())
      .then((text) => setMd(convertTextToHtml(text as string)));
  }, [src]);
  return (
    <div className="w-full h-full p-6 gap-6 md:min-w-[800px] md:w-[800px] overflow-x-auto">
      <div className="flex flex-col justify-start items-start gap-4 text-xs">
        <div dangerouslySetInnerHTML={{ __html: md }} />
      </div>
    </div>
  );
}
function convertTextToHtml(text: string): string {
  // Replace literal "\n" with actual newlines
  text = text.replace(/\\n/g, "\n").trim();

  // Replace literal "\t" with spaces for tab characters
  text = text.replace(/\\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");

  // Convert single * at line beginning to - for bullet points
  text = text.replace(/^(\s*)\*/gm, "$1-");
  text = text.replace(/\n(\s*)\*/g, "\n$1-");

  // Remove surrounding quotes if they exist
  if (text.startsWith('"') && text.endsWith('"')) {
    text = text.slice(1, -1);
  }

  // Normalize newlines and split into non-empty lines
  const lines = text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((line) => line.trim() !== "");
  let html = "";
  let inList = false;

  // Helper: Close an open list if needed.
  function closeList() {
    if (inList) {
      html += "</ul>\n";
      inList = false;
    }
  }

  // Helper: Determine header tag based on the header text.
  function getHeaderTag(header: string): string {
    const lower = header.toLowerCase();
    if (lower.includes("title")) return "h1";
    if (
      lower.includes("key message") ||
      lower.includes("detailed slide information")
    )
      return "h2";
    return "h3";
  }

  // Process each line individually.
  for (const rawLine of lines) {
    let line = rawLine.trim();

    // Convert inline **bold** text to <strong> tags
    // Make sure we don't affect the bold header syntax (we handle that separately)
    if (!line.match(/^\*\*(.+?)\*\*:\s*(.*)$/)) {
      line = line.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    }

    // Detect bold markdown header, e.g., **Title**: Content
    const boldHeaderMatch = line.match(/^\*\*(.+?)\*\*:\s*(.*)$/);
    if (boldHeaderMatch) {
      closeList();
      const headerText = boldHeaderMatch[1].trim();
      const headerContent = boldHeaderMatch[2].trim() || headerText;
      const tag = getHeaderTag(headerText);
      html += `<${tag}>${headerContent}</${tag}>\n`;
      continue;
    }

    // Detect plain header with colon for known keys (e.g., "Title Slide:" or "Key Message:")
    const plainHeaderMatch = line.match(/^([^:]+):\s*(.*)$/);
    if (
      plainHeaderMatch &&
      (plainHeaderMatch[1].toLowerCase().includes("title") ||
        plainHeaderMatch[1].toLowerCase().includes("key message") ||
        plainHeaderMatch[1]
          .toLowerCase()
          .includes("detailed slide information"))
    ) {
      closeList();
      const headerText = plainHeaderMatch[1].trim();
      const headerContent = plainHeaderMatch[2].trim() || headerText;
      const tag = getHeaderTag(headerText);
      html += `<${tag}>${headerContent}</${tag}>\n`;
      continue;
    }

    // If a line ends with a colon (and doesn't have content), treat it as a generic header.
    if (/^[A-Za-z].*:\s*$/.test(line)) {
      closeList();
      const headerText = line.slice(0, -1).trim();
      html += `<h3>${headerText}</h3>\n`;
      continue;
    }

    // Process bullet points (lines starting with "•" or "-")
    if (line.startsWith("•") || line.startsWith("-")) {
      if (!inList) {
        html += "<ul>\n";
        inList = true;
      }
      // Remove bullet markers and extra spacing
      const listItem = line.replace(/^(\•|-)+\s*/, "");
      html += `<li>${listItem}</li>\n`;
      continue;
    }

    // For other lines, close any open list and wrap the line in a paragraph.
    closeList();
    html += `<p>${line}</p>\n`;
  }

  // Ensure any open list is closed at the end.
  closeList();
  return html;
}
