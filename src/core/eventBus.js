/*
 * EventBus - Pub/Sub minimale per comunicazione tra moduli
 */
(function() {
  'use strict';

  const listeners = new Map(); // event -> Set(callback)

  function on(event, cb) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(cb);
    return () => off(event, cb); // unsubscribe
  }

  function off(event, cb) {
    const set = listeners.get(event);
    if (set) set.delete(cb);
  }

  function emit(event, payload) {
    const set = listeners.get(event);
    if (!set) return;
    for (const cb of set) {
      try { cb(payload); } catch (e) { console.error(`[EventBus] listener error for ${event}:`, e); }
    }
  }

  window.EventBus = { on, off, emit };
})();
