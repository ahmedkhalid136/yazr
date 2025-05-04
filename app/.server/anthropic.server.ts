import { Anthropic } from "@anthropic-ai/sdk";
import { Resource } from "sst";
const anthropic = new Anthropic({
  apiKey: Resource.ANTHROPIC_SECRET.value,
});

const anthropicBeta = new Anthropic({
  apiKey: Resource.ANTHROPIC_SECRET.value,
  defaultHeaders: {
    "anthropic-beta": "pdfs-2024-09-25",
  },
});

const ant = {
  textChat: async (text: string, system: string) => {
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 1024,
      messages: [
        { role: "assistant", content: system },
        { role: "user", content: text },
      ],
    });
    return response.content[0].text;
  },
  imageChat: async (
    text: string,
    system: string,
    imageFile: ArrayBuffer,
    imageFormat: "png" | "jpeg" = "png",
  ) => {
    const image64 = Buffer.from(imageFile).toString("base64");
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 1024,
      messages: [
        { role: "assistant", content: system },
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: `image/${imageFormat}`,
                data: image64,
              },
            },
            { type: "text", text: text },
          ],
        },
      ],
    });
    return response.content[0].text;
  },
  pdfChat: async (text: string, system: string, pdfFile: ArrayBuffer) => {
    const pdf64 = Buffer.from(pdfFile).toString("base64");
    const response = await anthropicBeta.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        { role: "assistant", content: system },
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: pdf64,
              },
            },
            { type: "text", text: text },
          ],
        },
      ],
    });
    return response.content[0].text;
  },
};

export default ant;

// recommendation from Anthropic:
// 1. For counting and reasoning on image details with a prompt like: "You have perfect vision and pay great attention to detail which makes you an expert at [XXX]. [QUESTION]. Before providing the answer in <answer> tags, think step by step in <thinking> tags and analyze every part of the image.
// 2 Message list with user message example and assistant message example answer. Do this a few times to teach the assitant how to answer.
// 3. Using subAgents to do different tasks:                {"type": "text", "text": f"Based on the following question, please generate a specific prompt for an LLM sub-agent to extract relevant information from an earning's report PDF. Each sub-agent only has access to a single quarter's earnings report. Output only the prompt and nothing else.\n\nQuestion: {question}"}
// 3.1. And then summarize:             {"type": "text", "text": f"Based on the following extracted information from Apple's earnings releases, please provide a response to the question: {QUESTION}\n\nAlso, please generate Python code using the matplotlib library to accompany your response. Enclose the code within <code> tags.\n\nExtracted Information:\n{extracted_info}"}
// 4. Using tools (function) to extract structured JSONS like
// nutrition_tool = {
//     "name": "print_nutrition_info",
//     "description": "Extracts nutrition information from an image of a nutrition label",
//     "input_schema": {
//         "type": "object",
//         "properties": {
//             "calories": {"type": "integer", "description": "The number of calories per serving"},
//             "total_fat": {"type": "integer", "description": "The amount of total fat in grams per serving"},
//             "cholesterol": {"type": "integer", "description": "The amount of cholesterol in milligrams per serving"},
//             "total_carbs": {"type": "integer", "description": "The amount of total carbohydrates in grams per serving"},
//             "protein": {"type": "integer", "description": "The amount of protein in grams per serving"}
//         },
//         "required": ["calories", "total_fat", "cholesterol", "total_carbs", "protein"]
//     }
// }

// message_list = [
//     {
//         "role": "user",
//         "content": [
//             {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": get_base64_encoded_image("../images/tool_use/nutrition_label.png")}},
//             {"type": "text", "text": "Please print the nutrition information from this nutrition label image."}
//         ]
//     }
// ]

// response = client.messages.create(
//     model=MODEL_NAME,
//     max_tokens=4096,
//     messages=message_list,
//     tools=[nutrition_tool]
// )
