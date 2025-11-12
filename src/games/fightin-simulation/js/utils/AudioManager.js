/**
 * AudioManager - Gestione audio e musica
 */

class AudioManager {
    constructor() {
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
        this.currentMusic = null;
        this.sounds = new Map();
    }
    
    playMusic(path, loop = true) {
        if (this.currentMusic) {
            this.currentMusic.pause();
        }
        
        const audio = new Audio(path);
        audio.volume = this.musicVolume;
        audio.loop = loop;
        audio.play().catch(err => console.error('Error playing music:', err));
        
        this.currentMusic = audio;
    }
    
    playSound(path, volume = null) {
        const audio = new Audio(path);
        audio.volume = volume !== null ? volume : this.sfxVolume;
        audio.play().catch(err => console.error('Error playing sound:', err));
        
        return audio;
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.currentMusic) {
            this.currentMusic.volume = this.musicVolume;
        }
    }
    
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }
}

