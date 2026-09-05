// Sound Literacy Reflection System
// Interactive learner reflection component

function createReflectionBlock(data) {
  const container = document.createElement('div');
  container.className = 'reflection-block';

  container.innerHTML = `
    <div class="reflection-title">💭 Reflection</div>
    <div class="reflection-question">${data.question}</div>
    <textarea class="reflection-input" placeholder="เขียนความคิดของคุณ..."></textarea>
    <button class="reflection-save">💾 Save Reflection</button>
  `;

  const button = container.querySelector('.reflection-save');
  const input = container.querySelector('.reflection-input');

  const key = `reflection-${data.lessonId}`;
  input.value = localStorage.getItem(key) || '';

  button.onclick = () => {
    localStorage.setItem(key, input.value);
    button.innerHTML = '✅ Saved';
  };

  return container;
}

window.createReflectionBlock = createReflectionBlock;
