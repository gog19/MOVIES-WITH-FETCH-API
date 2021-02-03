var foundMovies = [];
var PER_PAGE = 10;
var pageInNumber;
var generalTotalResults;
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

  $_('.movie__title', cloneTemplate).textContent = movie.title;
  $_('.js-movie-modal-opener', cloneTemplate).dataset.target = movie.imdbId;

  return cloneTemplate;
}

var displayMoviesCard = (data) => {

  var cardFragment = document.createDocumentFragment();

  elResult.innerHTML = '';
  data.forEach(movie => cardFragment.appendChild(findMoviesCard(movie)));

  elResult.appendChild(cardFragment);

  // document.querySelector('.list-group-item').classList.add('active-item');

}

var elNoResultsAlert = $_('.js-no-results-alert');
var pageTemplate = $_('#pagination-item-template').content;
var resultPagenation = $_('.pagination');

var searchWithFetch = movie => {
  fetch(`https://omdbapi.com/?apikey=11d5da55&s=${movie}`)
    .then(response => {
      if (response.status === 200) {
        return response.json();
      }
    }).then(checking => {
      if (checking.Response === 'True') {
        $_('.full-content-wrapper').classList.add('d-block');
        $_('.initial-alert').classList.add('d-none');
        generalTotalResults = checking.totalResults;
        elCounterLength.textContent = checking.totalResults;
        displayPagination(Number(checking.totalResults));
        document.querySelector('.error-alert').classList.remove('d-block');
        document.querySelector('.pagination').classList.remove('d-none');
        document.querySelector('.pagination').classList.add('d-flex');
        return checking.Search.map(movie => {
          return {
            title: movie.Title,
            smallThumbnail: movie.Poster,
            imdbId: movie.imdbID
          }
        });
      }
    }).then(result => {
      displayMoviesCard(result);
      openFullInfo(result[0].imdbId);
      if (result[0].title === document.querySelector('.movie__title').textContent) {
        document.querySelector('.list-group-item').classList.add('active-item');
      }
    })
    .catch(reject => {
      console.log(`Error: ${reject}`);
      if (reject) {
        document.querySelector('.error-alert').classList.add('d-block');
        $_('.full-content-wrapper').classList.remove('d-block');
        document.querySelector('.pagination').classList.add('d-none');
        document.querySelector('.pagination').classList.remove('d-flex');
        $_('.initial-alert').classList.add('d-none');
        elCounterLength.textContent = 0;
        $_('.dropdown').classList.add('d-none');
      }
    })
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

var displayPaginationWithCount = () => {

  showPaginationResult(10);

  document.querySelector('.page-item').classList.add('active');

}

function displayPagination(movies) {
  pageInNumber = Math.ceil(movies / PER_PAGE);

  if (pageInNumber < 10) {

    showPaginationResult(pageInNumber);

  } else if (pageInNumber > 10) {
    displayPaginationWithCount();
    $_('.dropdown').classList.remove('d-none');
    displayRestPages(generalTotalResults);
  }

  resultPagenation.querySelectorAll('.page-item').forEach(page => {
    page.classList.remove('active');
  });


  resultPagenation.querySelector('.page-item').classList.add('active');
}

function showPaginationResult(number) {
  var pageFragment = document.createDocumentFragment();
  resultPagenation.innerHTML = '';
  for (let i = 1; i <= number; i++) {
    var pageTemplateClone = pageTemplate.cloneNode(true);

    $_('.js-page-link', pageTemplateClone).textContent = i;
    $_('.js-page-link', pageTemplateClone).dataset.page = i;

    pageFragment.appendChild(pageTemplateClone);
  }

  resultPagenation.appendChild(pageFragment);
}


var dropdownMenu = document.querySelector('.dropdown-menu')

function displayRestPages(number) {

  for (let i = 11; i <= Math.ceil(number / PER_PAGE); i++) {

    var linkofPage = document.createElement('a');
    linkofPage.textContent = i;
    linkofPage.dataset.id = i;
    linkofPage.href = '#';
    linkofPage.className = 'dropdown-item';

    dropdownMenu.appendChild(linkofPage);
  }
}

dropdownMenu.addEventListener('click', evt => {
  if (evt.target.matches('.dropdown-item')) {
    resultPagenation.querySelectorAll('.page-item').forEach(page => {
      page.classList.remove('active');
    });

    dropdownMenu.querySelectorAll('.dropdown-item').forEach(item => {
      item.classList.remove('active');
    });

    evt.target.classList.add('active');

    pageOfOmdb(Number(evt.target.dataset.id));

  }
});

function pageOfOmdb(page) {
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
      displayMoviesCard(result);
      openFullInfo(result[0].imdbId);
      if (result[0].title === document.querySelector('.movie__title').textContent) {
        document.querySelector('.list-group-item').classList.add('active-item');
      }
    });
}


resultPagenation.addEventListener('click', page => {
  if (page.target.matches('.js-page-link')) {
    page.preventDefault();


    currentPage = Number(page.target.dataset.page);

    displayMoviesCard(pageCounter(pageOfOmdb(currentPage)));

    document.querySelectorAll('.page-item').forEach(page => page.classList.remove('active'));


    dropdownMenu.querySelectorAll('.dropdown-item').forEach(item => {
      item.classList.remove('active');
    });

    page.target.closest('.page-item').classList.add('active');
    window.scrollTo(0, 0);

  }
});

// Modal ma`lumotlarini sahifaga chiqarish

function showFullInfo(movie) {
  var fullContentWrapper = $_('.full-content-wrapper');

  $_('.movie-info-title', fullContentWrapper).textContent = movie.Title;
  $_('.movie-img', fullContentWrapper).src = movie.Poster;
  $_('.movie-img', fullContentWrapper).alt = `This is poster of ${movie.Title}`;
  $_('.movie-country', fullContentWrapper).textContent = movie.Country;
  $_('.movie-year', fullContentWrapper).textContent = movie.Year;
  $_('.movie-genre', fullContentWrapper).textContent = movie.Genre;
  $_('.movie-director', fullContentWrapper).textContent = movie.Director;
  $_('.movie-actors', fullContentWrapper).textContent = movie.Actors;
  $_('.movie-runtime', fullContentWrapper).textContent = movie.Runtime;
  $_('.movie-rating', fullContentWrapper).textContent = movie.imdbRating;
  $_('.movie-budget', fullContentWrapper).textContent = movie.BoxOffice;
  $_('.movie-production', fullContentWrapper).textContent = movie.Production;
  $_('.movie-language', fullContentWrapper).textContent = movie.Language;
  $_('.movie-awards', fullContentWrapper).textContent = movie.Awards;
  $_('.movie-more-info', fullContentWrapper).textContent = movie.Plot;

  return fullContentWrapper;
}

function openFullInfo(evt) {
  fetch(`https://omdbapi.com/?apikey=11d5da55&i=${evt}&plot=full`)
    .then(response => {
      if (response.status === 200) {
        return response.json();
      }
    })
    .then(result => {
      if (result.Response === 'True') {
        showFullInfo(result);
      }
    })
}

elResult.addEventListener('click', evt => {
  if (evt.target.matches('.js-movie-modal-opener')) {
    openFullInfo(evt.target.dataset.target);
    document.querySelectorAll('.list-group-item').forEach(item => {
      item.classList.remove('active-item');
    })

    evt.target.parentElement.parentElement.classList.add('active-item');
  }
});