import { useState, useEffect, useCallback } from 'react';
import MovieCard from './MovieCard';
import Counter from './Counter';

function App() {
  const [search, setSearch] = useState('');
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const API_KEY = 'bbc1f8d1'; // Замени на свой OMDB API ключ

  const searchMovies = useCallback(async (currentPage, isLoadMore = false) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://www.omdbapi.com/?s=${encodeURIComponent(search)}&page=${currentPage}&apikey=${API_KEY}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      if (data.Response === 'True') {
        setMovies(prevMovies => isLoadMore ? [...prevMovies, ...data.Search] : data.Search);
        setError('');
      } else {
        setMovies(isLoadMore ? movies : []);
        setError(data.Error || 'No movies found');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setMovies(isLoadMore ? movies : []);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [search, API_KEY]); // Убрали movies из зависимостей

  useEffect(() => {
    if (search) {
      const timeoutId = setTimeout(() => {
        setPage(1); // Сбрасываем страницу при новом поиске
        searchMovies(1);
      }, 500); // Дебаунсинг 500 мс
      return () => clearTimeout(timeoutId);
    } else {
      setMovies([]);
      setError('');
      setPage(1);
    }
  }, [search, searchMovies]);

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <h1>Movie Search</h1>
        <Counter />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for a movie..."
          style={{ width: '100%', padding: '10px', marginBottom: '20px' }}
        />
        <button
          onClick={() => {
            setSearch('');
            setMovies([]);
            setError('');
            setPage(1);
            setSelectedMovie(null);
            setLoading(false);
          }}
          style={{ padding: '10px 20px', marginBottom: '20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          Clear Search
        </button>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
            <div style={{
              width: '30px',
              height: '30px',
              border: '4px solid #007bff',
              borderTop: '4px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>
        )}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {movies.length > 0 ? (
          movies.map((movie, index) => (
            <MovieCard
              key={index}
              title={movie.Title}
              year={movie.Year}
              poster={movie.Poster}
              imdbID={movie.imdbID}
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
          ))
        ) : (
          !loading && !error && <p>No movies found</p>
        )}
        {movies.length > 0 && (
          <button
            onClick={() => {
              setPage(page + 1);
              searchMovies(page + 1, true);
            }}
            style={{ padding: '10px 20px', marginTop: '20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}
            disabled={loading}
          >
            Load More
          </button>
        )}
      </div>
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
              onClick={() => setSelectedMovie(null)}
              style={{ padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px' }}
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