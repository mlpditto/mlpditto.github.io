const params = new URLSearchParams(window.location.search);
const lessonId = Number(params.get('id')) || 1;

function findLesson(id){
  for(const world of SOUND_WORLDS){
    const lesson = world.lessons.find(l=>l.id===id);
    if(lesson) return lesson;
  }
  return null;
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

  try{
    const markdown = await loadMarkdownFile(lesson.file);
    let html = markdownToHTML(markdown);
    if(typeof renderInteractiveBlocks === 'function'){
      html = renderInteractiveBlocks(html);
    }
    content.innerHTML = html;
  }catch(error){
    content.innerHTML=`<div class="card">🎧 Lesson Viewer<br><br>${lesson.title}<br>ไม่พบไฟล์บทเรียน</div>`;
  }

  renderQuiz();
}

function renderQuiz(){
  if(typeof SOUND_QUIZZES === 'undefined') return;

  const quiz = SOUND_QUIZZES[lessonId];
  if(!quiz) return;

  const content=document.getElementById('content');
  let html=`<div class="card"><h2>📝 Mini Quiz</h2>`;

  quiz.forEach((q,index)=>{
    html += `<div class="quiz-item"><p><b>${index+1}. ${q.question}</b></p>`;
    q.options.forEach((option,optIndex)=>{
      html += `<label><input type="radio" name="q${index}" value="${optIndex}">${option}</label><br>`;
    });
    html += `</div>`;
  });

  html += `<button class="btn" onclick="checkQuiz()">Submit Quiz</button></div>`;
  content.innerHTML += html;
}

document.addEventListener('DOMContentLoaded',renderLesson);
