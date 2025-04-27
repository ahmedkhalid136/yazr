import gemini from "./gemini.server";
import perplexity from "./perplexity.server";

const enum Model {
  SONAR = "sonar",
  CLAUDE_3_5_SONNET = "claude-3-5-sonnet",
  GPT_4O = "gpt-4o",
}

const ai = {
  textToText: async ({
    query,
    system = "Be precise and concise.",
    model = "sonar",
  }: {
    query: string;
    system?: string;
    model?: string;
  }) => {
    if (model === Model.SONAR) {
      const response = await perplexity.searchWithOptions(query, system, model);
      return response;
    }
    if (model === Model.CLAUDE_3_5_SONNET) {
      const response = await claude.searchWithOptions(query, system, model);
      return response;
    }
    if (model === Model.GPT_4O) {
      const response = await gpt.searchWithOptions(query, system, model);
      return response;
    }
  },
  imageToText: async (image: string) => {
    const response = await perplexity.searchWithOptions(image);
    return response;
  },
  fileToText: async (file: string) => {
    const response = await perplexity.searchWithOptions(file);
    return response;
  },
  webToText: {
    perplexity: async (url: string) => {
      const response = await perplexity.searchWithOptions(url);
      return response;
    },
    gemini: async (
      query: string,
    ): Promise<{
      content: string;
      citations: string[];
    }> => {
      const response = await gemini.webToText(query);
      return response;
    },
  },
};

export default ai;
