// Simple sound utility
// In a real app, you would use a library like use-sound or Howler.js

export const playSound = (type: 'click' | 'win' | 'lose' | 'pop' | 'coin') => {
  const sounds = {
    click: '/sounds/click.mp3',
    win: '/sounds/win.mp3',
    lose: '/sounds/lose.mp3',
    pop: '/sounds/pop.mp3',
    coin: '/sounds/coin.mp3',
  }

  const audio = new Audio(sounds[type])
  audio.volume = 0.5
  audio.play().catch(e => console.log('Audio play failed', e))
}
