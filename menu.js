document.addEventListener('DOMContentLoaded', function() {
  const menuContainer = document.querySelector('.menu-container');
  const genreItems = document.querySelectorAll('.genre-item');

  genreItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const genre = this.dataset.genre;
      

      menuContainer.classList.add('slide-out');
      

      setTimeout(() => {
        window.location.href = `songs.html?genre=${genre}`;
      }, 600);
    });
  });
});
