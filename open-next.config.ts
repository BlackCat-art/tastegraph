import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  incrementalCache: async () => ({
    name: "memory",
    get: async () => null,
    set: async () => {},
    delete: async () => {},
  }),
});
