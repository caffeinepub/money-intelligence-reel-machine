import { formatToScript } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useGenerateScript() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (topic: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.generateScript(topic);
    },
  });
}

export function useCleanScript() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({ content }: { content: string }) => {
      const lines = content
        .split(/\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      try {
        if (!actor) throw new Error("Not connected");
        const result = await actor.cleanAndFormatContent(lines);
        if (Array.isArray(result) && result.length >= 2)
          return result as string[];
        return formatToScript(content);
      } catch {
        return formatToScript(content);
      }
    },
  });
}
