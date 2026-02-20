import { Card, CardContent, Stack, Icon } from "@/components/ui";

interface QuoteCardProps {
  quote: string;
  author: string;
}

export default function QuoteCard({ quote, author }: QuoteCardProps) {
  return (
    <Card
      variant="bordered"
      className="bg-zinc-100 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 h-full"
    >
      <CardContent className="flex flex-col justify-center h-full py-8 px-6">
        <Stack gap="md" align="center" className="text-center">
          <div className="text-4xl text-blue-500 dark:text-blue-400 font-serif">
            &ldquo;&rdquo;
          </div>
          <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300 italic">
            &ldquo;{quote}&rdquo;
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            — {author}
          </p>
        </Stack>
      </CardContent>
    </Card>
  );
}
