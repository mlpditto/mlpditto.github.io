// 🏆 DigitalMindLab Badge System

const BadgeSystem = {
  badges: [
    {
      id: 'sound-listener',
      name: '🎵 Sound Listener',
      description: 'Complete Lesson 1-3',
      requirement: 3
    },
    {
      id: 'sound-explorer',
      name: '🧠 Sound Explorer',
      description: 'Complete Lesson 1-6',
      requirement: 6
    },
    {
      id: 'sound-guardian',
      name: '⚖️ Sound Guardian',
      description: 'Complete Lesson 1-9',
      requirement: 9
    },
    {
      id: 'responsible-creator',
      name: '🏆 Responsible Sound Creator',
      description: 'Complete all 12 Lessons',
      requirement: 12
    }
  ],

  key: 'sound-literacy-badges',

  getUnlocked(){
    return JSON.parse(localStorage.getItem(this.key) || '[]');
  },

  check(progress){
    let unlocked = this.getUnlocked();

    this.badges.forEach(badge => {
      if(progress.length >= badge.requirement && !unlocked.includes(badge.id)){
        unlocked.push(badge.id);
        alert(`🏆 Badge Unlocked!\n${badge.name}`);
      }
    });

    localStorage.setItem(this.key, JSON.stringify(unlocked));
    return unlocked;
  }
};
