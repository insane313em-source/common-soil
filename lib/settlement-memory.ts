type EntryRecord = {
    entry_date: string;
    mood: string;
    content: string;
    keywords: string[] | null;
    user_id?: string;
  };
  
  type SummaryRecord = {
    summary_date: string;
    garden_change_text: string | null;
    ai_observation_text: string | null;
    relationship_weather: string | null;
    shared_theme: string | null;
    symbolic_suggestion: string | null;
    gentle_action: string | null;
    soil_state?: string | null;
    light_state?: string | null;
    vitality_state?: string | null;
    connection_state?: string | null;
  };
  
  function safeText(text: string | null | undefined, maxLen = 120) {
    const value = (text ?? "").replace(/\s+/g, " ").trim();
    if (!value) return "";
    return value.length > maxLen ? `${value.slice(0, maxLen)}...` : value;
  }
  
  function safeContent(text: string | null | undefined, maxLen = 160) {
    const value = (text ?? "").replace(/\s+/g, " ").trim();
    if (!value) return "";
    return value.length > maxLen ? `${value.slice(0, maxLen)}...` : value;
  }
  
  export function buildHistoricalEntriesContext(entries: EntryRecord[]) {
    if (!entries.length) return "无历史记录。";
  
    const grouped = new Map<string, EntryRecord[]>();
  
    for (const entry of entries) {
      const date = entry.entry_date;
      const list = grouped.get(date) ?? [];
      list.push(entry);
      grouped.set(date, list);
    }
  
    const lines: string[] = [];
  
    const sortedDates = Array.from(grouped.keys()).sort();
  
    for (const date of sortedDates) {
      const dayEntries = grouped.get(date) ?? [];
      const entryLines = dayEntries.map((entry, index) => {
        const keywords =
          entry.keywords && entry.keywords.length > 0
            ? entry.keywords.join("、")
            : "无关键词";
  
        return `  记录${index + 1}：mood=${entry.mood}；keywords=${keywords}；content=${safeContent(
          entry.content,
          140
        )}`;
      });
  
      lines.push(`[${date}]`);
      lines.push(...entryLines);
    }
  
    return lines.join("\n");
  }
  
  export function buildHistoricalSummariesContext(summaries: SummaryRecord[]) {
    if (!summaries.length) return "无历史结算。";
  
    return summaries
      .sort((a, b) => a.summary_date.localeCompare(b.summary_date))
      .map((item) => {
        return [
          `[${item.summary_date}]`,
          `  共土变化：${safeText(item.garden_change_text, 80) || "无"}`,
          `  观察：${safeText(item.ai_observation_text, 100) || "无"}`,
          `  关系气候：${safeText(item.relationship_weather, 60) || "无"}`,
          `  共振主题：${safeText(item.shared_theme, 50) || "无"}`,
          `  隐喻建议：${safeText(item.symbolic_suggestion, 80) || "无"}`,
          `  轻动作建议：${safeText(item.gentle_action, 80) || "无"}`,
        ].join("\n");
      })
      .join("\n");
  }
  
  export function buildLongTermMemoryBlock(params: {
    historicalEntries: EntryRecord[];
    historicalSummaries: SummaryRecord[];
  }) {
    const entriesText = buildHistoricalEntriesContext(params.historicalEntries);
    const summariesText = buildHistoricalSummariesContext(params.historicalSummaries);
  
    return `
  【历史记录上下文】
  ${entriesText}
  
  【历史结算上下文】
  ${summariesText}
    `.trim();
  }