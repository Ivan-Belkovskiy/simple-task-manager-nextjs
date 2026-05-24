
export default function TextHighlight({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight.trim()) return <span>{text}</span>;

  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} style={{ backgroundColor: '#ffee00' }}>{part}</span>
        ) : (
          part
        )
      )}
    </span>
  );
}