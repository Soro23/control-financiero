interface RuleInsightBoxProps {
  text: string;
}

export function RuleInsightBox({ text }: RuleInsightBoxProps) {
  return (
    <div className="flex items-start gap-4 px-6 py-5 bg-surface-container-low rounded-2xl">
      <div className="w-10 h-10 shrink-0 rounded-xl bg-primary/8 flex items-center justify-center">
        <span className="material-symbols-outlined text-[20px] text-primary fill-icon">lightbulb</span>
      </div>
      <div>
        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Análisis automático</p>
        <p className="text-sm text-slate-700 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
