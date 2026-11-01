import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

export default function MarkdownView({ content }: { content: string }) {
  return (
    <div className="prose-glass">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // 正文图片懒加载
          img: (props) => <img {...props} loading="lazy" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
