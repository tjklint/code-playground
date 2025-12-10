import { z, defineConfig } from "@botpress/runtime";

export default defineConfig({
  name: "code-playground",
  description:
    "Code Playground - An interactive code assistant that executes JavaScript code. " +
    "Ask me to calculate Fibonacci sequences, solve algorithms, process data, or run any JS code snippet!",

  defaultModels: {
    autonomous: "openai:gpt-4o",
    zai: "openai:gpt-4o",
  },

  bot: {
    state: z.object({}),
  },

  user: {
    state: z.object({}),
  },

  dependencies: {
    integrations: {
      chat: { version: "chat@0.7.4", enabled: true },
      webchat: { version: "webchat@0.3.0", enabled: true },
    },
  },
});
