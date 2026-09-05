function renderInteractiveBlocks(html){
  html = html.replace(/:::concept\n([\s\S]*?)\n:::/g,
    '<div class="interactive-block concept"><h3>🧠 Core Concept</h3><p>$1</p></div>');

  html = html.replace(/:::8bit\n([\s\S]*?)\n:::/g,
    '<div class="interactive-block pixel"><h3>🎮 8-bit Analogy</h3><p>$1</p></div>');

  html = html.replace(/:::ethics\n([\s\S]*?)\n:::/g,
    '<div class="interactive-block ethics"><h3>⚖️ Ethics Check</h3><p>$1</p></div>');

  html = html.replace(/:::reflection\n([\s\S]*?)\n:::/g,
    '<div class="interactive-block reflection"><h3>💭 Reflection</h3><p>$1</p></div>');

  html = html.replace(/:::audio\n([\s\S]*?)\n:::/g,
    '<div class="interactive-block audio"><h3>🎧 Sound Lab</h3><p>$1</p><button disabled>Audio Player Coming Soon</button></div>');

  return html;
}
