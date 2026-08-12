import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose max-w-none prose-headings:font-heading prose-headings:text-primary prose-a:text-primary prose-strong:text-ink prose-code:text-pink prose-pre:rounded-2xl prose-pre:bg-ink prose-pre:text-white">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
