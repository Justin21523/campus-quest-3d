interface Props {
  visible: boolean;
  label: string;
}

export default function InteractionPrompt({ visible, label }: Props) {
  if (!visible) return null;

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full -mt-8 z-30 pointer-events-none">
      <div className="bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium animate-bounce whitespace-nowrap border border-white/20">
        [E] {label}
      </div>
    </div>
  );
}
