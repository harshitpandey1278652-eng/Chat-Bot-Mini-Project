import React, { useState } from 'react';
import { Copy, Check, Terminal, Lightbulb, BookOpen, Atom, HelpCircle } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="space-y-3 leading-relaxed text-slate-800 dark:text-slate-200">
      {parseMarkdownBlocks(content)}
    </div>
  );
};

function parseMarkdownBlocks(text: string) {
  if (!text) return null;

  // Split into lines to identify block-level structures
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLanguage = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block start/end
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        elements.push(
          <CodeBlock
            key={`code-${i}`}
            code={codeBuffer.join('\n')}
            language={codeLanguage || 'text'}
          />
        );
        codeBuffer = [];
        inCodeBlock = false;
        codeLanguage = '';
      } else {
        // Start code block
        inCodeBlock = true;
        codeLanguage = line.replace('```', '').trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Check for Tier Section Headings (Level 1, 2, 3, 4)
    if (line.includes('Level 1:') || line.includes('[Level 1') || line.includes('🟢')) {
      elements.push(
        <div
          key={`tier-1-${i}`}
          className="mt-4 mb-2 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-emerald-900 font-semibold shadow-xs dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{cleanHeading(line)}</span>
          <span className="ml-auto text-xs font-normal uppercase tracking-wider text-emerald-700 bg-emerald-100 dark:bg-emerald-900/60 dark:text-emerald-300 px-2 py-0.5 rounded-full">
            Basic Tier
          </span>
        </div>
      );
      continue;
    }

    if (line.includes('Level 2:') || line.includes('[Level 2') || line.includes('🟡')) {
      elements.push(
        <div
          key={`tier-2-${i}`}
          className="mt-5 mb-2 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-amber-900 font-semibold shadow-xs dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
        >
          <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>{cleanHeading(line)}</span>
          <span className="ml-auto text-xs font-normal uppercase tracking-wider text-amber-700 bg-amber-100 dark:bg-amber-900/60 dark:text-amber-300 px-2 py-0.5 rounded-full">
            Intermediate
          </span>
        </div>
      );
      continue;
    }

    if (line.includes('Level 3:') || line.includes('[Level 3') || line.includes('🔴')) {
      elements.push(
        <div
          key={`tier-3-${i}`}
          className="mt-5 mb-2 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50/80 px-3 py-2 text-rose-900 font-semibold shadow-xs dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
        >
          <Atom className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{cleanHeading(line)}</span>
          <span className="ml-auto text-xs font-normal uppercase tracking-wider text-rose-700 bg-rose-100 dark:bg-rose-900/60 dark:text-rose-300 px-2 py-0.5 rounded-full">
            Advanced Rigor
          </span>
        </div>
      );
      continue;
    }

    if (line.includes('Level 4:') || line.includes('[Level 4') || line.includes('🧠')) {
      elements.push(
        <div
          key={`tier-4-${i}`}
          className="mt-5 mb-2 flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50/80 px-3 py-2 text-purple-900 font-semibold shadow-xs dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300"
        >
          <HelpCircle className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
          <span>{cleanHeading(line)}</span>
          <span className="ml-auto text-xs font-normal uppercase tracking-wider text-purple-700 bg-purple-100 dark:bg-purple-900/60 dark:text-purple-300 px-2 py-0.5 rounded-full">
            Active Recall
          </span>
        </div>
      );
      continue;
    }

    // Markdown Headings
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-base font-bold text-slate-900 dark:text-slate-100 mt-4 mb-1">
          {renderFormattedInline(line.replace('### ', ''))}
        </h3>
      );
      continue;
    }

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-5 mb-2 border-b border-slate-200 dark:border-slate-800 pb-1">
          {renderFormattedInline(line.replace('## ', ''))}
        </h2>
      );
      continue;
    }

    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${i}`} className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-6 mb-2">
          {renderFormattedInline(line.replace('# ', ''))}
        </h1>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="my-2 border-l-4 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 px-3 py-2 text-slate-700 dark:text-slate-300 italic rounded-r-md text-sm"
        >
          {renderFormattedInline(line.replace('> ', ''))}
        </blockquote>
      );
      continue;
    }

    // List item (bullet or numbered)
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const trimmed = line.trim().substring(2);
      elements.push(
        <div key={`li-${i}`} className="ml-4 flex items-start gap-2 my-1">
          <span className="text-indigo-500 font-bold leading-none mt-1.5">•</span>
          <span className="flex-1">{renderFormattedInline(trimmed)}</span>
        </div>
      );
      continue;
    }

    const numberedMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      elements.push(
        <div key={`nli-${i}`} className="ml-4 flex items-start gap-2 my-1">
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-xs leading-none mt-1 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
            {numberedMatch[1]}
          </span>
          <span className="flex-1">{renderFormattedInline(numberedMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Empty line
    if (!line.trim()) {
      elements.push(<div key={`sp-${i}`} className="h-1" />);
      continue;
    }

    // Regular paragraph line
    elements.push(
      <p key={`p-${i}`} className="my-1.5">
        {renderFormattedInline(line)}
      </p>
    );
  }

  // Handle unclosed code block if streaming is still in progress
  if (inCodeBlock && codeBuffer.length > 0) {
    elements.push(
      <CodeBlock
        key="code-incomplete"
        code={codeBuffer.join('\n')}
        language={codeLanguage || 'text'}
      />
    );
  }

  return elements;
}

function cleanHeading(heading: string): string {
  return heading
    .replace(/^#+\s*/, '')
    .replace(/[🟢🟡🔴🧠]/g, '')
    .replace(/[\[\]]/g, '')
    .trim();
}

function renderFormattedInline(text: string): React.ReactNode {
  // Split on bold, inline code, and math symbols
  // Support `inline code` and **bold text**
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let idx = 0;

  while (remaining.length > 0) {
    // Check for inline code `code`
    const codeStart = remaining.indexOf('`');
    const boldStart = remaining.indexOf('**');

    let nextToken = -1;
    let type: 'code' | 'bold' | null = null;

    if (codeStart !== -1 && (boldStart === -1 || codeStart < boldStart)) {
      nextToken = codeStart;
      type = 'code';
    } else if (boldStart !== -1) {
      nextToken = boldStart;
      type = 'bold';
    }

    if (nextToken === -1) {
      parts.push(remaining);
      break;
    }

    // Push preceding text
    if (nextToken > 0) {
      parts.push(remaining.substring(0, nextToken));
    }

    if (type === 'code') {
      const codeEnd = remaining.indexOf('`', nextToken + 1);
      if (codeEnd !== -1) {
        const codeText = remaining.substring(nextToken + 1, codeEnd);
        parts.push(
          <code
            key={`inline-code-${idx++}`}
            className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-indigo-600 dark:text-indigo-400 font-medium border border-slate-200 dark:border-slate-700"
          >
            {codeText}
          </code>
        );
        remaining = remaining.substring(codeEnd + 1);
      } else {
        parts.push(remaining.substring(nextToken));
        break;
      }
    } else if (type === 'bold') {
      const boldEnd = remaining.indexOf('**', nextToken + 2);
      if (boldEnd !== -1) {
        const boldText = remaining.substring(nextToken + 2, boldEnd);
        parts.push(
          <strong key={`bold-${idx++}`} className="font-semibold text-slate-900 dark:text-white">
            {boldText}
          </strong>
        );
        remaining = remaining.substring(boldEnd + 2);
      } else {
        parts.push(remaining.substring(nextToken));
        break;
      }
    }
  }

  return parts;
}

const CodeBlock: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900 text-slate-100 shadow-md">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-3.5 py-2 text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-mono">
          <Terminal className="h-3.5 w-3.5 text-indigo-400" />
          <span>{language || 'code'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded bg-slate-800 hover:bg-slate-700 px-2 py-1 text-xs text-slate-300 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto p-4 font-mono text-xs sm:text-sm leading-relaxed text-slate-200">
        <pre>{code}</pre>
      </div>
    </div>
  );
};
