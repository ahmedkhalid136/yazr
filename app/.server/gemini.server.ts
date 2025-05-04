import {
  GoogleGenerativeAI,
  DynamicRetrievalMode,
} from "@google/generative-ai";
import * as fs from "node:fs";
import { Resource } from "sst";
const genAI = new GoogleGenerativeAI(Resource.GEMINI_SECRET.value);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

const gemini = {
  textChat: async (text: string, system: string) => {
    const result = await model.generateContent([system, text]);
    // console.log(result.response.text());
    return result.response.text();
  },
  imageFsChat: async (
    text: string,
    imagePath: string,
    system: string,
    imageFile: File,
  ) => {
    function fileToGenerativePart(path: string, mimeType: string) {
      return {
        inlineData: {
          data: Buffer.from(fs.readFileSync(path)).toString("base64"),
          mimeType,
        },
      };
    }
    const imagePart = fileToGenerativePart(imagePath, "image/png");
    const result = await model.generateContent([system, text, imagePart]);

    console.log(result.response.text());
    return result.response.text();
  },
  imageChat: async (
    text: string,
    system: string,
    imageBase64: string,
    imageFormat: "png" | "jpeg" = "png",
  ) => {
    let res = undefined;
    let i = 0;
    while (res === undefined && i < 3) {
      try {
        i++;
        res = await model.generateContent([
          system,
          {
            inlineData: {
              data: imageBase64,
              mimeType: `image/${imageFormat}`,
            },
          },
          text,
        ]);
        break;
      } catch (e) {
        console.log(e);
      }
    }

    // console.log(result.response.text());
    return res?.response.text() ?? undefined;
  },
  longerChat: async (text: string, system: string) => {
    const chat = model.startChat({
      history: [
        {
          role: "system",
          parts: [{ text: system }],
        },
        {
          role: "user",
          parts: [{ text }],
        },
      ],
    });

    const result = await chat.sendMessage(text);
    console.log(result.response.text());
    return result.response.text();
  },
  imageUrlChat: async (text: string, imageUrls: string[], system: string) => {
    const prompt = text;
    const imageResp = await Promise.all(
      imageUrls.map(async (url) => {
        const response = await fetch(url);
        return response.arrayBuffer();
      }),
    );

    const result = await model.generateContent([
      ...imageResp.map((image) => ({
        inlineData: {
          data: Buffer.from(image).toString("base64"),
          mimeType: "image/jpeg",
        },
      })),
      prompt,
      system,
    ]);

    console.log(result.response.text());
    return result.response.text();
  },
  pdfChat: async (pdfBuffer: Buffer, system: string) => {
    const result = await model.generateContent([
      {
        inlineData: {
          data: Buffer.from(pdfBuffer).toString("base64"),
          mimeType: "application/pdf",
        },
      },
      system,
    ]);
    console.log(result.response.text());
    return result.response.text();
  },
  webToText: async (
    prompt: string,
  ): Promise<{
    content: string;
    citations: string[];
  }> => {
    console.log(Resource.GEMINI_SECRET.value);
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.0-flash",
      tools: [
        {
          googleSearch: {},
        },
      ],
    });

    const result = await model.generateContent(prompt);
    console.log(result.response.text());
    return {
      content: result.response.text(),
      citations: result.response.candidates?.[0]?.groundingMetadata || [],
    };
  },
};
export default gemini;
