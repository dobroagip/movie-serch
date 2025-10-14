function MovieCard ({ title, year, poster, imdbID, onClick, isFavorite, toggleFavorite }) {

return (
<div style={{ display:'flex', gap:'20px', borderBottom:'1px solid #ccc', padding:'10px 0', cursor:'pointer' }} 
onClick={onClick}
>
    {poster && poster !== 'N/A' && (
        <img src={poster} alt={title} style={{ maxWidth: '100px', borderRadius: '5px' }} />
        )}
        <div>
        <h3 style={{ margin: '0 0 5px' }}>{title}</h3>
        <p style={{ margin: '0' }}>Year: {year}</p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite();
          }}
          style={{
            padding: '5px 10px',
            marginTop: '5px',
            background: isFavorite ? '#dc3545' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          {isFavorite ? 'Remove' : 'Add to Favorites'}
        </button>
      </div>
    </div>
  );
}


export default MovieCard;
