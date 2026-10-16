(() => {
  function createMathStoryMode({
    stage,
    slides,
    storyboards,
    getCurrent,
    getBuildLevel,
    setSlideBuild,
    advanceSlide,
    isQuestion
  }) {
    const playButton = document.getElementById('storyPlay');
    const speedControl = document.getElementById('storySpeed');
    const caption = document.getElementById('storyCaption');
    const track = stage.querySelector('.slide-track');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer = 0;
    let playing = false;
    let waitingForAnswer = false;
    const answeredQuestions = new WeakSet();

    function updateCaption() {
      const index = getCurrent();
      const slide = slides[index];
      if (waitingForAnswer) {
        caption.textContent = 'Your turn — answer correctly to continue';
      } else {
        const storyboard = storyboards[slide.dataset.title];
        const level = Math.max(1, getBuildLevel(index));
        caption.textContent = storyboard?.builds?.[level - 1]
          || slide.dataset.title
          || `Slide ${index + 1}`;
      }
      caption.hidden = !playing;
    }

    function duration() {
      return 2800 / Number(speedControl.value);
    }

    function clearTimer() {
      if (timer) window.clearTimeout(timer);
      timer = 0;
    }

    function schedule() {
      clearTimer();
      if (!playing || waitingForAnswer) return;
      timer = window.setTimeout(advanceBeat, duration());
    }

    function pauseAtQuestion() {
      const index = getCurrent();
      if (!isQuestion(index) || answeredQuestions.has(slides[index])) return false;
      waitingForAnswer = true;
      clearTimer();
      updateCaption();
      return true;
    }

    function advanceBeat() {
      timer = 0;
      if (!playing || pauseAtQuestion()) return;
      const index = getCurrent();
      const level = getBuildLevel(index);
      const scene = slides[index].querySelector('.story-scene[data-max-build]');
      const max = scene ? Number(scene.dataset.maxBuild) : 0;
      if (scene && level < max) {
        setSlideBuild(index, level + 1);
        updateCaption();
        schedule();
        return;
      }
      advanceSlide();
      if (pauseAtQuestion()) return;
      updateCaption();
      schedule();
    }

    function start() {
      if (reducedMotion.matches) return;
      if (playing) {
        stop();
        return;
      }
      playing = true;
      waitingForAnswer = false;
      stage.classList.add('story-priming');
      stage.classList.add('story-playing');
      track.getBoundingClientRect();
      window.requestAnimationFrame(() => stage.classList.remove('story-priming'));
      playButton.textContent = playing ? '\u25a0 Stop story' : '\u25b6 Play story';
      playButton.setAttribute('aria-label', playing ? 'Stop story mode' : 'Play story mode');
      playButton.setAttribute('aria-pressed', 'true');
      updateCaption();
      if (!pauseAtQuestion()) schedule();
    }

    function stop() {
      playing = false;
      waitingForAnswer = false;
      clearTimer();
      stage.classList.remove('story-priming');
      stage.classList.remove('story-playing');
      playButton.textContent = playing ? '\u25a0 Stop story' : '\u25b6 Play story';
      playButton.setAttribute('aria-label', playing ? 'Stop story mode' : 'Play story mode');
      playButton.setAttribute('aria-pressed', 'false');
      caption.hidden = true;
    }

    function answerCorrect() {
      answeredQuestions.add(slides[getCurrent()]);
      if (!playing || !waitingForAnswer) return;
      waitingForAnswer = false;
      updateCaption();
      schedule();
    }

    function answerChanged(slide) {
      answeredQuestions.delete(slide);
    }

    function syncReducedMotion() {
      playButton.disabled = reducedMotion.matches;
      playButton.title = reducedMotion.matches
        ? '\u0e1b\u0e34\u0e14\u0e43\u0e0a\u0e49\u0e07\u0e32\u0e19\u0e40\u0e21\u0e37\u0e48\u0e2d\u0e40\u0e1b\u0e34\u0e14\u0e01\u0e32\u0e23\u0e25\u0e14\u0e01\u0e32\u0e23\u0e40\u0e04\u0e25\u0e37\u0e48\u0e2d\u0e19\u0e44\u0e2b\u0e27'
        : playing ? '\u0e2b\u0e22\u0e38\u0e14\u0e01\u0e32\u0e23\u0e0a\u0e21\u0e15\u0e48\u0e2d\u0e40\u0e19\u0e37\u0e48\u0e2d\u0e07' : '\u0e40\u0e23\u0e34\u0e48\u0e21\u0e0a\u0e21\u0e41\u0e1a\u0e1a\u0e15\u0e48\u0e2d\u0e40\u0e19\u0e37\u0e48\u0e2d\u0e07\u0e2d\u0e31\u0e15\u0e42\u0e19\u0e21\u0e31\u0e15\u0e34';
      if (reducedMotion.matches) stop();
    }

    playButton.addEventListener('click', start);
    speedControl.addEventListener('change', () => {
      if (playing && !waitingForAnswer) schedule();
    });
    reducedMotion.addEventListener('change', syncReducedMotion);
    syncReducedMotion();

    return {
      stop,
      answerCorrect,
      answerChanged,
      get playing() {
        return playing;
      }
    };
  }

  window.createMathStoryMode = createMathStoryMode;
})();
