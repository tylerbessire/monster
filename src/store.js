export function createStore() {
  let state = {
    stage: 'egg', // egg, signup, companion
    eggShaking: false,
    selectedGender: null,
    companion: null,
    messages: [],
    currentTime: Date.now(),
    theme: 'classic' // classic, ocean, sunset, forest, candy
  };
  
  const listeners = new Set();
  
  return {
    getState: () => state,
    setState: (newState) => {
      state = { ...state, ...newState };
      listeners.forEach(listener => listener(state));
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}
