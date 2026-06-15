import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface FormattedMessageProps {
  content: string
  role: 'user' | 'assistant'
}

function normalizeMarkdown(content: string): string {
  return content
    .replace(/\r\n/g, '\n')
    .replace(/([^\n])\s*(#{1,3}\s)/g, '$1\n\n$2')
    .replace(/([^\n])\s+(\d+\.\s)/g, '$1\n$2')
    .replace(/([^\n])\s+(-\s+\*\*)/g, '$1\n$2')
    .replace(/([^\n])\s+(-\s+[A-Za-z])/g, '$1\n$2')
    .trim()
}

export const FormattedMessage: React.FC<FormattedMessageProps> = ({ content, role }) => {
  if (role === 'user') {
    return <>{content}</>
  }

  const formattedContent = normalizeMarkdown(content)

  return (
    <div className="markdown-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{formattedContent}</ReactMarkdown>
    </div>
  )
}
