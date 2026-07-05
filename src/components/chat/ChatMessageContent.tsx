function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-ink-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export function ChatMessageContent({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="text-sm leading-relaxed text-ink-700 space-y-1.5">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1" />;
        if (trimmed.startsWith("• ") || trimmed.startsWith("- ")) {
          return (
            <p key={i} className="pl-1">
              {renderInline(trimmed)}
            </p>
          );
        }
        if (/^\d+\.\s/.test(trimmed)) {
          return (
            <p key={i} className="pl-1">
              {renderInline(trimmed)}
            </p>
          );
        }
        return <p key={i}>{renderInline(trimmed)}</p>;
      })}
    </div>
  );
}
