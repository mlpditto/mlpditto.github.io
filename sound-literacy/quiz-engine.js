// 🎧 DigitalMindLab Quiz Engine v2
// Quiz loading + scoring + feedback + completion foundation

const QuizEngine = {
  scoreKey: 'sound-literacy-quiz-score',
  resultKey: 'sound-literacy-quiz-result',

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
    if(total === 0) return 0;
    const correct = results.filter(r => r === true).length;
    return Math.round((correct / total) * 100);
  },

  evaluate(score, passingScore = 80){
    return {
      score,
      passed: score >= passingScore,
      message: score >= passingScore ? 'Quiz Passed 🎉' : 'Try Again 🔄'
    };
  },

  saveScore(lessonId, score){
    const data = JSON.parse(localStorage.getItem(this.scoreKey) || '{}');
    data[lessonId] = score;
    localStorage.setItem(this.scoreKey, JSON.stringify(data));
    return data;
  },

  saveResult(lessonId, result){
    const data = JSON.parse(localStorage.getItem(this.resultKey) || '{}');
    data[lessonId] = result;
    localStorage.setItem(this.resultKey, JSON.stringify(data));
    return data;
  }
};
