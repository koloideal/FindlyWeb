export class UIManager {
    constructor(app) {
        this.app = app;
    }

    initElements() {
        const ids = [
            'settings-button', 'settings-menu', 'home-page', 'results-page',
            'toast-notification', 'search-form', 'search-input', 'results-search-form',
            'results-search-input', 'loading-indicator', 'error-message', 'error-text',
            'marketplace-tabs', 'search-results', 'no-results', 'exclude-word-input',
            'add-exclude-word', 'exclude-words-list', 'max-size-select', 'main-search-button',
            'second-search-button', 'search-time', 'search-tags',
            'price-filter-checkbox', 'tolerance-section', 'tolerance-slider', 'tolerance-value',
            'marketplace-excludes-container'
        ];
        ids.forEach(id => {
            this.app.elements[id] = document.getElementById(id);
        });

        this.app.elements.filterCheckboxes = document.querySelectorAll('#settings-menu .filter-checkbox');
        this.app.elements.tabButtons = document.querySelectorAll('.tab-button');
        this.app.elements.resultsLogo = document.querySelector('.results-logo');
        this.app.elements.closeSettingsBtn = document.getElementById('close-settings-btn')
    }

    bindEvents() {
        this.app.elements['settings-button']?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.app.elements['settings-menu'].classList.toggle('hidden');
        });
        this.app.elements.closeSettingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.app.elements['settings-menu'].classList.toggle('hidden');
        });
        document.addEventListener('click', (e) => {
            if (!this.app.elements['settings-menu']?.contains(e.target) && e.target !== this.app.elements['settings-button']) {
                this.app.elements['settings-menu']?.classList.add('hidden');
            }
        });

        this.app.elements.filterCheckboxes?.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const filterName = e.target.dataset.filter;
                this.app.filters[filterName] = e.target.checked;

                if (filterName === 'priceFilter') {
                    this.updateToleranceVisibility();
                }

                this.app.storage.saveStateToLocalStorage();
            });
        });

        // Слайдер Tolerance
        this.app.elements['tolerance-slider']?.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.app.filters.tolerance = value;
            this.app.elements['tolerance-value'].textContent = value.toFixed(2);
        });
        this.app.elements['tolerance-slider']?.addEventListener('change', () => {
             this.app.storage.saveStateToLocalStorage();
        });

        // Чекбоксы исключения маркетплейсов (с делегированием событий)
        this.app.elements['marketplace-excludes-container']?.addEventListener('change', (e) => {
            if (e.target.matches('.marketplace-exclude-checkbox')) {
                const marketplace = e.target.dataset.marketplace;
                if (e.target.checked) {
                    if (!this.app.filters.excludedMarketplaces.includes(marketplace)) {
                        this.app.filters.excludedMarketplaces.push(marketplace);
                    }
                } else {
                    this.app.filters.excludedMarketplaces = this.app.filters.excludedMarketplaces.filter(m => m !== marketplace);
                }
                this.app.storage.saveStateToLocalStorage();
            }
        });

        // Остальные события
        this.app.elements['max-size-select']?.addEventListener('change', (e) => {
            this.app.maxSize = parseInt(e.target.value, 10);
            this.app.storage.saveStateToLocalStorage();
        });

        const mainInput = this.app.elements['search-input'];
        const resultsInput = this.app.elements['results-search-input'];
        if (mainInput && resultsInput) {
            mainInput.addEventListener('input', () => { this.syncSearchInputs(mainInput, resultsInput); });
            resultsInput.addEventListener('input', () => { this.syncSearchInputs(resultsInput, mainInput); });
        }

        this.app.elements['add-exclude-word']?.addEventListener('click', () => this.app.storage.addExcludeWord());
        this.app.elements['exclude-word-input']?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); this.app.storage.addExcludeWord(); }
        });
        this.app.elements['exclude-words-list']?.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                e.stopPropagation();
                this.app.storage.removeExcludeWord(e.target.dataset.word);
            }
        });

        this.app.elements['search-form']?.addEventListener('submit', (e) => this.app.search.handleSearchSubmit(e, this.app.elements['search-input']));
        this.app.elements['results-search-form']?.addEventListener('submit', (e) => this.app.search.handleSearchSubmit(e, this.app.elements['results-search-input']));
        this.app.elements.tabButtons?.forEach(button => {
            button.addEventListener('click', () => { this.switchMarketplace(button.dataset.marketplace); });
        });
        this.app.elements.resultsLogo?.addEventListener('click', () => {
            this.app.elements['home-page'].scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Синхронизация UI при загрузке
    syncUiWithState() {
        this.app.elements.filterCheckboxes.forEach(cb => {
            cb.checked = this.app.filters[cb.dataset.filter];
        });

        if(this.app.elements['tolerance-slider']) {
            this.app.elements['tolerance-slider'].value = this.app.filters.tolerance;
            this.app.elements['tolerance-value'].textContent = this.app.filters.tolerance.toFixed(2);
        }
        this.updateToleranceVisibility();

        this.renderExcludeWords();
        this.renderMarketplaceExcludes();
        if (this.app.elements['max-size-select']) {
            this.app.elements['max-size-select'].value = this.app.maxSize;
        }
    }

    updateToleranceVisibility() {
        const isPriceFilterEnabled = this.app.filters.priceFilter;
        this.app.elements['tolerance-section']?.classList.toggle('hidden', !isPriceFilterEnabled);
    }

    renderMarketplaceExcludes() {
        const container = this.app.elements['marketplace-excludes-container'];
        if (!container) return;
        container.innerHTML = '';
        this.app.marketplaces.forEach(mp => {
            const isChecked = this.app.filters.excludedMarketplaces.includes(mp);
            const label = document.createElement('label');
            label.innerHTML = `
                <input type="checkbox" class="marketplace-exclude-checkbox filter-checkbox" data-marketplace="${mp}" ${isChecked ? 'checked' : ''}>
                ${mp}
            `;
            container.appendChild(label);
        });
    }

    syncSearchInputs(source, target) { target.value = source.value; }
    animateTitle() {
        const title = this.app.elements['home-page']?.querySelector('h1');
        if (!title) return;
        const text = title.innerText.trim();
        title.innerHTML = '';
        text.split('').forEach((char, index) => {
            const span = document.createElement('span');
            span.innerText = char;
            span.className = 'letter';
            span.style.animationDelay = `${index * 0.12}s`;
            title.appendChild(span);
        });
    }
    showResultsPage() { this.app.elements['results-page']?.classList.remove('hidden'); }
    showLoading() { this.app.elements['loading-indicator']?.classList.remove('hidden'); }
    hideLoading() { this.app.elements['loading-indicator']?.classList.add('hidden'); }
    showError(message) {
        if (this.app.elements['error-text']) this.app.elements['error-text'].textContent = message;
        this.app.elements['error-message']?.classList.remove('hidden');
    }
    showToast(message, timeout) {
        const toast = this.app.elements['toast-notification'];
        if (!toast) return;
        if (this.app.toastTimeoutId) clearTimeout(this.app.toastTimeoutId);
        toast.textContent = message;
        toast.classList.add('show');
        this.app.toastTimeoutId = setTimeout(() => { toast.classList.remove('show'); this.app.toastTimeoutId = null; }, timeout);
    }
    hideError() { this.app.elements['error-message']?.classList.add('hidden'); }
    showResultsContainer() {
        this.app.elements['marketplace-tabs']?.classList.remove('hidden');
        this.app.elements['search-results']?.classList.remove('hidden');
        this.app.elements['no-results']?.classList.add('hidden');
    }
    hideResults() {
        this.app.elements['marketplace-tabs']?.classList.add('hidden');
        this.app.elements['search-results']?.classList.add('hidden');
        this.app.elements['no-results']?.classList.add('hidden');
    }
    showNoResults() {
        this.app.elements['marketplace-tabs']?.classList.add('hidden');
        this.app.elements['search-results']?.classList.add('hidden');
        this.app.elements['no-results']?.classList.remove('hidden');
    }
    switchMarketplace(marketplace) {
        this.app.currentMarketplace = marketplace;
        this.app.elements.tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.marketplace === marketplace);
        });
        document.querySelectorAll('.marketplace-results').forEach(container => {
            container.classList.toggle('active', container.id === `results-${marketplace}`);
        });
    }
    displaySearchTime(duration) {
        const el = this.app.elements['search-time'];
        if (!el) return;
        el.textContent = `Searching time: ${duration.toFixed(0)} мс`;
        el.classList.remove('hidden');
    }
    displaySearchTags() {
        const tagsContainer = this.app.elements['search-tags'];
        if(!tagsContainer) return;
        const tags = [];
        if (this.app.filters.onlyNew) tags.push('Only new');
        if (this.app.filters.priceFilter) tags.push(`Price filter (tolerance: ${this.app.filters.tolerance.toFixed(2)})`);
        if (this.app.filters.nameFilter) tags.push('Filter by name');
        tagsContainer.innerHTML = '';
        tags.forEach(tag => {
            const tagEl = document.createElement('span');
            tagEl.className = 'search-tag';
            tagEl.textContent = tag;
            tagsContainer.appendChild(tagEl);
        });
        tagsContainer.classList.remove('hidden');
    }
    renderExcludeWords() {
        const list = this.app.elements['exclude-words-list'];
        if (!list) return;
        list.innerHTML = '';
        this.app.filters.excludeWords.forEach(word => {
            const chip = document.createElement('span');
            chip.className = 'exclude-word-chip';
            chip.textContent = word;
            const btn = document.createElement('button');
            btn.innerHTML = '×';
            btn.title = 'Удалить';
            btn.dataset.word = word;
            chip.appendChild(btn);
            list.appendChild(chip);
        });
    }
    displayResults(results) {
        if (!results?.products_data) {
            this.showError('Invalid format of response from server');
            return;
        }
        const { products_data } = results;
        let hasAnyResults = false;
        const visibleMarketplaces = [];
        this.app.marketplaces.forEach(mp => {
            const products = products_data[mp] || [];
            const count = products.length;
            const tabElement = document.querySelector(`[data-marketplace="${mp}"]`);
            const countElement = document.getElementById(`count-${mp}`);
            if (tabElement) tabElement.classList.toggle('hidden', count === 0);
            if (countElement) countElement.textContent = count > 0 ? count : '';
            if (count > 0) {
                hasAnyResults = true;
                visibleMarketplaces.push(mp);
                this.renderMarketplaceProducts(mp, products);
            }
        });
        if (hasAnyResults) {
            this.showResultsContainer();
            const firstVisible = visibleMarketplaces.includes(this.app.currentMarketplace) ? this.app.currentMarketplace : visibleMarketplaces[0] ?? this.app.marketplaces[0];
            this.switchMarketplace(firstVisible);
        } else {
            this.showNoResults();
        }
    }
    renderMarketplaceProducts(marketplace, products) {
        const container = document.getElementById(`products-${marketplace}`);
        if (!container) return;
        container.innerHTML = '';
        const fragment = document.createDocumentFragment();
        products.forEach(product => fragment.appendChild(this.createProductCard(product)));
        container.appendChild(fragment);
    }
    createProductCard(product) {
        const card = document.createElement('a');
        card.className = 'product-card';
        card.href = product.link || '#';
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name || 'Product image'}" loading="lazy" onerror="this.parentElement.innerHTML = 'No image';">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name || 'No title'}</h3>
                <p class="product-price">${product.price || 'No price'} BYN</p>
            </div>
        `;
        return card;
    }
}
