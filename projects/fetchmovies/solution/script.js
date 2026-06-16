'use strict'

console.log('YOOO')

// ── Constants ────────────────────────────────────────────────────────────────
const TMDB_API_KEY   = '19f84e11932abbc79e6d83f82d6d1045'
const TMDB_BASE_URL  = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/original'

let apiUrl = 'http://localhost:3000'
if (location.href.indexOf('netlify') !== -1) {
  apiUrl = 'https://netflix-cp.herokuapp.com'
}

// ── Unified fetch wrapper ────────────────────────────────────────────────────
// Replaces the copy-pasted `.then(r => { if (r.ok) return r.json(); else throw })`
// that was scattered across getMovieTrailer, fetchMovies, fetchMoviesBasedOnGenre,
// getWishList, and getGenres.
function fetchJSON(url, options = {}) {
  return fetch(url, options).then(response => {
    if (response.ok) {
      return response.json()
    }
    throw new Error(`Request failed with status ${response.status}`)
  })
}

// ── Unified movie card renderer ──────────────────────────────────────────────
// showMovies() and showMoviesBasedOnGenre() used to contain near-identical loops
// that created an <img>, set data-id, built the TMDB image URL, attached a click
// handler, and appended it to a container. Both now delegate to this function.
function renderMovieCard(movie, pathType, container) {
  const imageElement = document.createElement('img')
  imageElement.setAttribute('data-id', movie.id)
  imageElement.src = `${TMDB_IMAGE_URL}${movie[pathType]}`
  imageElement.addEventListener('click', handleMovieSelection)
  container.appendChild(imageElement)
}

// ── Unified fetch-and-display helper ─────────────────────────────────────────
// getOriginals(), getTrendingNow(), and getTopRated() were three separate
// functions that differed only in URL + DOM selector + path type. They all
// collapsed into calls to this single configurable helper.
function fetchAndShowMovies(url, selector, pathType) {
  fetchJSON(url)
    .then(data => {
      showMovies(data, selector, pathType)
    })
    .catch(error => {
      console.log(error)
    })
}

// ── Modal helpers (pure DOM — replaces $('#trailerModal').modal('show')) ────
function showTrailerModal() {
  const modal = document.getElementById('trailerModal')
  modal.style.display = 'block'
  modal.classList.add('show')
  document.body.classList.add('modal-open')
  const backdrop = document.createElement('div')
  backdrop.className = 'modal-backdrop fade show'
  document.body.appendChild(backdrop)
}

function hideTrailerModal() {
  const modal = document.getElementById('trailerModal')
  modal.style.display = 'none'
  modal.classList.remove('show')
  document.body.classList.remove('modal-open')
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove())
}

// ── Page bootstrap ───────────────────────────────────────────────────────────
window.onload = () => {
  // Wire up the modal close button (previously handled by Bootstrap's jQuery
  // data-dismiss plugin; now done natively so jQuery is no longer required).
  const closeBtn = document.querySelector('#trailerModal [data-dismiss="modal"]')
  if (closeBtn) {
    closeBtn.addEventListener('click', hideTrailerModal)
  }

  // Netflix originals / Trending / Top Rated — same pattern, different params.
  const homeSections = [
    {
      url:      `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_networks=213`,
      selector: '.original__movies',
      pathType: 'poster_path',
    },
    {
      url:      `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`,
      selector: '#trending',
      pathType: 'backdrop_path',
    },
    {
      url:      `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=1`,
      selector: '#top_rated',
      pathType: 'backdrop_path',
    },
  ]

  homeSections.forEach(({ url, selector, pathType }) => {
    fetchAndShowMovies(url, selector, pathType)
  })

  getWishList()
  getGenres()
}

// ── Wishlist ─────────────────────────────────────────────────────────────────
function getWishList() {
  fetchJSON(`${apiUrl}/wishlist`, {
    headers: {
      Authorization: `${localStorage.getItem('token')}`,
    },
  })
    .then(data => {
      showMovies(data, '#wishlist', 'backdrop_path')
    })
    .catch(error => {
      logOut()
      console.log(error)
    })
}

// ── Trailer ──────────────────────────────────────────────────────────────────
function getMovieTrailer(id) {
  const url = `${TMDB_BASE_URL}/movie/${id}/videos?api_key=${TMDB_API_KEY}&language=en-US`
  return fetchJSON(url)
}

const setTrailer = trailers => {
  const iframe = document.getElementById('movieTrailer')
  const movieNotFound = document.querySelector('.movieNotFound')
  if (trailers.length > 0) {
    movieNotFound.classList.add('d-none')
    iframe.classList.remove('d-none')
    iframe.src = `https://www.youtube.com/embed/${trailers[0].key}`
  } else {
    iframe.classList.add('d-none')
    movieNotFound.classList.remove('d-none')
  }
}

const handleMovieSelection = e => {
  const id = e.target.getAttribute('data-id')
  getMovieTrailer(id).then(data => {
    const youtubeTrailers = data.results.filter(
      result => result.site === 'YouTube' && result.type === 'Trailer'
    )
    setTrailer(youtubeTrailers)
  })

  // Open modal — native DOM, no jQuery.
  showTrailerModal()
}

// ── Movie list renderers (both delegate to renderMovieCard) ─────────────────
function showMovies(movies, elementSelector, pathType) {
  const moviesEl = document.querySelector(elementSelector)
  if (!moviesEl) return
  for (const movie of movies.results) {
    renderMovieCard(movie, pathType, moviesEl)
  }
}

function showMoviesBasedOnGenre(genreName, movies) {
  const allMovies = document.querySelector('.movies')

  const genreEl = document.createElement('div')
  genreEl.classList.add('movies__header')
  genreEl.innerHTML = `<h2>${genreName}</h2>`

  const moviesEl = document.createElement('div')
  moviesEl.classList.add('movies__container')
  moviesEl.setAttribute('id', genreName)

  for (const movie of movies.results) {
    renderMovieCard(movie, 'backdrop_path', moviesEl)
  }

  allMovies.appendChild(genreEl)
  allMovies.appendChild(moviesEl)
}

// ── Genres ───────────────────────────────────────────────────────────────────
function fetchMoviesBasedOnGenre(genreId) {
  const url =
    `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}` +
    '&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1' +
    `&with_genres=${genreId}`
  return fetchJSON(url)
}

function showMoviesGenres(genres) {
  genres.genres.forEach(genre => {
    fetchMoviesBasedOnGenre(genre.id)
      .then(movies => {
        showMoviesBasedOnGenre(genre.name, movies)
      })
      .catch(error => {
        console.log('BAD BAD', error)
      })
  })
}

function getGenres() {
  const url = `${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`
  fetchJSON(url)
    .then(data => {
      showMoviesGenres(data)
    })
    .catch(error => {
      console.log(error)
    })
}
