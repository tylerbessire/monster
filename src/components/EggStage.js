export function renderEggStage(state) {
  return `
    <div class="egg-container">
      <div class="egg ${state.eggShaking ? 'shaking' : ''}">
        <div class="egg-pixel">
          <div class="crack crack-1 ${state.eggShaking ? 'visible' : ''}"></div>
          <div class="crack crack-2 ${state.eggShaking ? 'visible' : ''}"></div>
          <div class="crack crack-3 ${state.eggShaking ? 'visible' : ''}"></div>
        </div>
      </div>
      <p class="pixel-text">
        A mysterious egg<br/>
        appears before you...<br/>
        <br/>
        What will hatch?
      </p>
      <button class="hatch-button" data-action="hatch">
        HATCH EGG
      </button>
    </div>
  `;
}
