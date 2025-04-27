import { OpenAI } from "openai";
import { Resource } from "sst";
const client = new OpenAI({
  apiKey: Resource.PERPLEXITY_SECRET.value,
  baseURL: "https://api.perplexity.ai",
});

const perplexity = {
  searchWithOptions: async (
    query: string,
    system: string = "Be precise and concise.",
    model: string = "sonar",
    max_tokens: number = 123,
    options?: {
      temperature?: number;
      top_p?: number;
      search_domain_filter?: string | null;
      return_images?: boolean;
      return_related_questions?: boolean;
      search_recency_filter?: string;
      top_k?: number;
      stream?: boolean;
      presence_penalty?: number;
      frequency_penalty?: number;
      response_format?: string | null;
    },
  ) => {
    const defaultOptions = {
      temperature: 0.2,
      top_p: 0.9,
      search_domain_filter: null,
      return_images: false,
      return_related_questions: false,
      search_recency_filter: "<string>",
      top_k: 0,
      stream: false,
      presence_penalty: 0,
      frequency_penalty: 1,
      response_format: null,
    };
    const mergedOptions = { ...defaultOptions, ...options };

    const content = {
      method: "POST",
      headers: {
        Authorization: "Bearer <token>",
        "Content-Type": "application/json",
      },
      body: `{"model":${model},"messages":[{"role":"system","content":${system}},{"role":"user","content":${query}}],"max_tokens":${max_tokens},"temperature":${mergedOptions.temperature},"top_p":${mergedOptions.top_p},"search_domain_filter":${mergedOptions.search_domain_filter},"return_images":${mergedOptions.return_images},"return_related_questions":${mergedOptions.return_related_questions},"search_recency_filter":${mergedOptions.search_recency_filter},"top_k":${mergedOptions.top_k},"stream":${mergedOptions.stream},"presence_penalty":${mergedOptions.presence_penalty},"frequency_penalty":${mergedOptions.frequency_penalty},"response_format":${mergedOptions.response_format}}`,
    };

    const response = await fetch(
      "https://api.perplexity.ai/chat/completions",
      content,
    )
      .then((response) => response.json())
      .then((response) => response)
      .catch((err) => console.error(err));

    return {
      answer: response.choices[0].message.content,
      citations: response?.citations || [],
    };
  },
  search: async (
    query: string,
    system: string = "Be precise and concise.",
    model: string = "sonar",
  ) => {
    // const response = await client.chat.completions.create({
    //   model: model,
    //   messages: [
    //     { role: "system", content: system },
    //     { role: "user", content: query },
    //   ],
    // });

    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: `{"model":"${model}","messages":[{"role":"system","content":"${system}"},{"role":"user","content":"${query}"}],"max_tokens":123,"temperature":0.2,"top_p":0.9,"search_domain_filter":null,"return_images":false,"return_related_questions":false,"search_recency_filter":"week","top_k":0,"stream":false,"presence_penalty":0,"frequency_penalty":1,"response_format":null}`,
    };
    console.log("Perplexity options", options.body);
    const response = await fetch(
      "https://api.perplexity.ai/chat/completions",
      options,
    )
      .then((response) => response.json())
      .catch((err) => console.error(err));
    console.log("Perplexity responseee", JSON.stringify(response, null, 2));
    return {
      answer: response,
    };
  },
};

export default perplexity;
