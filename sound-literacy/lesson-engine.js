// 🎧 DigitalMindLab Lesson Engine v5
// Dynamic lesson loading + progress + unlock + quiz completion

const LessonEngine = {
  progressKey: 'sound-literacy-progress',
  sectionKey: 'sound-literacy-section-progress',
  xpKey: 'sound-literacy-xp',
  quizKey: 'sound-literacy-quiz-result',
  totalLessons: 12,

  async loadLesson(lesson){
    const response = await fetch(lesson.file);
    if(!response.ok) throw new Error('Lesson file not found');
    return await response.text();
  },

  completeFromQuiz(lessonId, score, passed){
    this.saveQuizResult(lessonId, score, passed);
    if(passed){
      this.completeLesson(Number(lessonId));
      return {status:'completed', message:'🎉 Quiz Passed! Lesson Completed'};
    }
    return {status:'retry', message:'🔄 Try Again'};
  },

  saveQuizResult(lessonId, score, passed){
    let results = JSON.parse(localStorage.getItem(this.quizKey) || '{}');
    results[lessonId] = {
      score: score,
      passed: passed,
      completedAt: new Date().toISOString()
    };
    localStorage.setItem(this.quizKey, JSON.stringify(results));
    return results[lessonId];
  },

  completeLesson(id){
    let progress = this.getProgress();
    if(!progress.includes(id)){
      progress.push(id);
      localStorage.setItem(this.progressKey, JSON.stringify(progress));
      this.addXP(50);
      if(typeof BadgeSystem !== 'undefined') BadgeSystem.check(progress);
    }
    return progress;
  },

  getProgress(){
    return JSON.parse(localStorage.getItem(this.progressKey) || '[]');
  },

  addXP(amount){
    let xp = Number(localStorage.getItem(this.xpKey) || 0);
    xp += amount;
    localStorage.setItem(this.xpKey, xp);
    return xp;
  },

  getXP(){
    return Number(localStorage.getItem(this.xpKey) || 0);
  }
};
