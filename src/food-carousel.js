const slides = [
  { image: '/images/promo-agua-ciel.png', title: 'Precio especial en agua Ciel', description: 'Complementa cualquier combo con una botella de agua de 1 litro.', eyebrow: 'Promoción de dulcería' },
  { image: '/images/promo-coca-cola-paloma.png', title: 'Destapa las emociones del fútbol', description: 'Agrega productos de la familia Coca-Cola a tu combo y conoce la palomera de edición especial.', eyebrow: 'Combo Coca-Cola' },
  { image: '/images/promo-arma-tu-combo.png', title: 'Arma tu combo', description: 'Elige el tamaño, las bebidas y los platillos para compartir.', eyebrow: 'Combos para compartir' },
  { image: '/images/promo-bagu-cochinita.png', title: 'Bagu de cochinita pibil', description: 'Descubre este bagu con cochinita, queso y acompañamientos.', eyebrow: 'Nuevo en dulcería' },
  { image: '/images/promo-empanadas.png', title: 'Deliciosas empanadas', description: 'Elige entre sabores de rajas con queso o carne.', eyebrow: 'Novedades del menú' },
  { image: '/images/promo-frappe-skwinkles.png', title: 'Frappe sabor sandía', description: 'Prueba el frappe de temporada con sabor a sandía y Skwinkles Chunks.', eyebrow: 'El sabor del verano' },
  { image: '/images/promo-combo-hamburguesa.png', title: 'Combo hamburguesa', description: 'Hamburguesa con queso, papas twister y refresco jumbo.', eyebrow: 'Nuevo combo' },
  { image: '/images/promo-icee-tajin.png', title: 'ICEE Tajín', description: 'Disfruta ICEE con sabor a Tajín. Incluye un sobre de Tajín.', eyebrow: 'Nuevo en dulcería' },
];

const carousel = document.querySelector('#foodPromoCarousel');
if (carousel) {
  const image = document.querySelector('#foodPromoImage');
  const title = document.querySelector('#foodPromoTitle');
  const description = document.querySelector('#foodPromoDescription');
  const eyebrow = document.querySelector('#foodPromoEyebrow');
  const dots = document.querySelector('#foodPromoDots');
  const previous = document.querySelector('#foodPromoPrevious');
  const next = document.querySelector('#foodPromoNext');
  let activeSlide = 0;
  let intervalId;

  const render = (index) => {
    activeSlide = (index + slides.length) % slides.length;
    const slide = slides[activeSlide];
    image.src = slide.image;
    image.alt = `Anuncio de alimentos: ${slide.eyebrow}`;
    title.textContent = slide.title;
    description.textContent = slide.description;
    eyebrow.textContent = slide.eyebrow;
    [...dots.children].forEach((dot, dotIndex) => {
      dot.setAttribute('aria-current', String(dotIndex === activeSlide));
    });
  };

  slides.forEach((slide, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Ver anuncio: ${slide.eyebrow}`);
    dot.setAttribute('aria-current', String(index === activeSlide));
    dot.addEventListener('click', () => { render(index); start(); });
    dots.append(dot);
  });

  const stop = () => window.clearInterval(intervalId);
  const start = () => {
    stop();
    if (!document.hidden) intervalId = window.setInterval(() => render(activeSlide + 1), 6500);
  };
  previous.addEventListener('click', () => { render(activeSlide - 1); start(); });
  next.addEventListener('click', () => { render(activeSlide + 1); start(); });
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  render(activeSlide);
  start();
}
