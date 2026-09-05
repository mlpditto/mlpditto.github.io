// Simple Markdown Foundation Engine for Sound Literacy Academy
// Converts basic Markdown syntax into styled HTML

function markdownToHTML(markdown){
  let html = markdown;

  html = html.replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;');

  html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');

  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  html = html.replace(/^- (.*)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';

  return html;
}

async function loadMarkdownFile(path){
  const response = await fetch(path);
  if(!response.ok){
    throw new Error('Cannot load lesson file');
  }
  return await response.text();
}
