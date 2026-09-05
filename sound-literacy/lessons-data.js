const SOUND_WORLDS = [
  {
    title:'World 1: Sound Literacy',
    lessons:[
      {id:1,code:'Lesson 01',title:'Sound คืออะไร?',file:'lessons/lesson-01-sound-basics.md'},
      {id:2,code:'Lesson 02',title:'Sound Design',file:'lessons/lesson-02-sound-design.md'},
      {id:3,code:'Lesson 03',title:'Critical Listening',file:'lessons/lesson-03-critical-listening.md'}
    ]
  },
  {
    title:'World 2: Sound Psychology',
    lessons:[
      {id:4,code:'Lesson 04',title:'Sound & Emotion',file:'lessons/lesson-04-sound-emotion.md'},
      {id:5,code:'Lesson 05',title:'Sound & Memory + Brand',file:'lessons/lesson-05-sound-memory.md'},
      {id:6,code:'Lesson 06',title:'Sound & Behavior',file:'lessons/lesson-06-sound-behavior.md'}
    ]
  },
  {
    title:'World 3: Sound Ethics',
    lessons:[
      {id:7,code:'Lesson 07',title:'Persuasion vs Manipulation',file:'lessons/lesson-07-persuasion.md'},
      {id:8,code:'Lesson 08',title:'AI Voice & Deepfake Voice',file:'lessons/lesson-08-ai-voice.md'},
      {id:9,code:'Lesson 09',title:'Sound Ethics',file:'lessons/lesson-09-sound-ethics.md'}
    ]
  },
  {
    title:'World 4: Copyright & Responsibility',
    lessons:[
      {id:10,code:'Lesson 10',title:'Copyright & Audio Rights',file:'lessons/lesson-10-copyright.md'},
      {id:11,code:'Lesson 11',title:'AI License & Platform',file:'lessons/lesson-11-ai-license.md'},
      {id:12,code:'Lesson 12',title:'Responsible Sound Creator',file:'lessons/lesson-12-responsibility.md'}
    ]
  }
];

const lessons = SOUND_WORLDS;

if(document.getElementById('map')){
 document.getElementById('map').innerHTML = SOUND_WORLDS.map(w=>
 `<section class="world"><h2>🎮 ${w.title}</h2>${w.lessons.map(l=>
 `<div class="lesson">🔊 <a href="lesson-viewer.html?id=${l.id}">${l.code}: ${l.title}</a></div>`).join('')}</section>`
 ).join('');
}