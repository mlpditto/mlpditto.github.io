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
  🎧 Lesson Viewer<br><br>
  ระบบเรียนบทเรียน Sound Literacy<br>
  เตรียมพื้นที่สำหรับเนื้อหา Audio Example และ Quiz
  </div>
  <pre>Lesson File:\n${lesson.file}</pre>`;

  renderQuiz();
}

function renderQuiz(){
  if(typeof SOUND_QUIZZES === 'undefined') return;

  const quiz = SOUND_QUIZZES[lessonId];
  if(!quiz) return;

  const content=document.getElementById('content');

  let html=`<div class="card"><h2>📝 Mini Quiz</h2>`;

  quiz.forEach((q,index)=>{
    html += `<div class="quiz-item">
    <p><b>${index+1}. ${q.question}</b></p>`;

    q.options.forEach((option,optIndex)=>{
      html += `<label>
      <input type="radio" name="q${index}" value="${optIndex}">
      ${option}
      </label><br>`;
    });

    html += `</div>`;
  });

  html += `<button class="btn" onclick="checkQuiz()">Submit Quiz</button></div>`;

  content.innerHTML += html;
}

function checkQuiz(){
  const quiz=SOUND_QUIZZES[lessonId];
  let score=0;

  quiz.forEach((q,index)=>{
    const selected=document.querySelector(`input[name="q${index}"]:checked`);
    if(selected && Number(selected.value)===q.answer){
      score++;
    }
  });

  alert(`Score: ${score}/${quiz.length} 🎉`);
}

function markComplete(){
  const key='sound-literacy-progress-v2';
  let data=JSON.parse(localStorage.getItem(key)||'[]');
  if(!data.includes(lessonId)) data.push(lessonId);
  localStorage.setItem(key,JSON.stringify(data));
  alert('Lesson Completed! 🎉');
}

document.addEventListener('DOMContentLoaded',renderLesson);
