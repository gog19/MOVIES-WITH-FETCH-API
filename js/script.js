var foundMovies = [];
var titleInputValue = '';
var PER_PAGE = 10;

var elForm = $_('.js-search-form');

if (elForm) {
  var elTitleInput = $_('.js-search-form__title-input', elForm);
  var elRatingInput = $_('.js-search-form__rating-input', elForm);
  var elGenreSelect = $_('.js-search-form__genre-select', elForm);
  var elSortSelect = $_('.js-search-form__sort-select', elForm);
}

var elResult = $_('.search-results');
var elCardTemplate = $_('#movie-card-template').content;
var elCounterLength = $_('.js-search-results-count');

var moviesFilterFunction = (titleInputValue = '', ratingInputValue = 0, genre = 'All') => {
  return movies.filter(movie => {
    var checkGenre = genre === 'All' || movie.categories.includes(genre);
    return movie.title.match(titleInputValue) && movie.imdbRating >= ratingInputValue && checkGenre;
  });
}

var sortMoviesAZ = data => {
  data.sort((a, b) => {
    if (a.title > b.title) return 1;
    else if (a.title < b.title) return -1;
    return 0;
  });
};

var sortMoviesZA = data => {
  data.sort((a, b) => {
    if (a.title < b.title) return 1;
    else if (a.title > b.title) return -1;
    return 0;
  });
};

var sortMoviesRatingDesc = data => data.sort((a, b) => b.imdbRating - a.imdbRating);

var sortMoviesRatingAsc = data => data.sort((a, b) => a.imdbRating - b.imdbRating);

var sortMoviesYearDesc = data => data.sort((a, b) => b.year - a.year);

var sortMoviesYearAsc = data => data.sort((a, b) => a.year - b.year);

var sortingMovies = {
  az: sortMoviesAZ,
  za: sortMoviesZA,
  rating_desc: sortMoviesRatingDesc,
  rating_asc: sortMoviesRatingAsc,
  year_desc: sortMoviesYearDesc,
  year_asc: sortMoviesYearAsc
}

var sortMovies = (data, sortType) => {
  sortingMovies[sortType](data);
};

var findMoviesCard = movie => {
  var cloneTemplate = elCardTemplate.cloneNode(true);

  $_('.movie__poster', cloneTemplate).src = movie.smallThumbnail;
  $_('.movie__poster', cloneTemplate).alt = `Poster of ${movie.title}`;
  $_('.movie__year', cloneTemplate).textContent = movie.year;
  $_('.movie__rating', cloneTemplate).textContent = movie.imdbRating;
  $_('.movie__trailer-link', cloneTemplate).href = `https://www.youtube.com/watch?v=${movie.youtubeId}`;
  $_('.js-movie-bookmark', cloneTemplate).dataset.imdbId = movie.imdbId;

  var movieTitle = $_('.movie__title', cloneTemplate);

  if (titleInputValue.source === '(?:)') {
    movieTitle.textContent = movie.title;
  } else {
    movieTitle.innerHTML = movie.title.replace(titleInputValue, `<mark class='px-0'>${movie.title.match(titleInputValue)[0]}</mark>`);
  }

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
            year: movie.Year,
            smallThumbnail: movie.Poster
          }
        });
      }
    }).then(result => {
      displayMoviesCard(result);
      // sortMovies(result, sorting);
      // displayPagination(result);
    });
}

elForm.addEventListener('submit', evt => {
  evt.preventDefault();

  var ratingInputValue = elRatingInput.value;
  var genreOfMovies = elGenreSelect.value
  // var sorting = elSortSelect.value;

  foundMovies = moviesFilterFunction(titleInputValue, ratingInputValue, genreOfMovies);

  elNoResultsAlert.classList.add('d-none');


  if (!foundMovies.length) {
    elResult.innerHTML = '';
    elNoResultsAlert.classList.remove('d-none');
    resultPagenation.innerHTML = '';
    return
  }

  searchWithFetch(elTitleInput.value)

});

var pagenationCounter = pageNum => {
  var begin = (pageNum - 1) * PER_PAGE;
  var end = begin + PER_PAGE;

  return foundMovies.slice(begin, end);
}

var displayPagination = movies => {
  var pageInNumber = Math.ceil(movies / PER_PAGE);
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
            year: movie.Year,
            smallThumbnail: movie.Poster
          }
        })
      }
    }).then(result => {
      displayMoviesCard(result);
    })
}



resultPagenation.addEventListener('click', page => {
  if (page.target.matches('.js-page-link')) {
    page.preventDefault();

    var pageOfMovies = Number(page.target.dataset.page);

    displayMoviesCard(pagenationCounter(pageOfOmdb(pageOfMovies)));

    resultPagenation.querySelectorAll('.page-item').forEach(page => page.classList.remove('active'));

    page.target.closest('.page-item').classList.add('active');

    window.scrollTo(0, 0);
  }
});


var bookmarkTemplate = $_('#bookmarked-movie-template').content;
var bookmarkFragment = document.createDocumentFragment();
var bookmarkMovies = $_('.bookmarked-movies');
var bookmarkCounter = $_('.bookmark-counter');
var bookmarkArray = JSON.parse(localStorage.getItem('bookmarkMovies')) || [];
var counter = JSON.parse(localStorage.getItem('count')) || 0;
bookmarkCounter.textContent = counter;

var showBookmark = (data) => {
  bookmarkMovies.innerHTML = '';
  data.forEach(movie => {
    var cloneOfBoomkmarkTemplate = bookmarkTemplate.cloneNode(true);
    $_('.bookmarked-movie__title', cloneOfBoomkmarkTemplate).textContent = movie.title;
    $_('.js-remove-bookmarked-movie-button', cloneOfBoomkmarkTemplate).dataset.imdbId = movie.imdbId;

    bookmarkFragment.appendChild(cloneOfBoomkmarkTemplate);
  });

  bookmarkMovies.appendChild(bookmarkFragment);
}

elResult.addEventListener('click', evt => {
  if (evt.target.matches('.js-movie-bookmark')) {
    var findBookmarkElement = foundMovies.find(movie => {
      return movie.imdbId === evt.target.dataset.imdbId;
    });

    if (!bookmarkArray.includes(findBookmarkElement)) {
      bookmarkArray.push(findBookmarkElement);
      localStorage.setItem('bookmarkMovies', JSON.stringify(bookmarkArray));
      counter++;
      bookmarkCounter.textContent = counter;
      localStorage.setItem('count', JSON.stringify(counter));
    }

    showBookmark(bookmarkArray);
  }
});

showBookmark(bookmarkArray);

bookmarkMovies.addEventListener('click', evt => {
  if (evt.target.matches('.js-remove-bookmarked-movie-button')) {
    var removeBookmark = bookmarkArray.find(movie => movie.imdbId === evt.target.dataset.imdbId)
    bookmarkArray.splice(removeBookmark, 1);

    localStorage.setItem('bookmarkMovies', JSON.stringify(bookmarkArray));

    counter--;
    bookmarkCounter.textContent = counter;
    localStorage.setItem('count', JSON.stringify(counter));

    showBookmark(bookmarkArray);

  }
});