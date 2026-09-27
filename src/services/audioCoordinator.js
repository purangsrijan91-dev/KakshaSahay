/**
 * KakshaSahay - Audio Coordinator Service
 * Manages client-side Web Audio acoustic bell chimes, Web Speech API synthesis,
 * same-tab cancellation, Page Visibility API listening, and cross-tab BroadcastChannel sync.
 */
'use strict';

const AudioCoordinator = (() => {
  let audioCtx = null;
  let broadcastChannel = null;
  const instanceId = 'tab_' + Math.random().toString(36).substring(2, 9);

  // Initialize Cross-Tab Broadcast Channel
  if (typeof window !== 'undefined' && typeof window.BroadcastChannel !== 'undefined') {
    try {
      broadcastChannel = new window.BroadcastChannel('kakshasahay_speech_channel');
      broadcastChannel.onmessage = (event) => {
        if (!event || !event.data) return;
        if (event.data.type === 'SPEECH_STARTED' && event.data.senderId !== instanceId) {
          // Another tab began speaking - cancel local speech to prevent cross-tab overlap
          cancelSpeechInternal(/* broadcast */ false);
        } else if (event.data.type === 'CANCEL_SPEECH' && event.data.senderId !== instanceId) {
          cancelSpeechInternal(/* broadcast */ false);
        }
      };
    } catch (_e) {
      // BroadcastChannel unavailable or blocked in sandboxed iframe
    }
  }

  // Page Visibility API: Stop speech immediately if user switches away from the tab
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelSpeechInternal(/* broadcast */ true);
      }
    });
  }

  function getAudioContext() {
    if (typeof window === 'undefined') return null;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  /**
   * Internal cancellation helper
   * @param {boolean} shouldBroadcast 
   */
  function cancelSpeechInternal(shouldBroadcast = true) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_e) {}
    }

    if (shouldBroadcast && broadcastChannel) {
      try {
        broadcastChannel.postMessage({
          type: 'CANCEL_SPEECH',
          senderId: instanceId,
          timestamp: Date.now()
        });
      } catch (_e) {}
    }
  }

  /**
   * Public cancelSpeech method
   */
  function cancelSpeech() {
    cancelSpeechInternal(true);
  }

  /**
   * Synthesizes speech with defensive error boundaries and cross-tab suppression
   * @param {string} text - Text to speak
   * @param {string} [lang='hi-IN'] - Language code
   * @param {Function} [onEnd] - Callback when speech ends
   * @returns {boolean} Whether speech was initiated
   */
  function speak(text, lang = 'hi-IN', onEnd = null) {
    if (!text || typeof text !== 'string') return false;

    // Announce to accessibility screen readers
    if (typeof document !== 'undefined') {
      try {
        const announcer = document.getElementById('sr-announcer');
        if (announcer) {
          announcer.textContent = text;
        }
      } catch (_e) {}
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return false;
    }

    try {
      // Cancel any ongoing speech locally
      cancelSpeechInternal(false);

      // Notify peer tabs to suppress overlapping speech
      if (broadcastChannel) {
        try {
          broadcastChannel.postMessage({
            type: 'SPEECH_STARTED',
            senderId: instanceId,
            timestamp: Date.now()
          });
        } catch (_e) {}
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9;

      // Select Hindi voice if available
      try {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          const match = voices.find(v => 
            v.lang === lang || 
            v.lang.startsWith(lang.split('-')[0]) || 
            v.name.toLowerCase().includes('hindi')
          );
          if (match) {
            utterance.voice = match;
          }
        }
      } catch (_e) {}

      if (typeof onEnd === 'function') {
        utterance.onend = onEnd;
        utterance.onerror = onEnd;
      }

      window.speechSynthesis.speak(utterance);
      return true;
    } catch (err) {
      console.warn('[AudioCoordinator] Speech execution error:', err);
      if (typeof onEnd === 'function') onEnd();
      return false;
    }
  }

  /**
   * Plays zero-network client-side dual-tone acoustic bell chime
   * @param {number} [freq1=587.33] - First harmonic frequency (D5)
   * @param {number} [freq2=880] - Second harmonic frequency (A5)
   * @param {number} [duration=0.8] - Tone duration in seconds
   * @returns {boolean} Whether audio played successfully
   */
  function playAcousticBell(freq1 = 587.33, freq2 = 880, duration = 0.8) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return false;

      const now = ctx.currentTime;
      const frequencies = [freq1, freq2];

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.18, now + (idx * 0.08));
        gain.gain.exponentialRampToValueAtTime(0.001, now + (idx * 0.08) + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + (idx * 0.08));
        osc.stop(now + (idx * 0.08) + duration + 0.1);
      });

      return true;
    } catch (e) {
      console.warn('[AudioCoordinator] Web Audio playback failed:', e);
      return false;
    }
  }

  return {
    speak,
    cancelSpeech,
    playAcousticBell,
    getInstanceId: () => instanceId
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioCoordinator;
}
if (typeof window !== 'undefined') {
  window.AudioCoordinator = AudioCoordinator;
}
