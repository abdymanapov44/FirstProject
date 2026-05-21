// Корзина - тут хранится всё что пользователь хочет купить

// Загружаем корзину из localStorage если там что-то есть
// Иначе начинаем с пустого массива
let cart = JSON.parse(localStorage.getItem('techshop_cart')) || [];

// Сохраняем корзину в localStorage чтобы при обновлении страницы всё сохранилось
function saveCart() {
  localStorage.setItem('techshop_cart', JSON.stringify(cart));
}

// Добавить товар в корзину
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  
  if (!product) return;
  if (!product.inStock) return; // нельзя добавить если нет в наличии

  // Проверяем есть ли уже такой товар в корзине
  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    // Если есть - просто увеличиваем количество
    existingItem.quantity += 1;
  } else {
    // Если нет - добавляем новый
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }

  saveCart();
  updateCartUI();
  showCartNotification(product.name);
}

// Убрать товар из корзины
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartUI();
  renderCartModal();
}

// Изменить количество товара
function changeQuantity(productId, delta) {
  const item = cart.find(item => item.id === productId);
  
  if (!item) return;

  item.quantity += delta;

  // Если количество стало 0 или меньше - удаляем товар
  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  saveCart();
  updateCartUI();
  renderCartModal();
}

// Очистить всю корзину
function clearCart() {
  cart = [];
  saveCart();
  updateCartUI();
  renderCartModal();
}

// Считаем общее количество товаров в корзине (учитываем количество каждого)
function getTotalCount() {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

// Считаем общую сумму
function getTotalPrice() {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

// Обновляем шапку - счётчик товаров
function updateCartUI() {
  const count = getTotalCount();
  const badge = document.getElementById('cart-badge');
  
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  // Если модалка открыта - обновляем и её
  const modal = document.getElementById('cart-modal');
  if (modal && modal.classList.contains('open')) {
    renderCartModal();
  }
}

// Показываем уведомление когда товар добавлен
function showCartNotification(productName) {
  // Удаляем старое уведомление если есть
  const old = document.querySelector('.cart-notification');
  if (old) old.remove();

  const note = document.createElement('div');
  note.className = 'cart-notification';
  note.innerHTML = `
    <span class="note-icon">✓</span>
    <span class="note-text">${productName} добавлен в корзину</span>
  `;
  
  document.body.appendChild(note);

  // Через 2.5 секунды убираем
  setTimeout(() => {
    note.classList.add('hiding');
    setTimeout(() => note.remove(), 300);
  }, 2500);
}

// Рисуем содержимое модалки корзины
function renderCartModal() {
  const body = document.getElementById('cart-body');
  const footer = document.getElementById('cart-footer');

  if (!body) return;

  if (cart.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <div class="empty-icon">🛒</div>
        <p>Корзина пуста</p>
        <span>Добавьте товары которые вам понравились</span>
      </div>
    `;
    footer.innerHTML = '';
    return;
  }

  // Рисуем каждый товар в корзине
  body.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">${formatPrice(item.price)}</p>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="changeQuantity(${item.id}, -1)">−</button>
        <span class="qty-value">${item.quantity}</span>
        <button class="qty-btn" onclick="changeQuantity(${item.id}, 1)">+</button>
      </div>
      <button class="remove-btn" onclick="removeFromCart(${item.id})">✕</button>
    </div>
  `).join('');

  // Итоги внизу
  footer.innerHTML = `
    <div class="cart-total">
      <span>Итого (${getTotalCount()} товара):</span>
      <strong>${formatPrice(getTotalPrice())}</strong>
    </div>
    <div class="cart-actions">
      <button class="btn-clear" onclick="clearCart()">Очистить</button>
      <button class="btn-checkout" onclick="handleCheckout()">Оформить заказ</button>
    </div>
  `;
}

// Открыть/закрыть корзину
function toggleCart() {
  const modal = document.getElementById('cart-modal');
  const overlay = document.getElementById('overlay');

  if (!modal) return;

  const isOpen = modal.classList.contains('open');

  if (isOpen) {
    modal.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  } else {
    renderCartModal();
    modal.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // чтобы страница не скроллилась
  }
}

// Оформление заказа - просто показываем сообщение
function handleCheckout() {
  if (cart.length === 0) return;
  
  alert(`Заказ на сумму ${formatPrice(getTotalPrice())} успешно оформлен! 🎉\n\nМы позвоним вам в течение 30 минут.`);
  clearCart();
  toggleCart();
}