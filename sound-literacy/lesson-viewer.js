const params = new URLSearchParams(window.location.search);
const lessonId = Number(params.get('id')) || 1;

function findLesson(id){
  for(const world of SOUND_WORLDS){
    const lesson = world.lessons.find(l=>l.id===id);
    if(lesson) return lesson;
  }
  return null;
}

function markdownToHTML(md){
  return md
    .replace(/^### (.*)$/gm,'<h3>$1</h3>')
    .replace(/^## (.*)$/gm,'<h2>$1</h2>')
    .replace(/^# (.*)$/gm,'<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    .replace(/\n- (.*)/g,'<li>$1</li>')
    .replace(/\n\n/g,'<br><br>');
}

async function loadLessonContent(file){
  try{
    const response = await fetch(file);
    if(!response.ok) throw new Error('Cannot load lesson');
    const markdown = await response.text();
    return markdownToHTML(markdown);
  }catch(error){
    return `<div class="card">⚠️ ไม่สามารถโหลดเนื้อหาบทเรียนได้<br>${file}</div>`;
  }
}

function getAdjacentLesson(){
  const all=[];
  SOUND_WORLDS.forEach(w=>w.lessons.forEach(l=>all.push(l)));
  const index=all.findIndex(l=>l.id===lessonId);
  return {
    prev:index>0?all[index-1]:null,
    next:index<all.length-1?all[index+1]:null
  };
}

async function renderLesson(){
  const lesson=findLesson(lessonId);
  const title=document.getElementById('title');
  const content=document.getElementById('content');

  if(!lesson){
    title.textContent='Lesson not found';
    return;
  }

  title.textContent=`${lesson.code}: ${lesson.title}`;

  const html = await loadLessonContent(lesson.file);
  content.innerHTML = html;

  const nav=document.createElement('div');
  nav.className='card';
  const adjacent=getAdjacentLesson();

  nav.innerHTML=`
  ${adjacent.prev ? `<a class="btn" href="lesson-viewer.html?id=${adjacent.prev.id}">⬅ Previous</a>`:''}
  <a class="btn" href="lesson-map.html">🗺 Lesson Map</a>
  ${adjacent.next ? `<a class="btn" href="lesson-viewer.html?id=${adjacent.next.id}">Next ➡</a>`:''}
  `;

  content.appendChild(nav);
}

function markComplete(){
  const key='sound-literacy-progress-v2';
  let data=JSON.parse(localStorage.getItem(key)||'[]');
  if(!data.includes(lessonId)) data.push(lessonId);
  localStorage.setItem(key,JSON.stringify(data));
  alert('Lesson Completed! 🎉');
}

document.addEventListener('DOMContentLoaded',renderLesson);