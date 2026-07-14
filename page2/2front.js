const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('primaryNav');
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
  });
  document.querySelectorAll('nav.main a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => nav.classList.remove('open'));
  });