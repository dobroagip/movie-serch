import { motion } from 'framer-motion';
import styles from './MovieCard.module.css';

function MovieCard({ title, year, poster, isFavorite, toggleFavorite, onClick }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={styles.card}
      onClick={onClick}
    >
      {poster && poster !== 'N/A' ? (
        <img src={poster} alt={title} className={styles.poster} />
      ) : (
        <div className={styles.placeholder}>No Image</div>
      )}
      <div className={styles.info}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.year}>{year}</p>
      </div>
      <motion.button
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite();
        }}
        className={styles.favorite}
      >
        {isFavorite ? '❤️' : '🤍'}
      </motion.button>
    </motion.div>
  );
}

export default MovieCard;