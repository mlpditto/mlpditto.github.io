const params = new URLSearchParams(window.location.search);
const lessonId = Number(params.get('id')) || 1;

function findLesson(id){
  for(const world of SOUND_WORLDS){
    const lesson = world.lessons.find(l=>l.id===id);
    if(lesson) return lesson;
  }
  return null;
}

function renderLesson(){
  const lesson=findLesson(lessonId);
  const title=document.getElementById('title');
  const content=document.getElementById('content');

  if(!lesson){
    title.textContent='Lesson not found';
    return;
  }

  title.textContent=`${lesson.code}: ${lesson.title}`;
  content.innerHTML=`
  <h2>${lesson.title}</h2>
  <p>${lesson.subtitle}</p>
  <div class="card">
  🎧 Lesson Viewer Prototype<br><br>
  เชื่อมต่อกับเนื้อหา Markdown ของบทเรียนในขั้นถัดไป<br>
  ระบบนี้เตรียมไว้สำหรับเพิ่ม Quiz, Audio Example และ Progress Tracking
  </div>
  <pre>Lesson File:\n${lesson.file}</pre>`;
}

function markComplete(){
  const key='sound-literacy-progress-v2';
  let data=JSON.parse(localStorage.getItem(key)||'[]');
  if(!data.includes(lessonId)) data.push(lessonId);
  localStorage.setItem(key,JSON.stringify(data));
  alert('Lesson Completed! 🎉');
}

document.addEventListener('DOMContentLoaded',renderLesson);