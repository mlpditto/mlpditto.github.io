// 🎧 DigitalMindLab Lesson Engine v1
// Dynamic lesson loading + progress foundation

const LessonEngine = {
  progressKey: 'sound-literacy-progress',

  async loadLesson(lesson){
    const response = await fetch(lesson.file);
    if(!response.ok) throw new Error('Lesson file not found');
    return await response.text();
  },

  renderProgress(current,total){
    const percent = Math.round((current/total)*100);
    return `Progress ${current}/${total} (${percent}%)`;
  },

  completeLesson(id){
    let progress = JSON.parse(localStorage.getItem(this.progressKey) || '[]');
    if(!progress.includes(id)){
      progress.push(id);
      localStorage.setItem(this.progressKey, JSON.stringify(progress));
    }
    return progress;
  },

  getProgress(){
    return JSON.parse(localStorage.getItem(this.progressKey) || '[]');
  }
};
