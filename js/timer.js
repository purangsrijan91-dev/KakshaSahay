/**
 * KakshaSahay - True Delta-Time Multigrade Clock Engine
 * Eliminates timer drift on budget Android Go devices during screen lock or background throttling.
 */
'use strict';

const TimerEngine = (() => {
  const DEFAULT_CYCLE_DURATION_SECONDS = 900; // 15-minute standard multigrade cycle
  const SYNC_TICK_INTERVAL_MS = 500;           // 500ms sync check prevents boundary clipping

  let intervalId = null;
  let startTime = null;
  let targetEndTime = null;
  let totalDurationSeconds = DEFAULT_CYCLE_DURATION_SECONDS;
  let onCycleCompleteCallback = null;

  function init(onCycleComplete) {
    onCycleCompleteCallback = onCycleComplete;

    // Listen for OS screen unlock or tab foregrounding to immediately resync delta
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          syncDeltaTick();
        }
      });
      window.addEventListener('focus', () => {
        syncDeltaTick();
      });
    }
  }

  function start(durationSeconds = DEFAULT_CYCLE_DURATION_SECONDS) {
    const now = Date.now();
    startTime = now;
    totalDurationSeconds = durationSeconds;
    targetEndTime = now + (durationSeconds * 1000);

    StateStore.setState({
      timerRunning: true,
      secondsRemaining: durationSeconds,
      startTime: startTime,
      targetEndTime: targetEndTime,
      totalCycleSeconds: durationSeconds
    });
    if (typeof StateStore.transitionFSM === 'function') {
      StateStore.transitionFSM('START_CYCLE');
    }

    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(syncDeltaTick, SYNC_TICK_INTERVAL_MS);
  }

  function pause() {
    const currentState = StateStore.getState();
    if (!currentState.timerRunning) return;

    // Calculate exact true remaining seconds via timestamp comparison (Date.now() - startTime)
    const now = Date.now();
    const elapsedSeconds = startTime ? Math.floor((now - startTime) / 1000) : 0;
    const remainingSeconds = Math.max(0, totalDurationSeconds - elapsedSeconds);

    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    startTime = null;
    targetEndTime = null;

    StateStore.setState({
      timerRunning: false,
      secondsRemaining: remainingSeconds,
      targetEndTime: null
    });
    if (typeof StateStore.transitionFSM === 'function') {
      StateStore.transitionFSM('PAUSE_CYCLE');
    }
  }

  function resume() {
    const currentState = StateStore.getState();
    start(currentState.secondsRemaining);
  }

  function toggle() {
    const currentState = StateStore.getState();
    if (currentState.timerRunning) {
      pause();
    } else {
      resume();
    }
  }

  function syncDeltaTick() {
    const currentState = StateStore.getState();
    if (!currentState.timerRunning || !startTime) return;

    // True Delta-Time Clock: Elapsed seconds calculated from timestamp difference (Date.now() - startTime)
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - startTime) / 1000);
    const remainingSecs = Math.max(0, totalDurationSeconds - elapsedSeconds);

    StateStore.setState({ secondsRemaining: remainingSecs });

    if (remainingSecs <= 0 || (targetEndTime && now >= targetEndTime)) {
      // 15-Minute Cycle Finished
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      startTime = null;
      targetEndTime = null;
      StateStore.setState({
        timerRunning: false,
        secondsRemaining: 0,
        targetEndTime: null
      });

      if (typeof onCycleCompleteCallback === 'function') {
        onCycleCompleteCallback();
      }
    }
  }

  function reset(newDurationSeconds = DEFAULT_CYCLE_DURATION_SECONDS) {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    targetEndTime = null;
    StateStore.setState({
      timerRunning: false,
      secondsRemaining: newDurationSeconds,
      targetEndTime: null,
      totalCycleSeconds: newDurationSeconds
    });
  }

  return {
    init,
    start,
    pause,
    resume,
    toggle,
    reset,
    syncDeltaTick
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TimerEngine };
}
