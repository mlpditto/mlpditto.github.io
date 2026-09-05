// 🎧 DigitalMindLab Lesson Engine v4
// Dynamic lesson loading + progress + unlock + section tracking + badges

const LessonEngine = {
  progressKey: 'sound-literacy-progress',
  sectionKey: 'sound-literacy-section-progress',
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
    return `📚 Course Progress ${current}/${total} (${percent}%)\n${'█'.repeat(bars)}${'░'.repeat(10-bars)}`;
  },

  renderSectionProgress(section,current,total){
    const percent = Math.round((current/total)*100);
    const bars = Math.round(percent/10);
    return `📖 ${section}: ${percent}%\n${'█'.repeat(bars)}${'░'.repeat(10-bars)}`;
  },

  completeSection(lessonId, sectionId){
    let data = JSON.parse(localStorage.getItem(this.sectionKey) || '{}');
    if(!data[lessonId]) data[lessonId] = [];
    if(!data[lessonId].includes(sectionId)){
      data[lessonId].push(sectionId);
      localStorage.setItem(this.sectionKey, JSON.stringify(data));
    }
    return data[lessonId];
  },

  getSectionProgress(lessonId){
    const data = JSON.parse(localStorage.getItem(this.sectionKey) || '{}');
    return data[lessonId] || [];
  },

  completeLesson(id){
    let progress = this.getProgress();

    if(!progress.includes(id)){
      progress.push(id);
      localStorage.setItem(this.progressKey, JSON.stringify(progress));
      this.addXP(50);

      if(typeof BadgeSystem !== 'undefined'){
        BadgeSystem.check(progress);
      }
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
