const groups = [];
const cart = new Map();
let selectedProduct = null;

const nav = document.querySelector('#foodCategoryNav');
const catalog = document.querySelector('#foodCatalog');
const status = document.querySelector('#foodStatus');
const search = document.querySelector('#foodSearch');
const productDialog = document.querySelector('#foodProductDialog');
const cartPanel = document.querySelector('#foodCartPanel');

function showToast(message) {
  const toast = document.querySelector('#foodToast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2400);
}

function updateCart() {
  const count = [...cart.values()].reduce((sum, item) => sum + item.count, 0);
  document.querySelector('#foodCartCount').textContent = count;
  const list = document.querySelector('#foodCartItems');
  list.replaceChildren();
  document.querySelector('#foodCartEmpty').hidden = cart.size > 0;
  document.querySelector('#foodCartLabel').textContent = `Alimentos (${count})`;
  if (!cart.size) {
    return;
  }
  cart.forEach(({ product, count: quantity }) => {
    const row = document.createElement('div');
    row.className = 'cart-row';
    const name = document.createElement('span');
    name.textContent = `${product.name} × ${quantity}`;
    const less = document.createElement('button');
    less.type = 'button';
    less.textContent = '−';
    less.setAttribute('aria-label', `Quitar uno de ${product.name}`);
    less.addEventListener('click', () => decrement(product.name));
    const more = document.createElement('button');
    more.type = 'button';
    more.textContent = '+';
    more.setAttribute('aria-label', `Agregar uno de ${product.name}`);
    more.addEventListener('click', () => addProduct(product));
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove';
    remove.textContent = 'Quitar';
    remove.addEventListener('click', () => {
      cart.delete(product.name);
      updateCart();
    });
    row.append(name, less, more, remove);
    list.append(row);
  });
}

function addProduct(product) {
  const item = cart.get(product.name) || { product, count: 0 };
  item.count += 1;
  cart.set(product.name, item);
  updateCart();
  showToast(`${product.name} agregado al carrito de muestra`);
}

function decrement(name) {
  const item = cart.get(name);
  if (!item) return;
  if (item.count <= 1) cart.delete(name);
  else item.count -= 1;
  updateCart();
}

function openDetails(product) {
  selectedProduct = product;
  document.querySelector('#foodDetailImage').src = product.image;
  document.querySelector('#foodDetailImage').alt = product.name;
  document.querySelector('#foodDetailTitle').textContent = product.name;
  document.querySelector('#foodDetailCategory').textContent = product.category;
  productDialog.showModal();
}

function renderMenu() {
  nav.replaceChildren();
  catalog.replaceChildren();
  for (const category of groups) {
    const categoryLink = document.createElement('a');
    categoryLink.href = `#food-${category.slug}`;
    categoryLink.textContent = category.name;
    nav.append(categoryLink);

    const section = document.createElement('section');
    section.className = 'group';
    section.id = `food-${category.slug}`;
    const heading = document.createElement('h3');
    heading.textContent = category.name;
    section.append(heading);

    const grid = document.createElement('div');
    grid.className = 'products';
    for (const product of category.products) {
      product.category = category.name;
      const card = document.createElement('article');
      card.className = 'product';
      card.dataset.name = product.name.toLocaleLowerCase('es-MX');
      const visual = document.createElement('div');
      visual.className = 'product-visual';
      const image = document.createElement('img');
      image.src = product.image;
      image.alt = `${product.name} · imagen de referencia`;
      image.loading = 'lazy';
      image.onerror = () => { image.remove(); visual.textContent = '🍿'; };
      visual.append(image);

      const info = document.createElement('div');
      info.className = 'product-info';
      const title = document.createElement('h4');
      title.textContent = product.name;
      const actions = document.createElement('div');
      actions.className = 'product-actions';
      const details = document.createElement('button');
      details.type = 'button';
      details.className = 'details';
      details.textContent = 'Detalles';
      details.addEventListener('click', () => openDetails(product));
      const add = document.createElement('button');
      add.type = 'button';
      add.className = 'add';
      add.textContent = 'Agregar';
      add.addEventListener('click', () => addProduct(product));
      actions.append(details, add);
      info.append(title, actions);
      card.append(visual, info);
      grid.append(card);
    }
    section.append(grid);
    catalog.append(section);
  }
  const total = groups.reduce((sum, group) => sum + group.products.length, 0);
  status.textContent = `${total} productos · Imágenes del menú público de referencia. Precios y existencia varían por cine.`;
}

search.addEventListener('input', () => {
  const query = search.value.trim().toLocaleLowerCase('es-MX');
  let matches = 0;
  document.querySelectorAll('.product').forEach((card) => {
    const visible = card.dataset.name.includes(query);
    card.hidden = !visible;
    if (visible) matches += 1;
  });
  document.querySelectorAll('.group').forEach((section) => {
    section.hidden = !section.querySelector('.product:not([hidden])');
  });
  status.textContent = query
    ? `${matches} producto${matches === 1 ? '' : 's'} coincide${matches === 1 ? '' : 'n'} con la búsqueda. Precios y existencia varían por cine.`
    : `${groups.reduce((sum, group) => sum + group.products.length, 0)} productos · Imágenes del menú público de referencia. Precios y existencia varían por cine.`;
});

document.querySelector('#foodCartButton').addEventListener('click', () => {
  updateCart();
  cartPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
  cartPanel.classList.add('cart-highlight');
  setTimeout(() => cartPanel.classList.remove('cart-highlight'), 900);
});
document.querySelector('#foodDetailAdd').addEventListener('click', () => {
  if (selectedProduct) addProduct(selectedProduct);
  productDialog.close();
});
document.querySelectorAll('[data-close]').forEach((button) => {
  button.addEventListener('click', () => button.closest('dialog').close());
});
document.querySelectorAll('dialog').forEach((dialog) => {
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
});

try {
  const response = await fetch('/api/v1/mx/food.json');
  if (!response.ok) throw new Error('El catálogo no está disponible');
  const data = await response.json();
  groups.push(...data.categories);
  renderMenu();
} catch {
  status.textContent = 'No se pudo cargar el menú. Intenta recargar la página.';
}
