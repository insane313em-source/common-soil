import OpenAI from "openai";

const baseURL = process.env.OPENAI_BASE_URL;

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  ...(baseURL ? { baseURL } : {}),
});