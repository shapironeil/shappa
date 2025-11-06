// Componente Amazon-like per rendering di un prodotto
// Usa dati del nostro endpoint /api/amazon/scrape

export function renderAmazonProductCard(container, product) {
  if (!container || !product) return;
  const images = product.images || [product.image].filter(Boolean);
  const mainImage = images && images[0];
  const brand = product.brand || product.soldBy || 'Brand';
  const rating = product.rating || product.stars || null;
  const price = product.price || product.currentPrice || null;
  const prime = product.badges && product.badges.includes('Prime');
  const delivery = product.delivery || product.shipping || null;

  container.innerHTML = `
    <div class="amazon-card">
      <div class="gallery">
        <div class="thumbs">
          ${images.map((src, i) => `<img data-idx="${i}" src="${src}" alt="thumb" />`).join('')}
        </div>
        <div class="main">
          ${mainImage ? `<img src="${mainImage}" alt="main" />` : ''}
        </div>
      </div>
      <div class="details">
        <h1>${product.title || 'Titolo prodotto'}</h1>
        <div class="meta">
          <span>Marca: ${brand}</span>
          ${rating ? `<span>⭐ ${rating}</span>` : ''}
          ${prime ? `<span class="badge">Prime</span>` : ''}
        </div>
        <div class="tabs">
          <div class="tab-buttons">
            <button data-tab="info">Info</button>
            <button data-tab="auto">Automazione</button>
            <button data-tab="manual">Manuale</button>
          </div>
          <div class="tab-content" data-tab-content="info">
            <p>${product.details || product.description || 'Dettagli non disponibili.'}</p>
          </div>
          <div class="tab-content" data-tab-content="auto" style="display:none">
            <p>Fee eBay, Regole Profitto, Monitor prezzo…</p>
          </div>
          <div class="tab-content" data-tab-content="manual" style="display:none">
            <textarea rows="6" style="width:100%" placeholder="Note o descrizione personalizzata"></textarea>
          </div>
        </div>
      </div>
      <div class="buybox">
        <div class="price">${price || '—'}</div>
        ${delivery ? `<div class="delivery">${delivery}</div>` : ''}
        <div class="actions" style="margin-top:8px">
          <button id="btn-list-ebay">Lista su eBay (mock)</button>
        </div>
      </div>
    </div>
  `;

  // Thumbs click to update main image
  container.querySelectorAll('.thumbs img').forEach(img => {
    img.addEventListener('click', () => {
      const idx = Number(img.dataset.idx);
      const target = container.querySelector('.gallery .main img');
      if (target) target.src = images[idx];
    });
  });

  // Tabs switching
  container.querySelectorAll('.tabs .tab-buttons button').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      container.querySelectorAll('.tabs .tab-content').forEach(c => {
        c.style.display = c.dataset.tabContent === tab ? '' : 'none';
      });
    });
  });

  // Mock list to eBay
  const listBtn = container.querySelector('#btn-list-ebay');
  if (listBtn) {
    listBtn.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/ebay/list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: product.asin || product.id, title: product.title, price: product.price })
        });
        const json = await res.json();
        alert(json.success ? `Listing creato: ${json.listingId}` : `Errore: ${json.error}`);
      } catch (e) {
        alert('Errore listing');
      }
    });
  }
}
