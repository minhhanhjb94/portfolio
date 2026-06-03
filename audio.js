// Owl Music Controller
// Uses YouTube IFrame API to play the requested music
// Default: muted. Owl icon toggles on/off with smooth fade.

class OwlMusicController {
  constructor() {
    this.isPlaying = false;
    this.player = null;
    this.fadeInterval = null;
    this.targetVolume = 25; // Low default volume (0-100)
    this.currentVolume = 0;
    this.ytReady = false;
    this.pendingPlay = false;
  }

  init() {
    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(tag, firstScript);

    // The API will call onYouTubeIframeAPIReady when ready
    window.onYouTubeIframeAPIReady = () => {
      this.createPlayer();
    };

    // Set up owl buttons (both mobile and desktop)
    const owlBtns = document.querySelectorAll('.owl-toggle');
    owlBtns.forEach(btn => {
      btn.addEventListener('click', () => this.toggle());
    });
  }

  createPlayer() {
    // Create the YT player in a hidden container
    const container = document.createElement('div');
    container.id = 'yt-music-player';
    container.style.cssText = 'position:absolute;top:-9999px;left:-9999px;width:1px;height:1px;';
    document.body.appendChild(container);

    this.player = new YT.Player('yt-music-player', {
      height: '1',
      width: '1',
      videoId: 'slxPFAJN9UM',
      playerVars: {
        autoplay: 0,
        loop: 1,
        playlist: 'slxPFAJN9UM',
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        start: 0
      },
      events: {
        onReady: () => {
          this.ytReady = true;
          this.player.setVolume(0);
          if (this.pendingPlay) {
            this.pendingPlay = false;
            this.start();
          }
        },
        onStateChange: (event) => {
          // If video ended, restart for loop
          if (event.data === YT.PlayerState.ENDED) {
            this.player.seekTo(0);
            this.player.playVideo();
          }
        }
      }
    });
  }

  start() {
    if (!this.ytReady) {
      this.pendingPlay = true;
      return;
    }

    this.isPlaying = true;
    this.player.playVideo();

    // Smooth fade in
    this.currentVolume = 0;
    this.player.setVolume(0);
    this.fadeIn();

    // Update owl UI
    const owlBtns = document.querySelectorAll('.owl-toggle');
    owlBtns.forEach(btn => btn.classList.add('playing'));
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    // Smooth fade out
    this.fadeOut(() => {
      if (!this.isPlaying && this.player) {
        this.player.pauseVideo();
      }
    });

    // Update owl UI
    const owlBtns = document.querySelectorAll('.owl-toggle');
    owlBtns.forEach(btn => btn.classList.remove('playing'));
  }

  fadeIn() {
    if (this.fadeInterval) clearInterval(this.fadeInterval);
    this.fadeInterval = setInterval(() => {
      if (this.currentVolume < this.targetVolume) {
        this.currentVolume = Math.min(this.currentVolume + 1, this.targetVolume);
        if (this.player && this.ytReady) {
          this.player.setVolume(this.currentVolume);
        }
      } else {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
      }
    }, 60); // ~1.5s fade
  }

  fadeOut(callback) {
    if (this.fadeInterval) clearInterval(this.fadeInterval);
    this.fadeInterval = setInterval(() => {
      if (this.currentVolume > 0) {
        this.currentVolume = Math.max(this.currentVolume - 1, 0);
        if (this.player && this.ytReady) {
          this.player.setVolume(this.currentVolume);
        }
      } else {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
        if (callback) callback();
      }
    }, 40); // ~1s fade out
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }
}

// Initialize
const owlMusic = new OwlMusicController();

window.addEventListener('DOMContentLoaded', () => {
  owlMusic.init();
});
