import { UIManager } from './ui.js';
import { SearchManager } from './search.js';
import { StorageManager } from './storage.js';
import { ValidationManager } from './validation.js';

export class FindlyWeb {
  static #API_BASE_URL = 'http://127.0.0.1:8000';
  static #SEARCH_ENDPOINT = '/api/search';
  static #MARKETPLACES = ['MMG', 'Onliner', 'Kufar', '21vek'];
  static #DEFAULT_MAX_SIZE = 20;
  static #SEARCH_TIMEOUT = 20000;
  static #MAX_EXCLUDE_WORDS = 5;
  static #QUERY_VALIDATION_REGEX = /^[a-zA-Zа-яА-Я0-9- ]*$/;
  static #EXCLUDE_WORD_VALIDATION_REGEX = /^[a-zA-Zа-яА-Я0-9]*$/;

  #apiBaseUrl = FindlyWeb.#API_BASE_URL;
  #searchEndpoint = FindlyWeb.#SEARCH_ENDPOINT;
  #marketplaces = FindlyWeb.#MARKETPLACES;

  #toastTimeoutId = null;
  #currentQuery = '';
  #currentMarketplace = 'MMG';
  #searchResults = {};
  #maxSize = FindlyWeb.#DEFAULT_MAX_SIZE;
  #filters = {
    onlyNew: false,
    nameFilter: false,
    priceFilter: false,
    excludeWords: [],
  };

  #elements = {};

  // Модули
  #ui;
  #search;
  #storage;
  #validation;

  constructor() {
    this.#initModules();
    this.#storage.loadStateFromLocalStorage();
    this.#ui.initElements();
    this.#ui.syncUiWithState();
    this.#ui.bindEvents();
    this.#ui.animateTitle();
  }

  #initModules() {
    this.#ui = new UIManager(this);
    this.#search = new SearchManager(this);
    this.#storage = new StorageManager(this);
    this.#validation = new ValidationManager(this);
  }

  // Геттеры для доступа к приватным свойствам
  get apiBaseUrl() { return this.#apiBaseUrl; }
  get searchEndpoint() { return this.#searchEndpoint; }
  get marketplaces() { return this.#marketplaces; }
  get currentQuery() { return this.#currentQuery; }
  get currentMarketplace() { return this.#currentMarketplace; }
  get searchResults() { return this.#searchResults; }
  get maxSize() { return this.#maxSize; }
  get filters() { return this.#filters; }
  get elements() { return this.#elements; }
  get toastTimeoutId() { return this.#toastTimeoutId; }

  // Сеттеры для изменения приватных свойств
  set currentQuery(value) { this.#currentQuery = value; }
  set currentMarketplace(value) { this.#currentMarketplace = value; }
  set searchResults(value) { this.#searchResults = value; }
  set maxSize(value) { this.#maxSize = value; }
  set filters(value) { this.#filters = value; }
  set toastTimeoutId(value) { this.#toastTimeoutId = value; }

  // Геттеры для модулей
  get ui() { return this.#ui; }
  get search() { return this.#search; }
  get storage() { return this.#storage; }
  get validation() { return this.#validation; }

  // Статические геттеры для констант
  static get API_BASE_URL() { return FindlyWeb.#API_BASE_URL; }
  static get SEARCH_ENDPOINT() { return FindlyWeb.#SEARCH_ENDPOINT; }
  static get MARKETPLACES() { return FindlyWeb.#MARKETPLACES; }
  static get DEFAULT_MAX_SIZE() { return FindlyWeb.#DEFAULT_MAX_SIZE; }
  static get SEARCH_TIMEOUT() { return FindlyWeb.#SEARCH_TIMEOUT; }
  static get MAX_EXCLUDE_WORDS() { return FindlyWeb.#MAX_EXCLUDE_WORDS; }
  static get QUERY_VALIDATION_REGEX() { return FindlyWeb.#QUERY_VALIDATION_REGEX; }
  static get EXCLUDE_WORD_VALIDATION_REGEX() { return FindlyWeb.#EXCLUDE_WORD_VALIDATION_REGEX; }

  // Публичные методы для совместимости
  performSearch(query) {
    return this.#search.performSearch(query);
  }

  handleSearchSubmit(event, inputElement) {
    return this.#search.handleSearchSubmit(event, inputElement);
  }

  saveStateToLocalStorage() {
    return this.#storage.saveStateToLocalStorage();
  }

  loadStateFromLocalStorage() {
    return this.#storage.loadStateFromLocalStorage();
  }

  addExcludeWord() {
    return this.#storage.addExcludeWord();
  }

  removeExcludeWord(word) {
    return this.#storage.removeExcludeWord(word);
  }

  switchMarketplace(marketplace) {
    return this.#ui.switchMarketplace(marketplace);
  }

  renderExcludeWords() {
    return this.#ui.renderExcludeWords();
  }
} 