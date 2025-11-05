export function renderSignupForm(state) {
  return `
    <div class="signup-form">
      <p class="pixel-text" style="margin-bottom: 16px;">
        *crack crack*<br/>
        The egg is hatching!<br/>
        <br/>
        Help name your<br/>
        new companion!
      </p>
      
      <form id="signup-form">
        <div class="form-group">
          <label class="form-label">NAME</label>
          <input 
            type="text" 
            name="name" 
            class="form-input" 
            placeholder="Enter name..."
            maxlength="12"
            required
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">GENDER</label>
          <div class="gender-options">
            <button 
              type="button" 
              class="gender-button ${state.selectedGender === 'male' ? 'selected' : ''}" 
              data-gender="male"
            >
              ♂ MALE
            </button>
            <button 
              type="button" 
              class="gender-button ${state.selectedGender === 'female' ? 'selected' : ''}" 
              data-gender="female"
            >
              ♀ FEMALE
            </button>
            <button 
              type="button" 
              class="gender-button ${state.selectedGender === 'neutral' ? 'selected' : ''}" 
              data-gender="neutral"
            >
              ⚪ OTHER
            </button>
          </div>
        </div>
        
        <button type="submit" class="hatch-button" style="width: 100%; margin-top: 8px;">
          COMPLETE HATCH
        </button>
      </form>
    </div>
  `;
}
