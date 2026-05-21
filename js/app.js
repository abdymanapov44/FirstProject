// Главный файл - запускаем всё когда страница загрузилась

document.addEventListener('DOMContentLoaded', function() {
  // Рисуем категории в сайдбаре
  renderCategories();
  
  // Рисуем товары
  renderProducts();
  
  // Обновляем счётчик корзины из localStorage
  updateCartUI();

  // Вешаем слушатель на поиск
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    // Маленькая задержка чтобы не делать поиск на каждую букву
    let searchTimer = null;
    
    searchInput.addEventListener('input', function() {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        searchQuery = this.value;
        renderProducts();
      }, 300);
    });
  }

  // Слушаем изменение сортировки
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', function() {
      currentSort = this.value;
      renderProducts();
    });
  }

  // Клик по оверлею закрывает корзину
  const overlay = document.getElementById('overlay');
  if (overlay) {
    overlay.addEventListener('click', function() {
      toggleCart();
    });
  }

  // Закрываем корзину на Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const modal = document.getElementById('cart-modal');
      if (modal && modal.classList.contains('open')) {
        toggleCart();
      }
    }
  });

  // Бургер меню для мобилок
  const burgerBtn = document.getElementById('burger-btn');
  const sidebar = document.getElementById('sidebar');

  if (burgerBtn && sidebar) {
    burgerBtn.addEventListener('click', function() {
      sidebar.classList.toggle('sidebar-open');
    });
  }

  // Кнопка наверх
  const toTopBtn = document.getElementById('to-top');
  
  if (toTopBtn) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 400) {
        toTopBtn.classList.add('visible');
      } else {
        toTopBtn.classList.remove('visible');
      }
    });

    toTopBtn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  console.log('TechShop запущен! 🚀');
});