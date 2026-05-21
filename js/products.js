// Логика фильтрации и отображения товаров

// Текущее состояние фильтров
let currentCategory = 'all';
let currentSort = 'default';
let searchQuery = '';

// Форматируем цену - добавляем пробелы как разделители тысяч и знак рубля
function formatPrice(price) {
  return price.toLocaleString('ru-RU') + ' сом';
}

// Рисуем звёздочки рейтинга
function renderStars(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars += '<span class="star filled">★</span>';
    } else if (i - 0.5 <= rating) {
      stars += '<span class="star half">★</span>';
    } else {
      stars += '<span class="star">★</span>';
    }
  }
  return stars;
}

// Фильтруем товары по категории и поисковому запросу
function filterProducts() {
  let result = [...products]; // копия чтобы оригинал не трогать

  // Фильтр по категории
  if (currentCategory !== 'all') {
    result = result.filter(p => p.category === currentCategory);
  }

  // Фильтр по поиску (ищем по названию и описанию)
  if (searchQuery.trim() !== '') {
    const query = searchQuery.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );
  }

  return result;
}

// Сортируем товары
function sortProducts(items) {
  const sorted = [...items];

  if (currentSort === 'price-asc') {
    sorted.sort((a, b) => a.price - b.price);
  } else if (currentSort === 'price-desc') {
    sorted.sort((a, b) => b.price - a.price);
  } else if (currentSort === 'rating') {
    sorted.sort((a, b) => b.rating - a.rating);
  } else if (currentSort === 'popular') {
    sorted.sort((a, b) => b.reviewCount - a.reviewCount);
  }

  return sorted;
}

// Создаём HTML карточки товара
function createProductCard(product) {
  // Считаем скидку если есть старая цена
  let discountBadge = '';
  if (product.oldPrice) {
    const discount = Math.round((1 - product.price / product.oldPrice) * 100);
    discountBadge = `<span class="discount-badge">-${discount}%</span>`;
  }

  // Кнопка добавления в корзину
  const cartBtn = product.inStock
    ? `<button class="btn-add-cart" onclick="addToCart(${product.id})">В корзину</button>`
    : `<button class="btn-add-cart out-of-stock" disabled>Нет в наличии</button>`;

  return `
    <div class="product-card" data-id="${product.id}">
      <div class="card-image-wrap">
        <img src="${product.image}" alt="${product.name}" class="card-image" loading="lazy" />
        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
        ${discountBadge}
        <button class="btn-wishlist" onclick="toggleWishlist(${product.id}, this)" title="В избранное">♡</button>
      </div>
      <div class="card-body">
        <p class="card-description">${product.description}</p>
        <h3 class="card-title">${product.name}</h3>
        <div class="card-rating">
          ${renderStars(product.rating)}
          <span class="review-count">(${product.reviewCount})</span>
        </div>
        <div class="card-price-block">
          <span class="card-price">${formatPrice(product.price)}</span>
          ${product.oldPrice ? `<span class="card-old-price">${formatPrice(product.oldPrice)}</span>` : ''}
        </div>
        ${cartBtn}
      </div>
    </div>
  `;
}

// Отрисовываем список товаров на страницу
function renderProducts() {
  const grid = document.getElementById('products-grid');
  const countEl = document.getElementById('products-count');

  if (!grid) return;

  // Фильтруем и сортируем
  let filtered = filterProducts();
  let sorted = sortProducts(filtered);

  // Обновляем счётчик найденных товаров
  if (countEl) {
    countEl.textContent = `Найдено: ${sorted.length} товаров`;
  }

  // Если ничего не нашли - показываем заглушку
  if (sorted.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <div class="no-results-icon">🔍</div>
        <p>Ничего не нашлось</p>
        <span>Попробуйте изменить фильтры или поисковый запрос</span>
        <button onclick="resetFilters()">Сбросить фильтры</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = sorted.map(product => createProductCard(product)).join('');
}

// Переключаем категорию
function setCategory(categoryId) {
  currentCategory = categoryId;

  // Обновляем активную кнопку в сайдбаре
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.cat === categoryId) {
      btn.classList.add('active');
    }
  });

  renderProducts();
}

// Сброс всех фильтров
function resetFilters() {
  currentCategory = 'all';
  currentSort = 'default';
  searchQuery = '';
  
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) sortSelect.value = 'default';

  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cat === 'all');
  });

  renderProducts();
}

// Рисуем кнопки категорий в сайдбаре
function renderCategories() {
  const sidebar = document.getElementById('categories-list');
  if (!sidebar) return;

  sidebar.innerHTML = categories.map(cat => `
    <button 
      class="category-btn ${cat.id === 'all' ? 'active' : ''}"
      data-cat="${cat.id}"
      onclick="setCategory('${cat.id}')"
    >
      <span class="cat-icon">${cat.icon}</span>
      <span class="cat-label">${cat.label}</span>
    </button>
  `).join('');
}

// Избранное - просто в localStorage
let wishlist = JSON.parse(localStorage.getItem('techshop_wishlist')) || [];

function toggleWishlist(productId, btn) {
  const index = wishlist.indexOf(productId);
  
  if (index === -1) {
    wishlist.push(productId);
    btn.textContent = '♥';
    btn.classList.add('wishlisted');
  } else {
    wishlist.splice(index, 1);
    btn.textContent = '♡';
    btn.classList.remove('wishlisted');
  }
  
  localStorage.setItem('techshop_wishlist', JSON.stringify(wishlist));
}