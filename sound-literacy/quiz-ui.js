// 📝 DigitalMindLab Quiz UI System v1

const QuizUI = {
  render(container, quiz){
    if(!container || !quiz) return;

    container.innerHTML = `
      <div class="quiz-card">
        <h3>📝 Mini Quiz</h3>
        <div id="quiz-content"></div>
        <button id="submit-quiz">Submit Quiz</button>
        <div id="quiz-result"></div>
      </div>
    `;

    const content = container.querySelector('#quiz-content');

    quiz.questions.forEach((q,index)=>{
      const block = document.createElement('div');
      block.className = 'quiz-question';
      block.innerHTML = `
        <p>${index+1}. ${q.question}</p>
        ${q.options.map((option,i)=>`
          <label>
            <input type="radio" name="q${index}" value="${i}">
            ${option}
          </label><br>
        `).join('')}
      `;
      content.appendChild(block);
    });
  }
};
