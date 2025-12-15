
// Product Database 
const productsDatabase = {
  1: { name: "Dark Fuchsia Bouquet", price: "$55.00", image: "../png/3.png" },
  2: { name: "Autumn Sunflower Bouquet", price: "$65.00", image: "../png/4.png" },
  3: { name: "Red Assorted Bouquet", price: "$45.00", image: "../png/5.png" },
  4: { name: "Spring Garden Mix", price: "$50.00", image: "../png/spring-mix.png" },
  5: { name: "White Rose Elegance", price: "$70.00", image: "../png/whiterose.jfif" },
  6: { name: "Tropical Paradise", price: "$85.00", image: "../png/tropical.png" },
  7: { name: "Lavender Dreams", price: "$60.00", image: "../png/lavender.jpg" },
  8: { name: "Pink Peony Collection", price: "$75.00", image: "../png/peony.jfif" },
  9: { name: "Wildflower Medley", price: "$40.00", image: "../png/wild.jfif" },
  10: { name: "Classic Red Roses", price: "$80.00", image: "../png/rose.jfif" },
  11: { name: "Sunset Bouquet", price: "$55.00", image: "../png/sunset.jfif" },
  12: { name: "Garden Romance", price: "$65.00", image: "../png/garden.jfif" }
};

// Initialize search functionality
function initSearch() {
  const searchIcon = document.querySelector('.header-icons .icon:first-child');
  
  if (searchIcon) {
    searchIcon.style.cursor = 'pointer';
    searchIcon.addEventListener('click', openSearchModal);
  }
}

// Open search modal
function openSearchModal() {
  // Remove existing modal if any
  const existingModal = document.getElementById('search-modal');
  if (existingModal) {
    existingModal.remove();
  }

  // Create modal HTML
  const modalHTML = `
    <div id="search-modal" class="search-modal">
      <div class="search-modal-content">
        <div class="search-header">
          <h2>Search Products</h2>
          <button class="search-close" onclick="closeSearchModal()">&times;</button>
        </div>
        <div class="search-input-wrapper">
          <input 
            type="text" 
            id="search-input" 
            class="search-input" 
            placeholder="Search for flowers, bouquets..." 
            autocomplete="off"
          >
          <svg class="search-icon-input" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
        <div id="search-results" class="search-results"></div>
      </div>
    </div>
  `;

  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Add styles
  addSearchStyles();

  // Focus on input
  const searchInput = document.getElementById('search-input');
  setTimeout(() => searchInput.focus(), 100);

  // Add event listener for real-time search
  searchInput.addEventListener('input', handleSearch);

  // Show all products initially
  displaySearchResults(Object.keys(productsDatabase));
}

// Close search modal
function closeSearchModal() {
  const modal = document.getElementById('search-modal');
  if (modal) {
    modal.remove();
  }
}

// Handle search input
function handleSearch(e) {
  const query = e.target.value.toLowerCase().trim();
  
  if (query === '') {
    // Show all products if search is empty
    displaySearchResults(Object.keys(productsDatabase));
    return;
  }

  // Filter products
  const results = Object.keys(productsDatabase).filter(id => {
    const product = productsDatabase[id];
    return product.name.toLowerCase().includes(query);
  });

  displaySearchResults(results);
}

// Display search results
function displaySearchResults(productIds) {
  const resultsContainer = document.getElementById('search-results');
  
  if (productIds.length === 0) {
    resultsContainer.innerHTML = `
      <div class="no-results">
        <p>No products found</p>
      </div>
    `;
    return;
  }

  const resultsHTML = productIds.map(id => {
    const product = productsDatabase[id];
    return `
      <div class="search-result-item" onclick="goToProductFromSearch(${id})">
        <div class="search-result-image" style="background-image: url('${product.image}')"></div>
        <div class="search-result-info">
          <div class="search-result-name">${product.name}</div>
          <div class="search-result-price">${product.price}</div>
        </div>
      </div>
    `;
  }).join('');

  resultsContainer.innerHTML = resultsHTML;
}

// Navigate to product from search
function goToProductFromSearch(productId) {
  window.location.href = `../html/product-detail.html?id=${productId}`;
}

// Add styles for search modal
function addSearchStyles() {
  if (document.getElementById('search-styles')) return;

  const styles = `
    <style id="search-styles">
      .search-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding-top: 80px;
        z-index: 10000;
        animation: fadeIn 0.2s ease;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .search-modal-content {
        background: white;
        width: 90%;
        max-width: 600px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        animation: slideDown 0.3s ease;
      }

      @keyframes slideDown {
        from { transform: translateY(-30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }

      .search-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #eee;
      }

      .search-header h2 {
        margin: 0;
        font-size: 24px;
        color: #333;
        font-family: 'Playfair Display', serif;
      }

      .search-close {
        background: none;
        border: none;
        font-size: 32px;
        color: #666;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;
      }

      .search-close:hover {
        color: #333;
      }

      .search-input-wrapper {
        position: relative;
        padding: 20px 24px;
        border-bottom: 1px solid #eee;
      }

      .search-input {
        width: 100%;
        padding: 14px 45px 14px 16px;
        font-size: 16px;
        border: 2px solid #ddd;
        border-radius: 8px;
        outline: none;
        transition: border-color 0.2s;
        font-family: 'Public Sans', sans-serif;
      }

      .search-input:focus {
        border-color: #7c5c4e;
      }

      .search-icon-input {
        position: absolute;
        right: 36px;
        top: 50%;
        transform: translateY(-50%);
        width: 20px;
        height: 20px;
        pointer-events: none;
      }

      .search-results {
        overflow-y: auto;
        max-height: calc(80vh - 180px);
        padding: 16px 24px;
      }

      .search-result-item {
        display: flex;
        gap: 16px;
        padding: 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.2s;
        margin-bottom: 8px;
      }

      .search-result-item:hover {
        background-color: #f5f5f5;
      }

      .search-result-image {
        width: 80px;
        height: 80px;
        border-radius: 8px;
        background-size: cover;
        background-position: center;
        flex-shrink: 0;
      }

      .search-result-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 6px;
      }

      .search-result-name {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        font-family: 'Public Sans', sans-serif;
      }

      .search-result-price {
        font-size: 18px;
        font-weight: 700;
        color: #7c5c4e;
        font-family: 'Plus Jakarta Sans', sans-serif;
      }

      .no-results {
        text-align: center;
        padding: 40px 20px;
        color: #999;
      }

      .no-results p {
        font-size: 16px;
        margin: 0;
      }

      /* Close modal when clicking outside */
      .search-modal {
        cursor: pointer;
      }

      .search-modal-content {
        cursor: default;
      }
    </style>
  `;

  document.head.insertAdjacentHTML('beforeend', styles);

  // Close modal when clicking outside
  document.getElementById('search-modal').addEventListener('click', (e) => {
    if (e.target.id === 'search-modal') {
      closeSearchModal();
    }
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initSearch);

// Make functions globally available
window.closeSearchModal = closeSearchModal;
window.goToProductFromSearch = goToProductFromSearch;