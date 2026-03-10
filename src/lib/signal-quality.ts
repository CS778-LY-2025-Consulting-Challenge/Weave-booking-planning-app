/**
 * Signal Quality Assessment Utilities
 * Evaluates and filters UGC signals based on actionability and usefulness
 */

interface Signal {
  signalType: 'positive' | 'negative' | 'suggestion';
  category: string;
  title: string;
  content: string;
  actionable?: string | null;
  confidence: number;
  commentCount?: number;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Calculate actionability score for a signal (0-1)
 * Higher scores indicate more useful, actionable insights
 */
export function calculateActionabilityScore(signal: Signal): number {
  let score = 0.5; // Base score

  // ✅ +0.3: Has specific actionable suggestion
  if (signal.actionable && signal.actionable.length > 20) {
    score += 0.3;
  }

  // ✅ +0.2: Critical categories (safety, cost, transportation)
  const criticalCategories = ['transportation', 'safety', 'cost'];
  if (criticalCategories.includes(signal.category)) {
    score += 0.2;
  }

  // ✅ +0.1: Multiple users mentioned it
  if ((signal.commentCount ?? 0) >= 3) {
    score += 0.1;
  } else if ((signal.commentCount ?? 0) >= 2) {
    score += 0.05;
  }

  // ❌ -0.3: Generic positive feedback without actionable advice
  if (
    signal.signalType === 'positive' &&
    !signal.actionable &&
    (signal.commentCount ?? 0) < 3
  ) {
    score -= 0.3;
  }

  // ❌ -0.2: Low confidence from AI
  if (signal.confidence < 0.6) {
    score -= 0.2;
  }

  // ✅ +0.1: High priority
  if (signal.priority === 'high') {
    score += 0.1;
  }

  // ✅ +0.15: Contains specific details (times, prices, locations)
  const hasSpecifics =
    /\d+\s*(am|pm|hour|minute|dollar|€|£|\$|morning|evening|night)/i.test(
      signal.content + ' ' + (signal.actionable || '')
    );
  if (hasSpecifics) {
    score += 0.15;
  }

  // Clamp between 0 and 1
  return Math.max(0, Math.min(1, score));
}

/**
 * Determine quality tier based on actionability score
 */
export function determineQualityTier(
  actionabilityScore: number
): 'critical' | 'high' | 'standard' | 'low' {
  if (actionabilityScore >= 0.85) return 'critical';
  if (actionabilityScore >= 0.7) return 'high';
  if (actionabilityScore >= 0.5) return 'standard';
  return 'low';
}

/**
 * Calculate semantic similarity between two strings (simple version)
 * Returns a score between 0 (completely different) and 1 (identical)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const s1 = normalize(str1);
  const s2 = normalize(str2);

  // Exact match
  if (s1 === s2) return 1.0;

  // One contains the other (high similarity)
  if (s1.includes(s2) || s2.includes(s1)) {
    const shorter = Math.min(s1.length, s2.length);
    const longer = Math.max(s1.length, s2.length);
    return 0.7 + (shorter / longer) * 0.3; // Boost to 0.7-1.0 range
  }

  // Extract key words (filter out common words)
  const stopWords = new Set([
    'the',
    'a',
    'an',
    'to',
    'and',
    'or',
    'for',
    'of',
    'in',
    'on',
    'at',
    'is',
    'it',
  ]);

  const getKeyWords = (s: string) =>
    new Set(s.split(/\s+/).filter((w) => w.length > 2 && !stopWords.has(w)));

  const words1 = getKeyWords(s1);
  const words2 = getKeyWords(s2);

  if (words1.size === 0 || words2.size === 0) return 0;

  // Jaccard similarity for key words
  const intersection = new Set([...words1].filter((w) => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  const jaccardScore = intersection.size / union.size;

  // Boost score if key action words match
  const actionWords = ['visit', 'avoid', 'book', 'take', 'use', 'try'];
  const hasMatchingAction = actionWords.some(
    (action) => s1.includes(action) && s2.includes(action)
  );

  return hasMatchingAction ? jaccardScore * 1.2 : jaccardScore;
}

/**
 * Find and merge duplicate signals based on semantic similarity
 */
export function deduplicateSignals<
  T extends {
    id?: string;
    title: string;
    content: string;
    commentCount?: number;
    actionable?: string | null;
    commentIds: string | string[];
    category?: string;
  },
>(signals: T[], similarityThreshold: number = 0.65): T[] {
  if (signals.length === 0) return signals;

  const merged: T[] = [];
  const processed = new Set<number>();

  for (let i = 0; i < signals.length; i++) {
    if (processed.has(i)) continue;

    let current = { ...signals[i] };
    const duplicateIndices: number[] = [];

    // Find similar signals
    for (let j = i + 1; j < signals.length; j++) {
      if (processed.has(j)) continue;

      const similarity = calculateSimilarity(
        signals[i].title,
        signals[j].title
      );

      // Also check if they're in the same category with overlapping content
      const sameCategory = signals[i].category === signals[j].category;
      const contentSimilarity = calculateSimilarity(
        signals[i].content,
        signals[j].content
      );

      const isDuplicate =
        similarity >= similarityThreshold ||
        (sameCategory && contentSimilarity >= 0.5);

      if (isDuplicate) {
        duplicateIndices.push(j);
        processed.add(j);

        // Merge: keep the one with more comments or better actionable
        if (
          (signals[j].commentCount ?? 0) > (current.commentCount ?? 0) ||
          ((signals[j].commentCount ?? 0) === (current.commentCount ?? 0) &&
            (signals[j].actionable?.length || 0) >
              (current.actionable?.length || 0))
        ) {
          current = { ...signals[j] };
        }

        // Merge comment IDs
        const currentIds = Array.isArray(current.commentIds)
          ? current.commentIds
          : JSON.parse(current.commentIds as string);
        const newIds = Array.isArray(signals[j].commentIds)
          ? signals[j].commentIds
          : JSON.parse(signals[j].commentIds as string);

        const mergedIds = [...new Set([...currentIds, ...newIds])];
        current.commentIds = (
          typeof current.commentIds === 'string'
            ? JSON.stringify(mergedIds)
            : mergedIds
        ) as T['commentIds'];
        current.commentCount = mergedIds.length;
      }
    }

    merged.push(current);
    processed.add(i);
  }

  return merged;
}

/**
 * Use AI to perform semantic deduplication of signals
 * Groups semantically similar signals and keeps the best one from each group
 */
export async function deduplicateWithAI<
  T extends {
    id?: string;
    title: string;
    content: string;
    commentCount?: number;
    actionabilityScore?: number;
  },
>(signals: T[], openaiApiKey: string): Promise<T[]> {
  if (signals.length <= 1) return signals;

  try {
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({ apiKey: openaiApiKey });

    // Prepare signal data for AI
    const signalList = signals.map((s, idx) => ({
      index: idx,
      title: s.title,
      content: s.content.substring(0, 200), // Truncate to save tokens
    }));

    const prompt = `Analyze these user-generated travel signals and group them by semantic similarity. Signals about the same topic/issue should be in the same group, even if worded differently.

Signals:
${signalList.map((s) => `[${s.index}] ${s.title}\n   ${s.content}`).join('\n\n')}

Return a JSON object with:
- groups: Array of arrays, where each inner array contains the indices of similar signals
- reasoning: Brief explanation of grouping logic

Example: {"groups": [[0,2,5], [1,3], [4]], "reasoning": "Grouped museum timing signals together, parking/transport together, and dining separately"}

IMPORTANT: Return your response as a JSON object.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    const groups: number[][] = result.groups || [];

    // Keep the best signal from each group
    const deduped: T[] = [];
    const used = new Set<number>();

    for (const group of groups) {
      if (group.length === 0) continue;

      // Find best signal in group (highest score, most comments)
      const groupSignals = group.map((idx) => signals[idx]);
      const best = groupSignals.reduce((a, b) => {
        const scoreA = a.actionabilityScore ?? 0;
        const scoreB = b.actionabilityScore ?? 0;
        if (scoreA !== scoreB) return scoreA > scoreB ? a : b;
        return (a.commentCount ?? 0) > (b.commentCount ?? 0) ? a : b;
      });

      deduped.push(best);
      group.forEach((idx) => used.add(idx));
    }

    // Add ungrouped signals
    signals.forEach((signal, idx) => {
      if (!used.has(idx)) deduped.push(signal);
    });

    console.log(
      `[AI Deduplication] Reduced ${signals.length} signals to ${deduped.length} (removed ${signals.length - deduped.length} duplicates)`
    );
    console.log(`[AI Deduplication] Groups found:`, groups.length);

    return deduped;
  } catch (error) {
    console.error('[AI Deduplication] Error:', error);
    // Fallback to original list if AI fails
    return signals;
  }
}

/**
 * Filter signals to show only high-quality, actionable ones
 */
export function filterQualitySignals<
  T extends { actionabilityScore?: number; qualityTier?: string },
>(signals: T[], options?: { minScore?: number; maxCount?: number }): T[] {
  const minScore = options?.minScore ?? 0.6;
  const maxCount = options?.maxCount ?? 8;

  return signals
    .filter((s) => (s.actionabilityScore ?? 0) >= minScore)
    .slice(0, maxCount);
}
