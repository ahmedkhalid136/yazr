import axios from "axios";

export const getCompletion = async ({
  apiKey,
  image,
  llmParams,
  maintainFormat,
  model,
  priorPage,
}: CompletionArgs): Promise<CompletionResponse> => {
  const systemPrompt = `
      Convert the following PDF page to markdown.
      Return only the markdown with no explanation text. Do not include deliminators like '''markdown.
      You must include all information on the page. Do not exclude headers, footers, or subtext.
    `;

  // Default system message.
  const messages: any = [{ role: "system", content: systemPrompt }];

  // If content has already been generated, add it to context.
  // This helps maintain the same format across pages
  if (maintainFormat && priorPage && priorPage.length) {
    messages.push({
      role: "system",
      content: `Markdown must maintain consistent formatting with the following page: \n\n """${priorPage}"""`,
    });
  }

  // Add Image to request
  const base64Image = await encodeImageToBase64(image);
  messages.push({
    role: "user",
    content: [
      {
        type: "image_url",
        image_url: { url: `data:image/png;base64,${base64Image}` },
      },
    ],
  });

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        messages,
        model,
        ...convertKeysToSnakeCase(llmParams ?? null),
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data;

    return {
      content: data.choices[0].message.content,
      inputTokens: data.usage.prompt_tokens,
      outputTokens: data.usage.completion_tokens,
    };
  } catch (err) {
    console.error("Error in OpenAI completion", err);
    throw err;
  }
};

export interface CompletionResponse {
  content: string;
  inputTokens: number;
  outputTokens: number;
}
export interface LLMParams {
  frequencyPenalty?: number;
  maxTokens?: number;
  presencePenalty?: number;
  temperature?: number;
  topP?: number;
}

export interface CompletionArgs {
  apiKey: string;
  image: Buffer;
  llmParams?: LLMParams;
  maintainFormat: boolean;
  model: ModelOptions | string;
  priorPage: string;
}
export enum ModelOptions {
  gpt_4o = "gpt-4o",
  gpt_4o_mini = "gpt-4o-mini",
}

export const encodeImageToBase64 = async (imageBuffer: Buffer) => {
  return imageBuffer.toString("base64");
};
export const camelToSnakeCase = (str: string) =>
  str.replace(/[A-Z]/g, (letter: string) => `_${letter.toLowerCase()}`);

export const convertKeysToSnakeCase = (
  obj: Record<string, any> | null
): Record<string, any> => {
  if (typeof obj !== "object" || obj === null) {
    return obj ?? {};
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [camelToSnakeCase(key), value])
  );
};

// Strip out the ```markdown wrapper
export const formatMarkdown = (text: string) => {
  let formattedMarkdown = text?.trim();
  let loopCount = 0;
  const maxLoops = 3;

  const startsWithMarkdown = formattedMarkdown.startsWith("```markdown");
  while (startsWithMarkdown && loopCount < maxLoops) {
    const endsWithClosing = formattedMarkdown.endsWith("```");

    if (startsWithMarkdown && endsWithClosing) {
      const outermostBlockRegex = /^```markdown\n([\s\S]*?)\n```$/;
      const match = outermostBlockRegex.exec(formattedMarkdown);

      if (match) {
        formattedMarkdown = match[1].trim();
        loopCount++;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return formattedMarkdown;
};
