export function filterKnowledge(entries, query = '', status = 'all') {
  const terms = query.trim().toLocaleLowerCase().split(/[\s，,；;]+/).filter(Boolean);
  return entries.filter(entry => {
    if (status === 'draft' && entry.published) return false;
    if (status === 'published' && !entry.published) return false;
    const text = ['question', 'answer', 'keywords', 'platform', 'province', 'source']
      .map(key => entry[key] || '').join(' ').toLocaleLowerCase();
    return terms.every(term => text.includes(term));
  });
}

export function parsePublishIds(ids) {
  if (!Array.isArray(ids) || !ids.length || ids.length > 100 ||
      !ids.every(id => Number.isSafeInteger(id) && id > 0 && id <= 2147483647)) {
    throw new Error('请选择 1 至 100 条有效知识');
  }
  return [...new Set(ids)];
}
