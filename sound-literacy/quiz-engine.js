// 🎧 DigitalMindLab Quiz Engine v1
// Quiz loading + scoring + lesson completion foundation

const QuizEngine = {
  scoreKey: 'sound-literacy-quiz-score',

  async loadQuiz(file){
    const response = await fetch(file);
    if(!response.ok) throw new Error('Quiz file not found');
    return await response.json();
  },

  checkAnswer(selected, correct){
    return selected === correct;
  },

  calculateScore(results){
    const total = results.length;
    const correct = results.filter(r => r === true).length;
    return Math.round((correct / total) * 100);
  },

  saveScore(lessonId, score){
    const data = JSON.parse(localStorage.getItem(this.scoreKey) || '{}');
    data[lessonId] = score;
    localStorage.setItem(this.scoreKey, JSON.stringify(data));
    return data;
  }
};
