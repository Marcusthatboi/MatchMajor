function loadNavbar() {
  const navbarPath = '../../components/UI/Navbar.html';

  fetch(navbarPath)
    .then(response => {
      if (!response.ok) throw new Error('Failed to load navbar');
      return response.text();
    })
    .then(html => {
      // Create a container for the navbar if it doesn't exist
      let navContainer = document.querySelector('#navbar-container');
      if (!navContainer) {
        navContainer = document.createElement('div');
        navContainer.id = 'navbar-container';
        document.body.insertBefore(navContainer, document.body.firstChild);
      }
      navContainer.innerHTML = html;
    })
    .catch(error => console.error('Error loading navbar:', error));

}

// Auto-load on document ready if data-auto-load attribute is present
document.addEventListener('DOMContentLoaded', () => {
  if (document.documentElement.getAttribute('data-auto-load-navbar') === 'true') {
    loadNavbar();
  }
});
