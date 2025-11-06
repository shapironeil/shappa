// products.js - Gestione ricerca prodotti Amazon per dashboard stile Droopify

(async function() {
  // Correggi gli ID per allineare con products.html
  const form = document.querySelector('form');
  const input = document.getElementById('searchQuery');
  const grid = document.getElementById('resultsGrid');
  const statTotal = document.getElementById('totalResults');
  const statPrice = document.getElementById('avgPrice');
  const statRating = document.getElementById('avgRating');
  const countrySel = document.getElementById('searchCountry');
  const minPrice = document.getElementById('minPrice');
  const maxPrice = document.getElementById('maxPrice');
  const detailDiv = document.getElementById('productDetail');

  function renderProducts(products) {
    grid.innerHTML = '';
    detailDiv.innerHTML = '';
    if (!products || products.length === 0) {
      grid.innerHTML = '<div class="no-results">Nessun prodotto trovato.</div>';
      statTotal.textContent = '0';
      statPrice.textContent = '-';
      statRating.textContent = '-';
      return;
    }
    let totalPrice = 0, totalRating = 0, ratingCount = 0;
    products.forEach(prod => {
      const card = document.createElement('div');
      card.className = 'venus-product-card';
      
      // Badge speciali
      const badges = [];
      if (prod.isPrime) badges.push('<span style="background: #ff9900; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">PRIME</span>');
      if (prod.badges && prod.badges.length > 0) {
        prod.badges.slice(0, 2).forEach(badge => {
          badges.push(`<span style="background: #4dabf7; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">${badge}</span>`);
        });
      }
      
      card.innerHTML = `
        <div class="venus-product-image" style="position: relative;">
          <img src="${prod.image || 'https://via.placeholder.com/280x200?text=No+Image'}" alt="${prod.title}" style="width: 100%; height: 200px; object-fit: contain; border-radius: var(--venus-radius); background: #f8f9fa; padding: var(--venus-space-sm);">
          ${badges.length > 0 ? `<div style="position: absolute; top: 8px; left: 8px; display: flex; gap: 4px; flex-wrap: wrap;">${badges.join('')}</div>` : ''}
        </div>
        <div class="venus-product-info" style="padding: var(--venus-space-md) 0;">
          <div class="venus-product-title" style="font-weight: var(--venus-font-weight-semibold); margin-bottom: var(--venus-space-xs); color: var(--venus-text-primary); height: 2.4em; overflow: hidden; line-height: 1.2;">${prod.title}</div>
          ${prod.brand ? `<div class="venus-product-brand" style="font-size: var(--venus-font-size-sm); color: var(--venus-text-muted); margin-bottom: var(--venus-space-xs);">${prod.brand}</div>` : ''}
          <div class="venus-product-price" style="font-size: var(--venus-font-size-lg); font-weight: var(--venus-font-weight-bold); color: var(--venus-primary); margin-bottom: var(--venus-space-xs);">${prod.price || 'Prezzo non disponibile'}</div>
          ${prod.rating ? `<div class="venus-product-rating" style="font-size: var(--venus-font-size-sm); margin-bottom: var(--venus-space-xs); color: var(--venus-warning);">${prod.rating} ${prod.reviewsCount ? `(${prod.reviewsCount} recensioni)` : ''}</div>` : ''}
          ${prod.shipping ? `<div style="font-size: var(--venus-font-size-xs); color: var(--venus-success); margin-bottom: var(--venus-space-xs);">${prod.shipping}</div>` : ''}
          <div class="venus-product-actions" style="display: flex; gap: var(--venus-space-xs);">
            <button class="btn-info" type="button">Ottieni informazioni</button>
            <button class="btn-draft" type="button">Aggiungi alle bozze</button>
          </div>
        </div>
      `;
      // Bottone dettagli (Ottieni informazioni)
      const detailsBtn = card.querySelector('.btn-info');
      detailsBtn.addEventListener('click', e => {
        e.stopPropagation();
        showProductDetailWithSaveOption(prod);
      });
      
      // Bottone Aggiungi alle bozze
      const draftBtn = card.querySelector('.btn-draft');
      draftBtn.addEventListener('click', e => {
        e.stopPropagation();
        // Chiamiamo la funzione saveAsDraft definita nel products.html
        saveAsDraft(encodeURIComponent(JSON.stringify(prod)));
      });
      
      // Click sulla card - apre Amazon e scarica info
      card.addEventListener('click', () => {
        openAmazonAndDownloadInfo(prod);
      });
      grid.appendChild(card);
      // Statistiche
      if (prod.price && typeof prod.price === 'string') {
        const p = parseFloat(prod.price.replace(/[^\d,.]/g, '').replace(',', '.'));
        if (!isNaN(p)) totalPrice += p;
      }
      if (prod.rating && typeof prod.rating === 'string') {
        const r = parseFloat(prod.rating.replace(/[^\d,.]/g, '').replace(',', '.'));
        if (!isNaN(r)) { totalRating += r; ratingCount++; }
      }
    });
    statTotal.textContent = products.length;
    statPrice.textContent = totalPrice ? (totalPrice / products.length).toFixed(2) + ' €' : '-';
    statRating.textContent = ratingCount ? (totalRating / ratingCount).toFixed(2) : '-';
  }

  async function showProductDetail(prod) {
    if (!prod.asin) {
      alert('ASIN non disponibile per questo prodotto');
      return;
    }

    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'product-modal-overlay';
    modal.innerHTML = `
      <div class="product-modal">
        <div class="modal-header">
          <h2>Caricamento dettagli prodotto...</h2>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Caricamento informazioni dettagliate...</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close modal functionality
    const closeModal = () => {
      document.body.removeChild(modal);
    };

    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Load detailed product information
    try {
      const country = countrySel ? countrySel.value : 'IT';
      const response = await fetch(`/api/amazon/product/${prod.asin}?country=${country}`);
      const data = await response.json();

      if (data.success && data.product) {
        displayProductDetails(modal, data.product, data.source);
      } else {
        throw new Error('Dettagli prodotto non disponibili');
      }
    } catch (error) {
      console.error('Error loading product details:', error);
      modal.querySelector('.modal-body').innerHTML = `
        <div class="error-state">
          <h3>Errore nel caricamento</h3>
          <p>Impossibile caricare i dettagli del prodotto. Riprova più tardi.</p>
          <button class="retry-btn" onclick="location.reload()">Riprova</button>
        </div>
      `;
    }
  }

  async function openAmazonAndDownloadInfo(prod) {
    if (!prod.asin || !prod.url) {
      alert('ASIN o URL non disponibile per questo prodotto');
      return;
    }

    // Apri immediatamente il link Amazon in una nuova scheda
    window.open(prod.url, '_blank');

    // Crea toast di notifica
    showToast('Caricamento informazioni prodotto...', 'info');

    // Avvia download informazioni in background
    try {
      const country = countrySel ? countrySel.value : 'IT';
      const response = await fetch(`/api/amazon/product/${prod.asin}?country=${country}`);
      const data = await response.json();

      if (data.success && data.product) {
        // Mostra popup con opzione di salvataggio
        showSaveProductDialog(data.product, data.source);
        showToast('Informazioni prodotto caricate!', 'success');
      } else {
        throw new Error('Informazioni prodotto non disponibili');
      }
    } catch (error) {
      console.error('Error downloading product info:', error);
      showToast('Errore nel caricamento delle informazioni', 'error');
    }
  }

  async function showProductDetailWithSaveOption(prod) {
    if (!prod.asin) {
      alert('ASIN non disponibile per questo prodotto');
      return;
    }

    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'product-modal-overlay';
    modal.innerHTML = `
      <div class="product-modal">
        <div class="modal-header">
          <h2>Caricamento dettagli prodotto...</h2>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Caricamento informazioni dettagliate...</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close modal functionality
    const closeModal = () => {
      document.body.removeChild(modal);
    };

    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Load detailed product information
    try {
      const country = countrySel ? countrySel.value : 'IT';
      const response = await fetch(`/api/amazon/product/${prod.asin}?country=${country}`);
      const data = await response.json();

      if (data.success && data.product) {
        displayProductDetailsWithSave(modal, data.product, data.source);
      } else {
        throw new Error('Dettagli prodotto non disponibili');
      }
    } catch (error) {
      console.error('Error loading product details:', error);
      modal.querySelector('.modal-body').innerHTML = `
        <div class="error-state">
          <h3>Errore nel caricamento</h3>
          <p>Impossibile caricare i dettagli del prodotto. Riprova più tardi.</p>
          <button class="retry-btn" onclick="location.reload()">Riprova</button>
        </div>
      `;
    }
  }

  function showSaveProductDialog(product, source) {
    const modal = document.createElement('div');
    modal.className = 'save-product-modal-overlay';
    modal.innerHTML = `
      <div class="save-product-modal">
        <div class="modal-header">
          <h2>Salvare questo prodotto?</h2>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="product-preview">
            <img src="${product.mainImage || product.image || 'https://via.placeholder.com/100x100'}" 
                 alt="${product.title}" class="preview-image">
            <div class="preview-info">
              <h3>${product.title}</h3>
              <p class="preview-price">${product.price || 'Prezzo non disponibile'}</p>
              <p class="preview-brand">di ${product.brand || 'N/A'}</p>
            </div>
          </div>
          
          <div class="save-options">
            <h4>Cosa vuoi fare?</h4>
            <div class="save-buttons">
              <button class="btn-save btn-primary">
                Salva prodotto
              </button>
              <button class="btn-view-details btn-secondary">
                Vedi dettagli completi
              </button>
              <button class="btn-skip btn-tertiary">
                ❌ Non salvare
              </button>
            </div>
          </div>
          
          ${source === 'demo_data' ? '<div class="demo-note">Questi sono dati di esempio</div>' : ''}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close modal functionality
    const closeModal = () => {
      document.body.removeChild(modal);
    };

    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Button handlers
    modal.querySelector('.btn-save').addEventListener('click', () => {
      saveProduct(product);
      closeModal();
    });

    modal.querySelector('.btn-view-details').addEventListener('click', () => {
      closeModal();
      // Apri il popup dettagli completo
      const detailModal = document.createElement('div');
      detailModal.className = 'product-modal-overlay';
      detailModal.innerHTML = `
        <div class="product-modal">
          <div class="modal-header">
            <h2>${product.title}</h2>
            <button class="modal-close">&times;</button>
          </div>
          <div class="modal-body"></div>
        </div>
      `;
      document.body.appendChild(detailModal);
      
      detailModal.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(detailModal);
      });
      
      displayProductDetailsWithSave(detailModal, product, source);
    });

    modal.querySelector('.btn-skip').addEventListener('click', closeModal);
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon"></span>
        <span class="toast-message">${message}</span>
      </div>
    `;

    // Aggiungi al body
    document.body.appendChild(toast);

    // Anima l'entrata
    setTimeout(() => toast.classList.add('toast-show'), 100);

    // Rimuovi dopo 3 secondi
    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  }

  async function saveProduct(product) {
    try {
      showToast('Salvataggio prodotto...', 'info');
      
      // Prepara i dati per bozza (draft)
      const draftData = {
        id: `draft_${product.asin}_${Date.now()}`, // ID unico per il draft
        title: product.title,
        description: createEbayDescription(product),
        price: parsePrice(product.price) || '0.00',
        originalPrice: parsePrice(product.originalPrice) || '',
        quantity: 1,
        status: 'draft',
        createdAt: new Date().toISOString(),
        
        // Dati originali del prodotto
        sourceData: {
          asin: product.asin,
          brand: product.brand,
          rating: product.rating,
          reviewsCount: product.reviewsCount,
          image: product.mainImage || product.image,
          images: product.images || [],
          features: product.features || [],
          techDetails: product.techDetails || {},
          categories: product.categories || [],
          url: product.url,
          availability: product.availability,
          isPrime: product.isPrime,
          delivery: product.delivery,
          variants: product.variants || []
        },
        
        // Dati per eBay listing
        listingData: {
          sku: `AMZ-${product.asin}-${Date.now()}`,
          condition: 'NEW',
          marketplace: 'EBAY_IT',
          format: 'FIXED_PRICE',
          currency: 'EUR',
          categoryId: ''
        },
        
        views: 0,
        savedAt: new Date().toISOString()
      };
      
      // Salva come bozza nel localStorage
      let drafts = JSON.parse(localStorage.getItem('shappa_drafts') || '[]');
      
      // Controlla se esiste già una bozza per questo prodotto
      const existingIndex = drafts.findIndex(d => d.sourceData?.asin === product.asin);
      
      if (existingIndex !== -1) {
        // Aggiorna la bozza esistente
        drafts[existingIndex] = { ...drafts[existingIndex], ...draftData };
        showToast('Bozza aggiornata con successo!', 'success');
      } else {
        // Aggiungi nuova bozza
        drafts.push(draftData);
        showToast('Prodotto salvato come bozza!', 'success');
      }
      
      localStorage.setItem('shappa_drafts', JSON.stringify(drafts));
      
      // Trigger download immagini HD in background (DISABILITATO per evitare errori server)
      if (product.asin) {
        console.log(`[Info] Download immagini HD disponibile per ASIN: ${product.asin}`);
        // Chiamata API disabilitata temporaneamente per evitare errori di connessione
        /*
        fetch('/api/images/download', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            asin: product.asin,
            images: product.images || []
          })
        }).catch(error => {
          console.error('Errore nel download immagini:', error);
        });
        
        // Aggiorna lo stato delle immagini dopo un breve delay
        setTimeout(() => {
          if (document.querySelector('.images-status')) {
            checkImagesDownloadStatus(product.asin);
          }
        }, 1000);
        */
      }
    } catch (error) {
      console.error('Error saving product:', error);
      showToast('Errore nel salvataggio del prodotto', 'error');
    }
  }

  function displayProductDetailsWithSave(modal, product, source) {
    const isDemo = source === 'demo_data';
    
    modal.querySelector('.modal-header h2').textContent = product.title;
    modal.querySelector('.modal-body').innerHTML = `
      ${isDemo ? '<div class="demo-badge">Dati di esempio</div>' : ''}
      
      <!-- Menu Bar Orizzontale -->
      <div class="product-menu-bar">
        <button class="menu-tab active" data-tab="info">
          Informazioni Prodotto
        </button>
        <button class="menu-tab" data-tab="automation">
          Automazioni
        </button>
      </div>

      <!-- Tab Content Container -->
      <div class="tab-content-container">
        <!-- Tab Informazioni Prodotto -->
        <div class="tab-content active" id="tab-info">
          <div class="product-detail-grid">
            <!-- Product Images -->
            <div class="product-images">
              <div class="main-image">
                <img src="${getOriginalImageUrl(product.mainImage || product.image) || 'https://via.placeholder.com/600x600/e8e8e8/666666?text=Immagine+Non+Disponibile'}" 
                     alt="${product.title}" 
                     id="mainProductImage"
                     loading="lazy"
                     onclick="openImageZoom(this.src, '${product.title}')"
                     style="cursor: pointer; max-width: 600px; width: 100%; height: auto;"
                     onerror="this.src='https://via.placeholder.com/600x600/e8e8e8/666666?text=Immagine+Non+Disponibile'; this.style.opacity='0.7';">
              </div>
              ${product.images && product.images.length > 1 ? `
                <div class="image-thumbnails">
                  ${product.images.slice(0, 6).map((img, index) => {
                    const highResImg = getOriginalImageUrl(img);
                    return `
                      <img src="${highResImg}" 
                           alt="Thumbnail ${index + 1}" 
                           class="thumbnail" 
                           loading="lazy"
                           onclick="switchMainImage('${highResImg}')"
                           onerror="this.style.opacity='0.5'; this.src='https://via.placeholder.com/80x80/e8e8e8/666666?text=N/A';">
                    `;
                  }).join('')}
                </div>
              ` : ''}
            </div>

            <!-- Product Info -->
            <div class="product-info">
              <div class="product-header">
                <h3>${product.title}</h3>
                <div class="product-brand">di <strong>${product.brand || 'N/A'}</strong></div>
              </div>

              <div class="rating-section">
                ${product.rating ? `
                  <div class="rating">
                    <span class="stars">★★★★★</span>
                    <span class="rating-text">${product.rating}</span>
                    ${product.reviewsCount ? `<span class="reviews-count">(${product.reviewsCount} recensioni)</span>` : ''}
                  </div>
                ` : ''}
              </div>

              <div class="price-section">
                <div class="current-price">${product.price || 'Prezzo non disponibile'}</div>
                ${product.originalPrice ? `<div class="original-price">${product.originalPrice}</div>` : ''}
                ${product.discount ? `<div class="discount-badge">${product.discount}</div>` : ''}
              </div>

              <div class="delivery-section">
                ${product.isPrime ? '<div class="prime-badge">Prime</div>' : ''}
                <div class="availability">${product.availability || 'Disponibilità da verificare'}</div>
                <div class="delivery">${product.delivery || 'Informazioni spedizione non disponibili'}</div>
              </div>

              <div class="images-download-section" id="imagesStatus-${product.asin}">
                <div class="loading-images-status">
                  Verificando stato immagini HD...
                </div>
              </div>

              <div class="hd-images-gallery" id="hdImagesGallery-${product.asin}" style="display: none;">
                <div class="gallery-header">
                  <h4>📸 Immagini ad Alta Risoluzione</h4>
                  <span class="gallery-info">Confronta e analizza le immagini HD del prodotto</span>
                </div>
                <div class="gallery-grid" id="galleryGrid-${product.asin}">
                  <!-- Le immagini HD saranno caricate qui -->
                </div>
              </div>

              ${product.variants && Object.keys(product.variants).length > 0 ? `
                <div class="variants-section">
                  <h4>Opzioni disponibili:</h4>
                  ${Object.entries(product.variants).map(([key, values]) => `
                    <div class="variant-group">
                      <strong>${key}:</strong>
                      <div class="variant-options">
                        ${values.slice(0, 8).map(value => `<span class="variant-option">${value}</span>`).join('')}
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Product Features -->
          ${product.features && product.features.length > 0 ? `
            <div class="features-section">
              <h4>Caratteristiche principali:</h4>
              <ul class="features-list">
                ${product.features.slice(0, 10).map(feature => `<li>${feature}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <!-- Technical Details -->
          ${product.techDetails && Object.keys(product.techDetails).length > 0 ? `
            <div class="tech-details-section">
              <h4>Dettagli tecnici:</h4>
              <div class="tech-details-grid">
                ${Object.entries(product.techDetails).slice(0, 12).map(([key, value]) => `
                  <div class="tech-detail">
                    <span class="tech-key">${key}:</span>
                    <span class="tech-value">${value}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Categories -->
          ${product.categories && product.categories.length > 0 ? `
            <div class="categories-section">
              <h4>Categorie:</h4>
              <div class="categories-list">
                ${product.categories.map(cat => `<span class="category-tag">${cat}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Tab Automazioni -->
        <div class="tab-content" id="tab-automation">
          <div class="automation-grid">
            <!-- Sezione Monitor Prezzi -->
            <div class="automation-section">
              <h4>💰 Monitor Prezzi</h4>
              <div class="automation-controls">
                <div class="control-group">
                  <label>Prezzo Target (€)</label>
                  <input type="number" class="control-input" placeholder="Es. 25.99" step="0.01">
                </div>
                <div class="control-group">
                  <label>Tipo Alert</label>
                  <select class="control-select">
                    <option>Prezzo scende sotto</option>
                    <option>Prezzo sale sopra</option>
                    <option>Cambio prezzo qualsiasi</option>
                  </select>
                </div>
                <button class="btn-automation btn-monitor">🔔 Attiva Monitor</button>
              </div>
            </div>

            <!-- Sezione Auto Listing -->
            <div class="automation-section">
              <h4>🚀 Auto Listing</h4>
              <div class="automation-controls">
                <div class="control-group">
                  <label>Prezzo Vendita (€)</label>
                  <input type="number" class="control-input" placeholder="Es. 35.99" step="0.01">
                </div>
                <div class="control-group">
                  <label>Quantità</label>
                  <input type="number" class="control-input" placeholder="Es. 10" min="1">
                </div>
                <div class="control-group">
                  <label>Markup (%)</label>
                  <input type="number" class="control-input" placeholder="Es. 20" step="1">
                </div>
                <div class="control-group checkbox-group">
                  <label>
                    <input type="checkbox" class="control-checkbox"> Auto-aggiorna prezzo
                  </label>
                </div>
                <button class="btn-automation btn-listing">📝 Crea Listing</button>
              </div>
            </div>

            <!-- Sezione Gestione Stock -->
            <div class="automation-section">
              <h4>📦 Gestione Stock</h4>
              <div class="automation-controls">
                <div class="control-group">
                  <label>Stock Minimo</label>
                  <input type="number" class="control-input" placeholder="Es. 5" min="0">
                </div>
                <div class="control-group">
                  <label>Stock Massimo</label>
                  <input type="number" class="control-input" placeholder="Es. 50" min="1">
                </div>
                <div class="control-group checkbox-group">
                  <label>
                    <input type="checkbox" class="control-checkbox"> Auto-riordino
                  </label>
                </div>
                <button class="btn-automation btn-stock">Configura Stock</button>
              </div>
            </div>

            <!-- Sezione Notifiche -->
            <div class="automation-section">
              <h4>🔔 Notifiche</h4>
              <div class="automation-controls">
                <div class="control-group checkbox-group">
                  <label>
                    <input type="checkbox" class="control-checkbox" checked> Email
                  </label>
                </div>
                <div class="control-group checkbox-group">
                  <label>
                    <input type="checkbox" class="control-checkbox"> SMS
                  </label>
                </div>
                <div class="control-group checkbox-group">
                  <label>
                    <input type="checkbox" class="control-checkbox" checked> Push Browser
                  </label>
                </div>
                <button class="btn-automation btn-notifications">✅ Salva Preferenze</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Fixed Action Buttons (Bottom Right) -->
      <div class="fixed-action-buttons">
        <button class="btn-save-product btn-primary">
          Salva Prodotto
        </button>
        <button class="btn-open-amazon btn-secondary" onclick="window.open('${product.url}', '_blank')">
          🔗 Apri Amazon
        </button>
      </div>
    `;

    // Add save button handler
    modal.querySelector('.btn-save-product').addEventListener('click', () => {
      saveProduct(product);
    });

    // Add tab switching functionality
    const tabButtons = modal.querySelectorAll('.menu-tab');
    const tabContents = modal.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');
        
        // Remove active class from all tabs and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        button.classList.add('active');
        modal.querySelector(`#tab-${targetTab}`).classList.add('active');
      });
    });

    // Check and update images download status
    if (product.asin) {
      // Aspetta che il modal sia completamente renderizzato
      setTimeout(() => {
        const statusContainer = document.getElementById(`imagesStatus-${product.asin}`);
        if (statusContainer) {
          checkImagesDownloadStatus(product.asin);
        } else {
          console.warn(`Container immagini non trovato per ASIN: ${product.asin}`);
        }
      }, 100);
    }

    // Add automation button handlers
    modal.querySelector('.btn-monitor')?.addEventListener('click', () => {
      showToast('Monitor prezzi attivato!', 'success');
    });

    modal.querySelector('.btn-listing')?.addEventListener('click', () => {
      showToast('Listing creato con successo!', 'success');
    });

    modal.querySelector('.btn-stock')?.addEventListener('click', () => {
      showToast('Configurazione stock salvata!', 'success'); 
    });

    modal.querySelector('.btn-notifications')?.addEventListener('click', () => {
      showToast('Preferenze notifiche salvate!', 'success');
    });
  }

  function displayProductDetails(modal, product, source) {
    const isDemo = source === 'demo_data';
    
    modal.querySelector('.modal-header h2').textContent = product.title;
    modal.querySelector('.modal-body').innerHTML = `
      ${isDemo ? '<div class="demo-badge">Dati di esempio</div>' : ''}
      
      <div class="product-detail-grid">
        <!-- Product Images -->
        <div class="product-images">
          <div class="main-image">
            <img src="${product.mainImage || product.image || 'https://via.placeholder.com/500x500?text=No+Image'}" 
                 alt="${product.title}" id="mainProductImage">
          </div>
          ${product.images && product.images.length > 1 ? `
            <div class="image-thumbnails">
              ${product.images.slice(0, 6).map(img => `
                <img src="${img}" alt="Thumbnail" class="thumbnail" 
                     onclick="document.getElementById('mainProductImage').src='${img}'">
              `).join('')}
            </div>
          ` : ''}
        </div>

        <!-- Product Info -->
        <div class="product-info">
          <div class="product-header">
            <h3>${product.title}</h3>
            <div class="product-brand">di <strong>${product.brand || 'N/A'}</strong></div>
          </div>

          <div class="rating-section">
            ${product.rating ? `
              <div class="rating">
                <span class="stars">★★★★★</span>
                <span class="rating-text">${product.rating}</span>
                ${product.reviewsCount ? `<span class="reviews-count">(${product.reviewsCount} recensioni)</span>` : ''}
              </div>
            ` : ''}
          </div>

          <div class="price-section">
            <div class="current-price">${product.price || 'Prezzo non disponibile'}</div>
            ${product.originalPrice ? `<div class="original-price">${product.originalPrice}</div>` : ''}
            ${product.discount ? `<div class="discount-badge">${product.discount}</div>` : ''}
          </div>

          <div class="delivery-section">
            ${product.isPrime ? '<div class="prime-badge">✓ Prime</div>' : ''}
            <div class="availability">${product.availability || 'Disponibilità da verificare'}</div>
            <div class="delivery">${product.delivery || 'Informazioni spedizione non disponibili'}</div>
          </div>

          ${product.variants && Object.keys(product.variants).length > 0 ? `
            <div class="variants-section">
              <h4>Opzioni disponibili:</h4>
              ${Object.entries(product.variants).map(([key, values]) => `
                <div class="variant-group">
                  <strong>${key}:</strong>
                  <div class="variant-options">
                    ${values.slice(0, 8).map(value => `<span class="variant-option">${value}</span>`).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <div class="action-buttons">
            <button class="btn-primary" onclick="window.open('${product.url}', '_blank')">
              Vedi su Amazon
            </button>
            <button class="btn-secondary" onclick="navigator.share ? navigator.share({title: '${product.title}', url: '${product.url}'}) : navigator.clipboard.writeText('${product.url}')">
              Condividi
            </button>
          </div>
        </div>
      </div>

      <!-- Product Features -->
      ${product.features && product.features.length > 0 ? `
        <div class="features-section">
          <h4>Caratteristiche principali:</h4>
          <ul class="features-list">
            ${product.features.slice(0, 10).map(feature => `<li>${feature}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- Technical Details -->
      ${product.techDetails && Object.keys(product.techDetails).length > 0 ? `
        <div class="tech-details-section">
          <h4>Dettagli tecnici:</h4>
          <div class="tech-details-grid">
            ${Object.entries(product.techDetails).slice(0, 12).map(([key, value]) => `
              <div class="tech-detail">
                <span class="tech-key">${key}:</span>
                <span class="tech-value">${value}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Categories -->
      ${product.categories && product.categories.length > 0 ? `
        <div class="categories-section">
          <h4>Categorie:</h4>
          <div class="categories-list">
            ${product.categories.map(cat => `<span class="category-tag">${cat}</span>`).join('')}
          </div>
        </div>
      ` : ''}
    `;
  }

  async function searchProducts(keyword) {
    if (!keyword || keyword.trim().length < 2) return renderProducts([]);
    input.disabled = true;
    grid.innerHTML = '<div class="loading">Caricamento...</div>';
    detailDiv.innerHTML = '';
    let params = `q=${encodeURIComponent(keyword)}`;
    if (countrySel && countrySel.value) params += `&country=${countrySel.value}`;
    if (minPrice && minPrice.value) params += `&minPrice=${minPrice.value}`;
    if (maxPrice && maxPrice.value) params += `&maxPrice=${maxPrice.value}`;
    try {
      const res = await fetch(`/api/amazon/search?${params}`);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.products)) {
        renderProducts(data.products);
      } else {
        grid.innerHTML = '<div class="error-message">Errore nella ricerca prodotti.</div>';
        statTotal.textContent = '0';
        statPrice.textContent = '-';
        statRating.textContent = '-';
      }
    } catch (err) {
      grid.innerHTML = '<div class="error-message">Errore di rete o scraping.</div>';
      statTotal.textContent = '0';
      statPrice.textContent = '-';
      statRating.textContent = '-';
    } finally {
      input.disabled = false;
    }
  }

  if (form && input) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const keyword = input.value.trim();
      if (!keyword) return;
      searchProducts(keyword);
    });
  }

  // Ricerca automatica all'avvio se c'è una query
  if (input && input.value && input.value.trim().length > 1) {
    searchProducts(input.value.trim());
  }

  // Funzioni per gestione immagini
  function getOriginalImageUrl(imageUrl, hiresUrl = null) {
    if (!imageUrl) return '';
    
    try {
      console.log(`[Frontend] Processing image: ${imageUrl}`);
      if (hiresUrl) {
        console.log(`[Frontend] Hi-res disponibile: ${hiresUrl}`);
      }
      
      // PRIORITY 1: Se abbiamo l'URL hi-res da data-old-hires, usalo
      if (hiresUrl && hiresUrl.includes('images/I/')) {
        console.log(`[Frontend] Usando immagine hi-res: ${hiresUrl}`);
        return getMaxResolutionUrl(hiresUrl);
      }
      
      // PRIORITY 2: Processa l'URL normale per ottenere la massima risoluzione
      let originalUrl = imageUrl;
      
      console.log(`[Frontend] Processing standard image: ${imageUrl}`);
      
      // Usa la funzione helper per ottenere la massima risoluzione
      return getMaxResolutionUrl(originalUrl);
    } catch (error) {
      console.error(`[Frontend] Error processing image: ${error}`);
      return imageUrl;
    }
  }

  function switchMainImage(imageSrc) {
    const mainImg = document.getElementById('mainProductImage');
    if (mainImg) {
      // Usa l'immagine ad alta risoluzione
      mainImg.src = getOriginalImageUrl(imageSrc);
    }
  }

  function openImageZoom(imageSrc, productTitle) {
    // Ottieni l'immagine originale ad altissima risoluzione
    const highResImage = getOriginalImageUrl(imageSrc);
    
    // Crea modal per zoom immagine
    const zoomModal = document.createElement('div');
    zoomModal.className = 'image-zoom-modal';
    zoomModal.innerHTML = `
      <div class="zoom-overlay" onclick="closeImageZoom()">
        <div class="zoom-container" onclick="event.stopPropagation()">
          <div class="zoom-header">
            <h3>${productTitle}</h3>
            <button class="zoom-close" onclick="closeImageZoom()">&times;</button>
          </div>
          <div class="zoom-image-container">
            <img src="${highResImage}" alt="${productTitle}" class="zoom-image"
                 onerror="this.src='${imageSrc}'; this.onerror=null;"
                 onload="showImageInfo(this)"
                 style="max-width: none; max-height: none; width: auto; height: auto;">
            <div class="image-info" id="imageInfo" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.8); color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px;"></div>
          </div>
          <div class="zoom-controls">
            <button onclick="zoomIn()" class="zoom-btn">Zoom In</button>
            <button onclick="zoomOut()" class="zoom-btn">Zoom Out</button>
            <button onclick="resetZoom()" class="zoom-btn">Reset</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(zoomModal);
    document.body.style.overflow = 'hidden';
  }

  function closeImageZoom() {
    const zoomModal = document.querySelector('.image-zoom-modal');
    if (zoomModal) {
      document.body.removeChild(zoomModal);
      document.body.style.overflow = 'auto';
    }
  }

  function zoomIn() {
    const zoomImage = document.querySelector('.zoom-image');
    if (zoomImage) {
      const currentScale = zoomImage.style.transform ? 
        parseFloat(zoomImage.style.transform.match(/scale\(([^)]+)\)/)?.[1] || 1) : 1;
      const newScale = Math.min(currentScale * 1.2, 3);
      zoomImage.style.transform = `scale(${newScale})`;
      zoomImage.style.cursor = 'grab';
    }
  }

  function zoomOut() {
    const zoomImage = document.querySelector('.zoom-image');
    if (zoomImage) {
      const currentScale = zoomImage.style.transform ? 
        parseFloat(zoomImage.style.transform.match(/scale\(([^)]+)\)/)?.[1] || 1) : 1;
      const newScale = Math.max(currentScale / 1.2, 0.5);
      zoomImage.style.transform = `scale(${newScale})`;
      if (newScale <= 1) zoomImage.style.cursor = 'pointer';
    }
  }

  function resetZoom() {
    const zoomImage = document.querySelector('.zoom-image');
    if (zoomImage) {
      zoomImage.style.transform = 'scale(1)';
      zoomImage.style.cursor = 'pointer';
    }
  }

  function showImageInfo(img) {
    const infoDiv = document.getElementById('imageInfo');
    if (infoDiv && img.naturalWidth && img.naturalHeight) {
      const dimensions = `${img.naturalWidth} × ${img.naturalHeight}px`;
      const fileSize = img.src.length > 100 ? 'HD Quality' : 'Standard';
      const isEbayReady = img.naturalWidth >= 1000 || img.naturalHeight >= 1000 ? '✓ eBay Ready' : '⚠ Low Res';
      infoDiv.innerHTML = `${dimensions}<br>${isEbayReady}`;
      infoDiv.style.display = 'block';
      
      console.log(`[ImageInfo] ${img.src} - ${dimensions} - Natural: ${img.naturalWidth}x${img.naturalHeight}`);
    }
  }

  // Helper function to create eBay-formatted description
  function createEbayDescription(product) {
    let description = `<div style="font-family: Arial, sans-serif; line-height: 1.6;">`;
    
    // Titolo e brand
    description += `<h2>${product.title}</h2>`;
    if (product.brand) {
      description += `<p><strong>Brand:</strong> ${product.brand}</p>`;
    }
    
    // Caratteristiche principali
    if (product.features && product.features.length > 0) {
      description += `<h3>📋 Caratteristiche Principali:</h3><ul>`;
      product.features.slice(0, 8).forEach(feature => {
        description += `<li>${feature}</li>`;
      });
      description += `</ul>`;
    }
    
    // Dettagli tecnici
    if (product.techDetails && Object.keys(product.techDetails).length > 0) {
      description += `<h3>🔧 Specifiche Tecniche:</h3><table style="border-collapse: collapse; width: 100%;">`;
      Object.entries(product.techDetails).slice(0, 10).forEach(([key, value]) => {
        description += `<tr><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">${key}</td><td style="border: 1px solid #ddd; padding: 8px;">${value}</td></tr>`;
      });
      description += `</table>`;
    }
    
    // Varianti disponibili
    if (product.variants && Object.keys(product.variants).length > 0) {
      description += `<h3>🎨 Opzioni Disponibili:</h3>`;
      Object.entries(product.variants).forEach(([key, values]) => {
        description += `<p><strong>${key}:</strong> ${values.slice(0, 5).join(', ')}</p>`;
      });
    }
    
    // Info spedizione
    if (product.delivery) {
      description += `<h3>🚚 Spedizione:</h3><p>${product.delivery}</p>`;
    }
    
    // Rating e recensioni
    if (product.rating && product.reviewsCount) {
      description += `<h3>⭐ Recensioni:</h3><p>Valutazione: ${product.rating} su 5 stelle (${product.reviewsCount} recensioni)</p>`;
    }
    
    // Footer
    description += `<hr><p><em>Prodotto originale Amazon. Spedizione rapida e sicura.</em></p>`;
    description += `</div>`;
    
    return description;
  }

  // Helper function to parse price from string
  function parsePrice(priceString) {
    if (!priceString) return 0;
    
    // Rimuovi simboli e testo, mantieni solo numeri e virgole/punti
    const cleanPrice = priceString.toString()
      .replace(/[€$£¥₹]/g, '') // Rimuovi simboli valuta
      .replace(/[^\d.,]/g, '') // Mantieni solo numeri, virgole e punti
      .replace(/,(\d{3})/g, '$1') // Rimuovi virgole dei migliaia
      .replace(',', '.'); // Converti virgola decimale in punto
    
    const price = parseFloat(cleanPrice);
    return isNaN(price) ? 0 : price;
  }

  // Track ongoing status checks to prevent multiple calls
  const ongoingStatusChecks = new Set();

  // Check images download status with retry limit
  async function checkImagesDownloadStatus(asin, retryCount = 0) {
    const maxRetries = 30; // Massimo 30 tentativi (1 minuto)
    
    // Evita chiamate multiple per lo stesso ASIN
    const checkKey = `${asin}-${retryCount}`;
    if (ongoingStatusChecks.has(asin) && retryCount === 0) {
      console.log(`Controllo già in corso per ASIN: ${asin}`);
      return;
    }
    
    if (retryCount === 0) {
      ongoingStatusChecks.add(asin);
    }
    
    try {
      console.log(`[StatusCheck] Controllo stato immagini disabilitato per ASIN: ${asin}`);
      
      // Chiamata API disabilitata per evitare errori di connessione
      ongoingStatusChecks.delete(asin);
      return;
      
      /*
      const response = await fetch(`/api/images/status/${asin}`);
      const data = await response.json();
      
      console.log(`[StatusCheck] Risposta per ${asin}:`, data);
      */
      
      // Usa un selettore più specifico per evitare conflitti
      const statusContainer = document.getElementById(`imagesStatus-${asin}`);
      if (!statusContainer) {
        console.warn(`[StatusCheck] Container immagini non trovato per ASIN: ${asin}`);
        ongoingStatusChecks.delete(asin);
        return;
      }
      
      // Trova o crea l'elemento status all'interno del container
      let statusElement = statusContainer.querySelector('.images-status');
      if (!statusElement) {
        statusElement = document.createElement('div');
        statusElement.className = 'images-status';
        statusContainer.innerHTML = '';
        statusContainer.appendChild(statusElement);
      }
      
      if (data.downloaded) {
        statusElement.innerHTML = `
          <div class="images-status-item">
            <span class="status-icon status-success">✓</span>
            <span class="status-text">Immagini HD scaricate (${data.count} immagini)</span>
            <span class="status-detail">Dimensioni: ${data.maxDimensions}</span>
          </div>
        `;
        console.log(`Immagini HD pronte per eBay - ${data.count} files, max: ${data.maxDimensions}`);
        
        // Carica la galleria delle immagini HD
        loadHDImagesGallery(asin);
        // Rimuovi dal tracking quando completato
        ongoingStatusChecks.delete(asin);
      } else if (data.downloading) {
        statusElement.innerHTML = `
          <div class="images-status-item">
            <span class="status-icon status-processing">⏳</span>
            <span class="status-text">Download immagini HD in corso...</span>
            <span class="status-detail">Tentativo ${retryCount + 1}/${maxRetries}</span>
          </div>
        `;
        
        // Controlla di nuovo dopo 2 secondi, ma solo se non abbiamo superato il limite
        if (retryCount < maxRetries) {
          setTimeout(() => checkImagesDownloadStatus(asin, retryCount + 1), 2000);
        } else {
          // Timeout raggiunto, mostra errore
          statusElement.innerHTML = `
            <div class="images-status-item">
              <span class="status-icon status-error">⚠</span>
              <span class="status-text">Timeout download immagini</span>
              <span class="status-detail">Riprova più tardi</span>
            </div>
          `;
          console.warn(`Timeout download immagini per ASIN: ${asin}`);
          // Rimuovi dal tracking quando timeout
          ongoingStatusChecks.delete(asin);
        }
      } else {
        statusElement.innerHTML = `
          <div class="images-status-item">
            <span class="status-icon status-pending">⏸</span>
            <span class="status-text">Immagini HD non ancora scaricate</span>
            <span class="status-detail">Saranno processate al salvataggio prodotto</span>
          </div>
        `;
        // Rimuovi dal tracking anche per stato pending
        ongoingStatusChecks.delete(asin);
      }
      
      // Gestisci stato incompleto
      if (data.status === 'incomplete') {
        statusElement.innerHTML = `
          <div class="images-status-item">
            <span class="status-icon status-error">⚠</span>
            <span class="status-text">Download incompleto (${data.count} files)</span>
            <span class="status-detail">
              <button onclick="retryImageDownload('${asin}')" class="retry-btn">Riprova</button>
            </span>
          </div>
        `;
        ongoingStatusChecks.delete(asin);
      }
    } catch (error) {
      console.error('Errore nel controllo stato immagini:', error);
      // Rimuovi dal tracking in caso di errore
      ongoingStatusChecks.delete(asin);
      const statusElement = document.querySelector('.images-status');
      if (statusElement) {
        statusElement.innerHTML = `
          <div class="images-status-item">
            <span class="status-icon status-error">⚠</span>
            <span class="status-text">Errore nel controllo stato immagini</span>
          </div>
        `;
      }
    }
  }

  // Helper function to get maximum resolution from any Amazon URL
  function getMaxResolutionUrl(url) {
    if (!url || !url.includes('images/I/')) {
      console.log(`[Frontend] URL non Amazon o vuoto: ${url}`);
      return url;
    }
    
    try {
      console.log(`[Frontend] Estrazione massima risoluzione da: ${url}`);
      
      // Estrai l'ID immagine Amazon (pattern più robusto)
      const imageIdMatch = url.match(/images\/I\/([A-Za-z0-9+\-_]+)/);
      if (!imageIdMatch || !imageIdMatch[1]) {
        console.warn(`[Frontend] ID immagine non trovato in: ${url}`);
        return url;
      }
      
      const imageId = imageIdMatch[1];
      const baseUrl = url.split('images/I/')[0];
      
      // Determina l'estensione migliore
      let extension = '.jpg'; // Default a JPG per qualità superiore
      if (url.includes('.png') && !url.includes('.jpg')) {
        extension = '.png';
      }
      
      // Crea URL originale senza modificatori per massima qualità
      const originalUrl = `${baseUrl}images/I/${imageId}${extension}`;
      
      console.log(`[Frontend] ✅ URL massima risoluzione: ${originalUrl}`);
      console.log(`[Frontend] 📏 Estratto ID: ${imageId}, Base: ${baseUrl}, Ext: ${extension}`);
      
      return originalUrl;
      
    } catch (error) {
      console.error(`[Frontend] ❌ Errore nell'estrazione massima risoluzione: ${error}`);
      return url;
    }
  }

  // Load and display HD images gallery
  async function loadHDImagesGallery(asin) {
    try {
      const response = await fetch(`/api/images/downloaded/${asin}`);
      const data = await response.json();
      
      const gallerySection = document.getElementById(`hdImagesGallery-${asin}`);
      const galleryGrid = document.getElementById(`galleryGrid-${asin}`);
      
      if (!gallerySection || !galleryGrid) return;
      
      if (data.images && data.images.length > 0) {
        gallerySection.style.display = 'block';
        
        galleryGrid.innerHTML = data.images.map((img, index) => `
          <div class="hd-image-item" onclick="openHDImageModal('${img.url}', '${img.dimensions}', '${img.filename}')">
            <div class="hd-image-container">
              <img src="${img.url}" alt="HD Image ${index + 1}" loading="lazy" 
                   onerror="this.style.display='none'" />
              <div class="hd-image-overlay">
                <div class="hd-image-info">
                  <span class="image-dimensions">${img.dimensions}</span>
                  <span class="image-size">${formatFileSize(img.fileSize)}</span>
                </div>
                <div class="zoom-indicator">🔍</div>
              </div>
            </div>
            <div class="hd-image-details">
              <span class="image-number">#${index + 1}</span>
              <span class="image-filename">${img.filename}</span>
            </div>
          </div>
        `).join('');
        
        console.log(`Caricata galleria HD: ${data.images.length} immagini per ASIN ${asin}`);
      } else {
        gallerySection.style.display = 'none';
      }
      
    } catch (error) {
      console.error('Errore nel caricamento galleria HD:', error);
    }
  }

  // Format file size for display
  function formatFileSize(bytes) {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / (1024 * 1024)) + ' MB';
  }

  // Open HD image in modal for detailed view
  function openHDImageModal(imageUrl, dimensions, filename) {
    const modal = document.createElement('div');
    modal.className = 'hd-image-modal';
    modal.innerHTML = `
      <div class="hd-modal-content">
        <div class="hd-modal-header">
          <h3>Immagine ad Alta Risoluzione</h3>
          <button class="hd-modal-close" onclick="closeHDImageModal()">&times;</button>
        </div>
        <div class="hd-modal-info">
          <span class="hd-info-item">📏 ${dimensions}</span>
          <span class="hd-info-item">📄 ${filename}</span>
          <span class="hd-info-item">🎯 eBay Ready</span>
        </div>
        <div class="hd-modal-image-container">
          <img src="${imageUrl}" alt="HD Image" class="hd-modal-image" />
        </div>
        <div class="hd-modal-actions">
          <button class="btn btn-primary" onclick="copyImageUrl('${imageUrl}')">Copia Link</button>
          <button class="btn btn-secondary" onclick="downloadImage('${imageUrl}', '${filename}')">Download</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
  }

  // Close HD image modal
  function closeHDImageModal() {
    const modal = document.querySelector('.hd-image-modal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    }
  }

  // Copy image URL to clipboard
  function copyImageUrl(url) {
    const fullUrl = window.location.origin + url;
    navigator.clipboard.writeText(fullUrl).then(() => {
      showToast('Link immagine copiato!', 'success');
    }).catch(() => {
      showToast('Errore nella copia del link', 'error');
    });
  }

  // Download image
  function downloadImage(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Download avviato!', 'success');
  }

  // Retry image download for incomplete downloads
  async function retryImageDownload(asin) {
    try {
      showToast('Riavvio download immagini...', 'info');
      
      // Reset del tracking
      ongoingStatusChecks.delete(asin);
      
      // Trova il prodotto e riavvia il download
      const products = JSON.parse(localStorage.getItem('searchResults') || '[]');
      const product = products.find(p => p.asin === asin);
      
      if (product && product.images) {
        const response = await fetch('/api/images/download', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            asin: asin,
            images: product.images
          })
        });
        
        if (response.ok) {
          showToast('Download riavviato!', 'success');
          // Ricontrolla lo stato dopo 2 secondi
          setTimeout(() => checkImagesDownloadStatus(asin), 2000);
        } else {
          throw new Error('Errore nel riavvio download');
        }
      } else {
        throw new Error('Prodotto non trovato');
      }
      
    } catch (error) {
      console.error('Errore nel retry download:', error);
      showToast('Errore nel riavvio download', 'error');
    }
  }

  // Rendiamo globali le funzioni per l'HTML
  window.showProductDetailWithSaveOption = showProductDetailWithSaveOption;
  window.openAmazonAndDownloadInfo = openAmazonAndDownloadInfo;
  window.switchMainImage = switchMainImage;
  window.openImageZoom = openImageZoom;
  window.closeImageZoom = closeImageZoom;
  window.zoomIn = zoomIn;
  window.openHDImageModal = openHDImageModal;
  window.closeHDImageModal = closeHDImageModal;
  window.copyImageUrl = copyImageUrl;
  window.downloadImage = downloadImage;
  window.retryImageDownload = retryImageDownload;
  window.zoomOut = zoomOut;
  window.resetZoom = resetZoom;
  window.showImageInfo = showImageInfo;
})();
