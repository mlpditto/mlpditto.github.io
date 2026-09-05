// 🎧 DigitalMindLab Lesson Engine v2
// Dynamic lesson loading + progress + unlock foundation

const LessonEngine = {
  progressKey: 'sound-literacy-progress',
  xpKey: 'sound-literacy-xp',
  totalLessons: 12,

  async loadLesson(lesson){
    const response = await fetch(lesson.file);
    if(!response.ok) throw new Error('Lesson file not found');
    return await response.text();
  },

  renderProgress(current,total){
    const percent = Math.round((current/total)*100);
    const bars = Math.round(percent/10);
    return `📚 Progress ${current}/${total} (${percent}%)\n${'█'.repeat(bars)}${'░'.repeat(10-bars)}`;
  },

  completeLesson(id){
    let progress = this.getProgress();

    if(!progress.includes(id)){
      progress.push(id);
      localStorage.setItem(this.progressKey, JSON.stringify(progress));
      this.addXP(50);
    }

    return progress;
  },

  getProgress(){
    return JSON.parse(localStorage.getItem(this.progressKey) || '[]');
  },

  isUnlocked(id){
    if(id===1) return true;
    return this.getProgress().includes(id-1);
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
