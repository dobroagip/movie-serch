import { useState, useEffect, useCallback } from 'react';
import MovieCard from './MovieCard';
import Counter from './Counter';
import styles from './App.module.css';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const [genre, setGenre] = useState('');
  const [search, setSearch] = useState('');
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(false);

  // Инициализация favorites с использованием useState и localStorage
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem('favorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });
  // Инициализация темы с использованием useState и localStorage
  const [isDark, setIsDark] = useState(false);

// Эффект для инициализации темы на клиенте
useEffect(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      setIsDark(true);
    }
  }
}, []);

  const API_KEY = 'bbc1f8d1'; // Замени на свой OMDB API ключ

  // Сохранение favorites в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);
// Эффект для применения темы при изменении isDar
  useEffect(() => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
  }
}, [isDark]);

  // Функция поиска фильмов с использованием useCallback
  const searchMovies = useCallback(async (currentPage, isLoadMore = false) => {
  setLoading(true);
  try {
    const response = await fetch(
      `http://www.omdbapi.com/?s=${encodeURIComponent(search)}&page=${currentPage}&apikey=${API_KEY}`,
      { mode: 'cors' }  // Добавь CORS
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    if (data.Response === 'True') {
    // Получаем полные данные для каждого фильма
    const moviePromises = data.Search.map(async (movie) => {
      const detailResponse = await fetch(`http://www.omdbapi.com/?i=${movie.imdbID}&apikey=${API_KEY}`);
      const detailData = await detailResponse.json();
      return detailData.Response === 'True' ? detailData : movie;
    });
    const detailedMovies = await Promise.all(moviePromises);

    filteredMovies = detailedMovies;
    if (genre) {
      filteredMovies = detailedMovies.filter(movie => {
        return movie.Genre && movie.Genre.split(',').some(g => g.trim().toLowerCase() === genre.toLowerCase());
      });
    }

    setMovies(prev => isLoadMore ? [...prev, ...filteredMovies] : filteredMovies);
    setError('');
  } else {
    setMovies(prev => isLoadMore ? [...prev] : []);
    setError(data.Error || 'No movies found');
  }
} catch (error) {
    console.error('Fetch error:', error);
    setError(error.message);  // Показывай ошибку пользователю
  } finally {
    setLoading(false);
  }
}, [search, genre, API_KEY]);

  // Эффект для поиска при изменении search или genre
  useEffect(() => {
    if (search || genre) {
      const timeoutId = setTimeout(() => {
        setPage(1);
        searchMovies(1, false);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setMovies([]);
      setError('');
      setPage(1);
    }
  }, [search, genre, searchMovies]);

  return (
    <div className={styles.container}>
      <div className={styles.nav}>
        <h1>Movie Search</h1>
        <div className={styles.themeToggle}>
  <button
    onClick={() => setIsDark(prev => !prev)}
    className={styles.toggleButton}
  >
    {isDark ? 'Светлая' : 'Тёмная'}
  </button>
</div>
        <Counter />
      </div>
{/* ← КНОПКА ПЕРЕКЛЮЧЕНИЯ ТЕМЫ */}
      <select
        value={genre}
        onChange={(e) => setGenre(e.target.value)}
        className={styles.select}
      >
        <option value="">All Genres</option>
        <option value="action">Action</option>
        <option value="comedy">Comedy</option>
        <option value="drama">Drama</option>
        <option value="fantasy">Fantasy</option>
      </select>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search for a movie..."
        className={styles.input}
      />
      <button
        onClick={() => {
          setSearch('');
          setGenre('');
          setMovies([]);
          setError('');
          setPage(1);
          setSelectedMovie(null);
          setLoading(false);
        }}
        className={styles.button}
      >
        Clear Search
      </button>
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
          <div className={styles.loader} />
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      

<AnimatePresence>
  {movies.map((movie, index) => (
    <motion.div
      key={movie.imdbID}
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1 
      }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      transition={{ 
        duration: 0.5,
        delay: index * 0.05,  // ← задержка для каждой карточки
        type: "spring",
        stiffness: 100
      }}
      style={{ width: '100%', marginBottom: '16px' }}
    >
      <MovieCard
        title={movie.Title}
        year={movie.Year}
        poster={movie.Poster}
        imdbID={movie.imdbID}
        isFavorite={favorites.some(fav => fav.imdbID === movie.imdbID)}
        toggleFavorite={() => {
          setFavorites(favorites.some(fav => fav.imdbID === movie.imdbID)
            ? favorites.filter(fav => fav.imdbID !== movie.imdbID)
            : [...favorites, movie]);
        }}
        onClick={async () => {
          try {
            setLoading(true);
            const response = await fetch(`http://www.omdbapi.com/?i=${movie.imdbID}&apikey=${API_KEY}`);
            if (!response.ok) throw new Error('Failed to fetch movie details');
            const data = await response.json();
            if (data.Response === 'True') setSelectedMovie(data);
            else setError(data.Error || 'Failed to load movie details');
          } catch (error) {
            setError(error.message);
          } finally {
            setLoading(false);
          }
        }}
      />
    </motion.div>
  ))}
</AnimatePresence>
      {movies.length > 0 && (
        <button
          onClick={() => {
            setPage(page + 1);
            searchMovies(page + 1, true);
          }}
          className={styles.button}
          disabled={loading}
        >
          Load More
        </button>
      )}
      {favorites.length > 0 && (
        <div style={{ marginTop: '40px', borderTop: '2px solid #ccc', paddingTop: '20px' }}>
          <h2 style={{ color: '#333' }}>Favorites</h2>
          {favorites.map((movie) => (
            <MovieCard
              key={`fav-${movie.imdbID}`}
              title={movie.Title}
              year={movie.Year}
              poster={movie.Poster}
              imdbID={movie.imdbID}
              isFavorite={true}
              toggleFavorite={() => {
                setFavorites(favorites.filter(fav => fav.imdbID !== movie.imdbID));
              }}
              onClick={async () => {
                try {
                  setLoading(true);
                  const response = await fetch(`http://www.omdbapi.com/?i=${movie.imdbID}&apikey=${API_KEY}`);
                  if (!response.ok) throw new Error('Failed to fetch movie details');
                  const data = await response.json();
                  if (data.Response === 'True') setSelectedMovie(data);
                  else setError(data.Error || 'Failed to load movie details');
                } catch (error) {
                  setError(error.message);
                } finally {
                  setLoading(false);
                }
              }}
            />
          ))}
        </div>
      )}
      {selectedMovie && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '5px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            <h2>{selectedMovie.Title || 'No Title'}</h2>
            <p><strong>Plot:</strong> {selectedMovie.Plot || 'No Plot Available'}</p>
            <p><strong>Director:</strong> {selectedMovie.Director || 'N/A'}</p>
            <p><strong>Actors:</strong> {selectedMovie.Actors || 'N/A'}</p>
            <p><strong>Genre:</strong> {selectedMovie.Genre || 'N/A'}</p>
            <p><strong>Released:</strong> {selectedMovie.Released || 'N/A'}</p>
            {selectedMovie.Poster && selectedMovie.Poster !== 'N/A' && (
              <img src={selectedMovie.Poster} alt={selectedMovie.Title} style={{ maxWidth: '100%', borderRadius: '5px' }} />
            )}
            <button
              className={styles.button}
              onClick={() => setSelectedMovie(null)}
              style={{ background: '#dc3545', color: 'white' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;