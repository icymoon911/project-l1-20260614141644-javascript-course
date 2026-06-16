'use strict'

// ===== Constants =====
const TMDB_API_KEY = '19f84e11932abbc79e6d83f82d6d1045'
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/original'

let wishlistApiUrl = 'http://localhost:3000'
if (location.href.indexOf('netlify') !== -1) {
  wishlistApiUrl = 'https://netflix-cp.herokuapp.com'
}

// Declarative config for the three standard movie sections.
// Replaces the old getOriginals / getTrendingNow / getTopRated trio.
const MOVIE_SECTIONS = [
  {
    url: `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_networks=213`,
    selector: '.original__movies',
    pathType: 'poster_path',
  },
  {
    url: `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`,
    selector: '#trending',
    pathType: 'backdrop_path',
  },
  {
    url: `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=1`,
    selector: '#top_rated',
    pathType: 'backdrop_path',
  },
]

// ===== Unified fetch wrapper =====
// Replaces the 5+ duplicated `.then(response => { if (response.ok)... })` chains.
const fetchJSON = async (url, options = {}) => {
  const response = await fetch(url, options)
  if (!response.ok) {
    throw new Error('something went wrong')
  }
  return response.json()
}

// ===== Unified movie image renderer =====
// Replaces the duplicated img-creation logic in showMovies() and showMoviesBasedOnGenre().
const renderMovieImages = (movies, container, pathType) => {
  for (const movie of movies) {
    const img = document.createElement('img')
    img.setAttribute('data-id', movie.id)
    img.src = `${TMDB_IMAGE_URL}${movie[pathType]}`
    img.addEventListener('click', handleMovieSelection)
    container.appendChild(img)
  }
}

// ===== Vanilla modal helpers (replace jQuery $('#trailerModal').modal()) =====
const showModal = (modalId) => {
  const modal = document.getElementById(modalId)
  modal.classList.add('show')
  modal.style.display = 'block'
  document.body.classList.add('modal-open')

  const backdrop = document.createElement('div')
  backdrop.className = 'modal-backdrop fade show'
  backdrop.id = 'modalBackdrop'
  document.body.appendChild(backdrop)

  // Click outside the modal dialog to close
  modal.addEventListener('click', function onBackdropClick(e) {
    if (e.target === modal) {
      hideModal(modalId)
      modal.removeEventListener('click', onBackdropClick)
    }
  })
}

const hideModal = (modalId) => {
  const modal = document.getElementById(modalId)
  modal.classList.remove('show')
  modal.style.display = 'none'
  document.body.classList.remove('modal-open')
  const backdrop = document.getElementById('modalBackdrop')
  if (backdrop) backdrop.remove()
}

// ===== Trailer logic =====
const setTrailer = (trailers) => {
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

const handleMovieSelection = async (e) => {
  const id = e.target.getAttribute('data-id')
  try {
    const data = await fetchJSON(
      `${TMDB_BASE_URL}/movie/${id}/videos?api_key=${TMDB_API_KEY}&language=en-US`
    )
    const youtubeTrailers = data.results.filter(
      (result) => result.site === 'YouTube' && result.type === 'Trailer'
    )
    setTrailer(youtubeTrailers)
  } catch (err) {
    console.log(err)
  }
  showModal('trailerModal')
}

// ===== Fetch + render a single movie section =====
const fetchAndShowMovies = async (url, selector, pathType) => {
  try {
    const data = await fetchJSON(url)
    const container = document.querySelector(selector)
    renderMovieImages(data.results, container, pathType)
  } catch (err) {
    console.log(err)
  }
}

// ===== Wishlist =====
const getWishList = async () => {
  try {
    const data = await fetchJSON(`${wishlistApiUrl}/wishlist`, {
      headers: {
        Authorization: `${localStorage.getItem('token')}`,
      },
    })
    const container = document.querySelector('#wishlist')
    renderMovieImages(data.results, container, 'backdrop_path')
  } catch (err) {
    if (typeof logOut === 'function') logOut()
    console.log(err)
  }
}

// ===== Genre-based movies =====
const showMoviesBasedOnGenre = (genreName, movies) => {
  const allMovies = document.querySelector('.movies')

  const genreEl = document.createElement('div')
  genreEl.classList.add('movies__header')
  genreEl.innerHTML = `<h2>${genreName}</h2>`

  const moviesEl = document.createElement('div')
  moviesEl.classList.add('movies__container')
  moviesEl.setAttribute('id', genreName)

  renderMovieImages(movies.results, moviesEl, 'backdrop_path')

  allMovies.appendChild(genreEl)
  allMovies.appendChild(moviesEl)
}

const loadGenres = async () => {
  try {
    const genreList = await fetchJSON(
      `${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`
    )
    for (const genre of genreList.genres) {
      try {
        const movies = await fetchJSON(
          `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_genres=${genre.id}`
        )
        showMoviesBasedOnGenre(genre.name, movies)
      } catch (err) {
        console.log('BAD BAD', err)
      }
    }
  } catch (err) {
    console.log(err)
  }
}

// ===== Init =====
window.onload = () => {
  // Load the three standard sections from the declarative config
  MOVIE_SECTIONS.forEach(({ url, selector, pathType }) => {
    fetchAndShowMovies(url, selector, pathType)
  })

  getWishList()
  loadGenres()

  // Bind modal close button (vanilla JS, no jQuery data-dismiss)
  const closeBtn = document.querySelector('#trailerModal .close')
  if (closeBtn) {
    closeBtn.addEventListener('click', () => hideModal('trailerModal'))
  }
}
