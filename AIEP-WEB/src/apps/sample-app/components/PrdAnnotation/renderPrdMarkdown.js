function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * 浮窗正文渲染：纯文本（换行、空行）+ 常见条目写法，兼容历史 Markdown 存量
 */
export function renderPrdMarkdown(md) {
  if (!md) return '';
  const lines = String(md).split('\n');
  const out = [];
  let inUl = false;
  let inOl = false;
  let inBlockquote = false;

  const closeLists = () => {
    if (inUl) {
      out.push('</ul>');
      inUl = false;
    }
    if (inOl) {
      out.push('</ol>');
      inOl = false;
    }
  };

  const closeBlockquote = () => {
    if (inBlockquote) {
      out.push('</blockquote>');
      inBlockquote = false;
    }
  };

  const inline = (s) => {
    let t = escapeHtml(s);
    t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/\*(.+?)\*/g, '<em>$1</em>');
    return t;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith('> ')) {
      closeLists();
      if (!inBlockquote) {
        out.push('<blockquote class="prd-md-bq">');
        inBlockquote = true;
      }
      out.push(`<p>${inline(line.slice(2))}</p>`);
      continue;
    }
    closeBlockquote();

    if (/^###\s+/.test(line)) {
      closeLists();
      out.push(`<h4 class="prd-md-h4">${inline(line.replace(/^###\s+/, ''))}</h4>`);
      continue;
    }
    if (/^##\s+/.test(line)) {
      closeLists();
      out.push(`<h3 class="prd-md-h3">${inline(line.replace(/^##\s+/, ''))}</h3>`);
      continue;
    }
    if (/^[-*·•]\s+/.test(line)) {
      if (!inUl) {
        closeLists();
        out.push('<ul class="prd-md-ul">');
        inUl = true;
      }
      out.push(`<li>${inline(line.replace(/^[-*·•]\s+/, ''))}</li>`);
      continue;
    }
    if (/^\d+[.．、]\s*/.test(line)) {
      if (!inOl) {
        closeLists();
        out.push('<ol class="prd-md-ol">');
        inOl = true;
      }
      out.push(`<li>${inline(line.replace(/^\d+[.．、]\s*/, ''))}</li>`);
      continue;
    }
    closeLists();
    if (!line.trim()) {
      out.push('<p class="prd-md-spacer">&nbsp;</p>');
    } else {
      out.push(`<p class="prd-md-p">${inline(line)}</p>`);
    }
  }
  closeLists();
  closeBlockquote();
  return out.join('');
}
