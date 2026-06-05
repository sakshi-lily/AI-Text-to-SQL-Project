export interface SecurityStatus {
  status: 'Safe' | 'Warning' | 'Blocked';
  message: string;
}

export function validateSqlSecurity(sql: string): SecurityStatus {
  if (!sql || !sql.trim()) {
    return { status: 'Safe', message: 'Ready to write queries.' };
  }

  const clean = sql.trim();
  const lowercase = clean.toLowerCase();

  // Strip SQL comments for parsing keywords, but keep track if we have blocked keywords inside comments
  const commentRegex = /(--.*$|\/\*[\s\S]*?\*\/)/gm;
  const sqlWithoutComments = lowercase.replace(commentRegex, '');

  // 1. Enforce read-only starts
  const firstWordMatch = sqlWithoutComments.trim().match(/^[a-z]+/);
  const firstWord = firstWordMatch ? firstWordMatch[0] : '';
  const allowedStarts = ['select', 'show', 'desc', 'explain'];

  if (firstWord && !allowedStarts.includes(firstWord)) {
    return {
      status: 'Blocked',
      message: `SQL Safety Blocked: Only SELECT, SHOW, DESC, and EXPLAIN read-only actions are permitted. Restricted start command: '${firstWord.toUpperCase()}'.`
    };
  }

  // 2. Scan for blocked commands as standalone words
  const blockedKeywords = ['delete', 'drop', 'alter', 'truncate', 'update', 'insert', 'create', 'rename'];
  for (const keyword of blockedKeywords) {
    const wordPattern = new RegExp(`\\b${keyword}\\b`, 'i');
    if (wordPattern.test(sqlWithoutComments)) {
      return {
        status: 'Blocked',
        message: `SQL Safety Blocked: Command '${keyword.toUpperCase()}' is strictly prohibited to protect database integrity.`
      };
    }
  }

  // 3. Scan comments for suspicious block-level commands
  const commentsMatch = lowercase.match(commentRegex);
  if (commentsMatch) {
    const commentsText = commentsMatch.join(' ');
    for (const keyword of blockedKeywords) {
      if (new RegExp(`\\b${keyword}\\b`, 'i').test(commentsText)) {
        return {
          status: 'Warning',
          message: `SQL Safety Warning: Suspicious comment block detected containing database modification keyword: '${keyword.toUpperCase()}'.`
        };
      }
    }
  }

  // 4. Mismatched quotes validation
  const singleQuotesCount = (clean.match(/'/g) || []).length;
  const doubleQuotesCount = (clean.match(/"/g) || []).length;
  if (singleQuotesCount % 2 !== 0 || doubleQuotesCount % 2 !== 0) {
    return {
      status: 'Warning',
      message: 'SQL Safety Warning: Mismatched quotation marks detected. This might cause syntax execution issues or indicates sql injection hazards.'
    };
  }

  // 5. Check for multiple query executions (stacked queries)
  const queryCount = clean.split(';').map(q => q.trim()).filter(q => q.length > 0).length;
  if (queryCount > 1) {
    return {
      status: 'Warning',
      message: 'SQL Safety Warning: Multi-statement query (stacked execution via \';\') detected. Only the first SELECT query will process.'
    };
  }

  // 6. Check for full-table queries (no filters or limits) on students
  if (lowercase.includes('from students') && !lowercase.includes('where') && !lowercase.includes('limit')) {
    return {
      status: 'Warning',
      message: 'SQL Safety Warning: Query lacks a filtering WHERE constraint or LIMIT scope. This may perform a full table scan.'
    };
  }

  return {
    status: 'Safe',
    message: 'Query conforms to read-only security policies.'
  };
}
