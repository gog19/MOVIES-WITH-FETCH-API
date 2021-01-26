var $_ = (selector, node = document) => node.querySelector(selector);


var $$_ = (selector, node = document) => node.querySelectorAll(selector);


var createElement = (element, elementClass, text) => {
    var newElement = document.createElement(element);

    if (elementClass) {
        newElement.setAttribute('class', elementClass);
    }

    if (text) {
        newElement.textContent = text;
    }

    return newElement;
};

// {// var newVersionOfArray = movies.map(function (item) {
//     return {
//         categories: item.Categories.split('|'),
//         title: item.Title.toString(),
//         imdbId: item.imdb_id,
//         imdbRating: item.imdb_rating,
//         language: item.language,
//         year: item.movie_year,
//         runtime: item.runtime,
//         summary: item.summary,
//         youtubeId: item.ytid
//     }
// })

// var getSmallImg = function (youtubeId) {
//     return `http://i3.ytimg.com/vi/${youtubeId}/hqdefault.jpg`
// }

// var getBigImg = function (youtubeId) {
//     return `http://i3.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`
// }}
