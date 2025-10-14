function MovieCard ({ title, year, poster, imdbID, onClick }) {

return (
<div style={{ display:'flex', gap:'20px', borderBottom:'1px solid #ccc', padding:'10px 0', cursor:'pointer' }} 
onClick={onClick}
>
    {poster && <img src={poster} alt={title} style={{maxWidth:'100px'}}/>}
<div>
<h3>{title}</h3>
<p>Year: {year}</p>
</div>
</div>
);
}

export default MovieCard;
