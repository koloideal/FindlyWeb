export class StorageManager {
  constructor(app) {
    this.app = app;
  }

  saveStateToLocalStorage() {
    const state = {
      maxSize: this.app.maxSize,
      filters: this.app.filters,
    };
    localStorage.setItem('findlyAppState', JSON.stringify(state));
  }

  loadStateFromLocalStorage() {
    const savedStateJSON = localStorage.getItem('findlyAppState');
    if (savedStateJSON) {
      const savedState = JSON.parse(savedStateJSON);
      this.app.maxSize = savedState.maxSize ?? this.app.constructor.DEFAULT_MAX_SIZE;
      const defaultFilters = {
            onlyNew: false,
            nameFilter: false,
            priceFilter: false,
            tolerance: 0.25,
            excludeWords: [],
            excludedMarketplaces: []
        };
      this.app.filters = { ...defaultFilters, ...(savedState.filters || {}) };
      }
    }


  addExcludeWord() {
    const input = this.app.elements['exclude-word-input'];
    const word = input.value.trim();
    
    const validation = this.app.validation.validateExcludeWord(word);
    if (!validation.isValid) {
      this.app.ui.showToast(validation.message, 1500);
      return;
    }

    this.app.filters.excludeWords.push(word);
    this.app.ui.renderExcludeWords();
    this.saveStateToLocalStorage();
    input.value = '';
  }

  removeExcludeWord(word) {
    this.app.filters.excludeWords = this.app.filters.excludeWords.filter(w => w !== word);
    this.app.ui.renderExcludeWords();
    this.saveStateToLocalStorage();
  }
} 