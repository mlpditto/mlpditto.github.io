// Audio Player System - Sound Literacy Academy

function createAudioPlayer(config) {
  const container = document.createElement('div');
  container.className = 'audio-player-card';

  container.innerHTML = `
    <div class="audio-title">🎧 ${config.title || 'Sound Lab'}</div>
    <div class="audio-description">${config.description || ''}</div>
    <audio controls preload="metadata">
      <source src="${config.src}" type="audio/mpeg">
      Your browser does not support audio playback.
    </audio>
  `;

  return container;
}

function renderAudioBlock(containerId, config) {
  const target = document.getElementById(containerId);
  if (!target) return;
  target.appendChild(createAudioPlayer(config));
}

// Example:
// renderAudioBlock('audio-demo', {
//   title:'Human Voice vs AI Voice',
//   description:'ลองฟังและเปรียบเทียบลักษณะเสียง',
//   src:'./audio/human-vs-ai.mp3'
// });
