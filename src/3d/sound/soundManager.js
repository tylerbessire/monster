export class SoundManager {
  constructor() {
    this.enabled = true;
    this.sounds = {};
  }
  load(name, url) {
    const a = new Audio(url);
    a.preload = 'auto';
    this.sounds[name] = a;
  }
  play(name, volume = 0.8) {
    if (!this.enabled || !this.sounds[name]) return;
    const a = this.sounds[name].cloneNode();
    a.volume = volume;
    a.play();
  }
}
