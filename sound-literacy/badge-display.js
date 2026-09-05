// 🏆 DigitalMindLab Badge Display System

const BadgeDisplay = {
  badges: [
    {
      id: 'sound-listener',
      icon: '🎵',
      name: 'Sound Listener',
      requirement: 'Complete Lesson 1-3',
      unlockAt: 3
    },
    {
      id: 'sound-explorer',
      icon: '🧠',
      name: 'Sound Explorer',
      requirement: 'Complete Lesson 1-6',
      unlockAt: 6
    },
    {
      id: 'sound-guardian',
      icon: '⚖️',
      name: 'Sound Guardian',
      requirement: 'Complete Lesson 1-9',
      unlockAt: 9
    },
    {
      id: 'responsible-creator',
      icon: '🏆',
      name: 'Responsible Sound Creator',
      requirement: 'Complete all 12 Lessons',
      unlockAt: 12
    }
  ],

  getUnlocked(completedLessons = []) {
    return this.badges.filter(badge => completedLessons.length >= badge.unlockAt);
  },

  render(completedLessons = []) {
    const unlocked = this.getUnlocked(completedLessons);

    return this.badges.map(badge => {
      const active = unlocked.some(item => item.id === badge.id);
      return `${badge.icon} ${badge.name} ${active ? '✅' : '🔒'}`;
    }).join('\n');
  }
};
