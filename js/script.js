var foundMovies = [];
var PER_PAGE = 10;
var pageInNumber;
var currentPage = 1;

var elForm = $_('.js-search-form');

if (elForm) {
  var elTitleInput = $_('.js-search-form__title-input', elForm);
  var elGenreSelect = $_('.js-search-form__genre-select', elForm);
  var elSortSelect = $_('.js-search-form__sort-select', elForm);
}

var elResult = $_('.search-results');
var elCardTemplate = $_('#movie-card-template').content;
var elCounterLength = $_('.js-search-results-count');

var findMoviesCard = movie => {
  var cloneTemplate = elCardTemplate.cloneNode(true);

  $_('.movie__poster', cloneTemplate).src = movie.smallThumbnail;
  $_('.movie__poster', cloneTemplate).alt = `Poster of ${movie.title}`;
  $_('.movie__title', cloneTemplate).textContent = movie.title;
  $_('.js-movie-modal-opener', cloneTemplate).dataset.target = movie.imdbId;

  return cloneTemplate;
}

var displayMoviesCard = (data) => {

  var cardFragment = document.createDocumentFragment();

  elResult.innerHTML = '';
  data.forEach(movie => cardFragment.appendChild(findMoviesCard(movie)));

  elResult.appendChild(cardFragment);

}

var elNoResultsAlert = $_('.js-no-results-alert');
var pageTemplate = $_('#pagination-item-template').content;
var resultPagenation = $_('.pagination');

var searchWithFetch = movie => {
  fetch(`http://omdbapi.com/?apikey=11d5da55&s=${movie}`)
    .then(response => {
      if (response.status === 200) {
        return response.json();
      }
    }).then(checking => {
      if (checking.Response === 'True') {
        elCounterLength.textContent = checking.totalResults;
        displayPagination(Number(checking.totalResults));
        return checking.Search.map(movie => {
          return {
            title: movie.Title,
            smallThumbnail: movie.Poster,
            imdbId: movie.imdbID
          }
        });
      }
    }).then(result => {
      console.log(result);
      displayMoviesCard(result);
    });
}

var pageCounter = currentPage => {
  var begin = (currentPage - 1) * PER_PAGE;
  var end = begin + PER_PAGE;

  return foundMovies.slice(begin, end);
}

elForm.addEventListener('submit', evt => {
  evt.preventDefault();

  searchWithFetch(elTitleInput.value);

});


var displayPagination = movies => {
  pageInNumber = Math.ceil(movies / PER_PAGE);

  var pageFragment = document.createDocumentFragment();

  resultPagenation.innerHTML = '';
  for (let i = 1; i <= pageInNumber; i++) {
    var pageTemplateClone = pageTemplate.cloneNode(true);

    $_('.js-page-link', pageTemplateClone).textContent = i;
    $_('.js-page-link', pageTemplateClone).dataset.page = i;

    pageFragment.appendChild(pageTemplateClone);
  }

  resultPagenation.appendChild(pageFragment);

  resultPagenation.querySelector('.page-item').classList.add('active');
}


var pageOfOmdb = page => {
  fetch(`https://omdbapi.com/?apikey=11d5da55&s=${elTitleInput.value}&page=${page}`)
    .then(response => {
      if (response.status === 200) {
        return response.json();
      }
    }).then(checking => {
      if (checking.Response === 'True') {
        return checking.Search.map(movie => {
          return {
            title: movie.Title,
            smallThumbnail: movie.Poster,
            imdbId: movie.imdbID
          }
        });
      }
    }).then(result => {
      console.log(result);
      displayMoviesCard(result);
    });
}



resultPagenation.addEventListener('click', page => {
  if (page.target.matches('.js-page-link')) {
    page.preventDefault();

    currentPage = Number(page.target.dataset.page);

    displayMoviesCard(pageCounter(pageOfOmdb(currentPage)));

    resultPagenation.querySelectorAll('.page-item').forEach(page => page.classList.remove('active'));

    page.target.closest('.page-item').classList.add('active');
    window.scrollTo(0, 0);

  }
});

// Modal ma`lumotlarini sahifaga chiqarish

function showModalInfo(data) {
  var movieModalContent = $_('.movie-info-modal-dialog');

  $_('.movie-info-modal-title', movieModalContent).textContent = data.Title;
  $_('.movie-img', movieModalContent).src = data.Poster;
  $_('.movie-img', movieModalContent).alt = `This is poster of ${data.Title}`;
  $_('.movie-country', movieModalContent).textContent = data.Country;
  $_('.movie-year', movieModalContent).textContent = data.Year;
  $_('.movie-genre', movieModalContent).textContent = data.Genre;
  $_('.movie-director', movieModalContent).textContent = data.Director;
  $_('.movie-actors', movieModalContent).textContent = data.Actors;
  $_('.movie-runtime', movieModalContent).textContent = data.Runtime;
  $_('.movie-rating', movieModalContent).textContent = data.Rating;
  $_('.movie-budget', movieModalContent).textContent = data.BoxOffice;
  $_('.movie-production', movieModalContent).textContent = data.Production;
  $_('.movie-language', movieModalContent).textContent = data.Language;
  $_('.movie-awards', movieModalContent).textContent = data.Awards;
  $_('.movie-more-info', movieModalContent).textContent = data.Plot;

  return movieModalContent;
}

function openModalInfo(evt) {
  if (evt.target.matches('.js-movie-modal-opener')) {
    $_('.movie-info-modal').classList.remove('d-none');
    fetch(`http://omdbapi.com/?apikey=11d5da55&i=${evt.target.dataset.target}&plot=full`)
      .then(response => {
        if (response.status === 200) {
          return response.json();
        }
      })
      .then(result => {
        if (result.Response === 'True') {
          showModalInfo(result);
        }
      })
  }
}

elResult.addEventListener('click', openModalInfo);

function hideModalInfo() {
  $_('.movie-info-modal').classList.add('d-none');
}

$_('.hide-modal').addEventListener('click', hideModalInfo);

