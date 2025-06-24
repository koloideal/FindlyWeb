export class SearchManager {
  constructor(app) {
    this.app = app
  }

  async performSearch(query) {
    const startTime = performance.now()
    this.app.currentQuery = query

    this.app.ui.showResultsPage()
    this.app.elements['results-page']?.scrollIntoView({ behavior: 'smooth', block: 'start' })

    this.app.ui.showLoading()
    this.app.ui.hideError()
    this.app.ui.hideResults()

    this.app.elements['search-input'].value = query
    this.app.elements['results-search-input'].value = query

    try {
      const results = await this.fetchSearchResults(query)
      const searchDuration = performance.now() - startTime

      this.app.ui.displaySearchTime(searchDuration)
      this.app.ui.displaySearchTags()
      this.app.searchResults = results
      this.app.ui.displayResults(results)
    } catch (error) {
      console.error('Search error:', error)
      let errorMessage = 'Error while searching'
      if (error.name === 'AbortError') {
        errorMessage = 'Timeout'
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = `Unable to connect to the server at ${this.app.apiBaseUrl}`
      }
      this.app.ui.showError(errorMessage)
    } finally {
      this.app.elements['main-search-button'].disabled = false
      this.app.elements['second-search-button'].disabled = false
      this.app.ui.hideLoading()
    }
  }

  async fetchSearchResults(query) {
    const url = new URL(this.app.apiBaseUrl + this.app.searchEndpoint)

    const payload = {
        query: query,
        max_size: {
            size: this.app.maxSize,
            max_or_min_cut: 'min'
        },
        exclude_marketplaces: this.app.filters.excludedMarketplaces,
        filters: {
            only_new: this.app.filters.onlyNew,
            name_filter: this.app.filters.nameFilter,
            price_filter: {
                is_enabled: this.app.filters.priceFilter
            },
            exclude_words: this.app.filters.excludeWords
        }
    };

    if (this.app.filters.priceFilter) {
        payload.filters.price_filter.tolerance = this.app.filters.tolerance;
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.app.constructor.SEARCH_TIMEOUT)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } finally {
      clearTimeout(timeoutId)
    }
  }

  handleSearchSubmit(event, inputElement) {
    event.preventDefault()
    const query = inputElement.value.trim()

    const validation = this.app.validation.validateQuery(query)
    if (!validation.isValid) {
      this.app.ui.showToast(validation.message, validation.message.length > 50 ? 4000 : 2000)
      return
    }

    this.app.elements['main-search-button'].disabled = true
    this.app.elements['second-search-button'].disabled = true
    this.app.elements['search-time']?.classList.add('hidden')
    this.app.elements['search-tags']?.classList.add('hidden')
    this.performSearch(query)
  }
} 