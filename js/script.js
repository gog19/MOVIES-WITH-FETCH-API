var foundMovies = [];
var PER_PAGE = 9;
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
  $_('.js-movie-bookmark', cloneTemplate).dataset.imdbId = movie.imdbID;
  $_('.movie__title', cloneTemplate).textContent = movie.title;

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
            imdbID: movie.imdbID
          }
        });
      }
    }).then(result => {
      result.forEach(movie => {
        foundMovies.push(movie)
      })
      console.log(foundMovies);
      displayMoviesCard(foundMovies);
    });
}

elForm.addEventListener('submit', evt => {
  evt.preventDefault();

  searchWithFetch(elTitleInput.value);

});

var pagenationCounter = pageNumber => {
  var begin = (pageNumber - 1) * PER_PAGE;
  var end = begin + PER_PAGE;

  return foundMovies.slice(begin, end);
}

var prevBtn = $_('.js-page-link-prev');
var nextBtn = $_('.js-page-link-next');

var displayPagination = movies => {
  pageInNumber = Math.ceil(movies / PER_PAGE);

  prevBtn.classList.add('d-none');
  nextBtn.classList.add('d-none');

  if (pageInNumber > 2) {
    prevBtn.classList.remove('d-none');
    nextBtn.classList.remove('d-none');
  }

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
  fetch(`http://omdbapi.com/?apikey=11d5da55&s=${elTitleInput.value}&page=${page}`)
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
        })
      }
    }).then(result => {
      result.forEach(movie => {

        foundMovies.push(movie);
      })
      console.log(foundMovies);
      displayMoviesCard(foundMovies);
    });
}



resultPagenation.addEventListener('click', page => {
  if (page.target.matches('.js-page-link')) {
    page.preventDefault();

    currentPage = Number(page.target.dataset.page);

    displayMoviesCard(pagenationCounter(pageOfOmdb(currentPage)));

    resultPagenation.querySelectorAll('.page-item').forEach(page => page.classList.remove('active'));

    page.target.closest('.page-item').classList.add('active');
    window.scrollTo(0, 0);

  }
});

var clickingPrevBtn = prev => {
  if (currentPage > 1) {
    currentPage -= 1;

    resultPagenation.querySelectorAll('.page-item').forEach(page => {
      page.classList.remove('active');
      if (currentPage === Number(page.textContent)) {
        page.classList.add('active');
      }
    });
  }

  displayMoviesCard(pagenationCounter(pageOfOmdb(currentPage)));

}

prevBtn.addEventListener('click', clickingPrevBtn);
var clickingNextBtn = next => {
  currentPage += 1;
  displayMoviesCard(pagenationCounter(pageOfOmdb(currentPage)));

  resultPagenation.querySelectorAll('.page-item').forEach(page => {
    page.classList.remove('active');
    if (currentPage === Number(page.textContent)) {
      page.classList.add('active');
    }
  });
}

nextBtn.addEventListener('click', clickingNextBtn);

var count = 0;
var bookmarkResult = $_('.bookmark-result');
var counterOfBookmark = $_('.counter-num');
var bookmarkArray = JSON.parse(localStorage.getItem('bookmark')) || [];
var bookmarkTemplate = $_('#bookmarked-movie-template').content;
var bookmarkFragment = document.createDocumentFragment();


function addBookmark(data) {
  bookmarkResult.innerHTML = '';
  data.forEach(movie => {
    var cloneBookmarkTemp = bookmarkTemplate.cloneNode(true);

    $_('.movie__poster', cloneBookmarkTemp).src = movie.smallThumbnail;
    $_('.movie__poster', cloneBookmarkTemp).alt = `Poster of ${movie.title}`;
    $_('.js-movie-bookmark', cloneBookmarkTemp).dataset.imdbId = movie.imdbID;
    $_('.movie__title', cloneBookmarkTemp).textContent = movie.title;

    bookmarkFragment.appendChild(cloneBookmarkTemp);
  });

  bookmarkResult.appendChild(bookmarkFragment);
}

function findBookmarkElement(evt) {
  if (evt.target.matches('.js-movie-bookmark')) {
    var findBookmarkElement = foundMovies.find(movie => {
      return movie.imdbID === evt.target.dataset.imdbId;
    });

    console.log(findBookmarkElement);

    if (!bookmarkArray.includes(findBookmarkElement)) {
      bookmarkArray.push(findBookmarkElement);
      console.log(bookmarkArray);
      count++;
      counterOfBookmark.textContent = count;
    }

    addBookmark(bookmarkArray);
  }
}

elResult.addEventListener('click', findBookmarkElement);

var bookmarkCounter = $_('.bookmark-counter');

function openBookmarkSection() {

  $_('.search-results-bookmark').classList.remove('d-none');
  $_('.search-results').classList.add('d-none');

  $_('.list-pagination').classList.add('d-none');
  $_('.list-pagination').classList.remove('d-flex');

}

bookmarkCounter.addEventListener('click', openBookmarkSection)

var removeBookmarkSection = $_('.comeback-main');

function openMainSection() {

  $_('.search-results-bookmark').classList.add('d-none');
  $_('.search-results').classList.remove('d-none');

  $_('.list-pagination').classList.remove('d-none');
  $_('.list-pagination').classList.add('d-flex');

}

removeBookmarkSection.addEventListener('click', openMainSection)