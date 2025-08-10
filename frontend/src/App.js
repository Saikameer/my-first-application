import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import './App.css';

Modal.setAppElement('#root');

function App() {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [watched, setWatched] = useState({});

  const handleWatchedChange = (e) => {
    const { checked } = e.target;
    if (selectedMovie) {
      setWatched((prev) => ({
        ...prev,
        [selectedMovie.id]: checked,
      }));
    }
  };
  const [activeTab, setActiveTab] = useState('watch-guide');
  const [commentsData, setCommentsData] = useState({});

  useEffect(() => {
    const fetchMoviesByTab = async () => {
      if (activeTab === 'from-your-watchlist') {
        // Filter locally for watchlist
        setMovies((prevMovies) => prevMovies.filter((movie) => watched[movie.id]));
        return;
      }
      try {
        const response = await fetch(`http://localhost:5000/api/movies/${activeTab}`);
        if (!response.ok) {
          throw new Error('Failed to fetch movies');
        }
        const data = await response.json();
        setMovies(data);
      } catch (error) {
        console.error('Error fetching movies:', error);
        setMovies([]);
      }
    };
    fetchMoviesByTab();
  }, [activeTab, watched]);

  // CommentsSection component inside App.js for simplicity
  function CommentsSection({ movieId }) {
    const [comments, setComments] = useState(commentsData[movieId] || []);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [replyText, setReplyText] = useState('');

    useEffect(() => {
      setComments(commentsData[movieId] || []);
    }, [movieId, commentsData]);

    const handleAddComment = () => {
      if (!newComment.trim()) return;
      const newComments = [...(commentsData[movieId] || [])];
      newComments.push({
        id: Date.now(),
        text: newComment.trim(),
        replies: []
      });
      setCommentsData(prev => ({ ...prev, [movieId]: newComments }));
      setNewComment('');
    };

    const handleAddReply = (commentId) => {
      if (!replyText.trim()) return;
      const newComments = [...(commentsData[movieId] || [])];
      const commentIndex = newComments.findIndex(c => c.id === commentId);
      if (commentIndex !== -1) {
        const comment = newComments[commentIndex];
        comment.replies = comment.replies || [];
        comment.replies.push({
          id: Date.now(),
          text: replyText.trim()
        });
        newComments[commentIndex] = comment;
        setCommentsData(prev => ({ ...prev, [movieId]: newComments }));
        setReplyText('');
        setReplyTo(null);
      }
    };

    return (
      <div className="comments-section">
        <h3>Comments</h3>
        <div className="add-comment">
          <textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button onClick={handleAddComment}>Post</button>
        </div>
        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment">
              <p>{comment.text}</p>
              <button onClick={() => setReplyTo(comment.id)}>Reply</button>
              {replyTo === comment.id && (
                <div className="reply-section">
                  <textarea
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <button onClick={() => handleAddReply(comment.id)}>Post Reply</button>
                  <button onClick={() => setReplyTo(null)}>Cancel</button>
                </div>
              )}
              {comment.replies && comment.replies.length > 0 && (
                <div className="replies">
                  {comment.replies.map((reply) => (
                    <p key={reply.id} className="reply">
                      {reply.text}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>What to Watch - IMDb</h1>
      <div className="tabs">
        {['watch-guide', 'fan-favorites', 'top-picks', 'from-your-watchlist', 'most-popular'].map((tab) => (
          <button
            key={tab}
            className={tab === activeTab ? 'tab active' : 'tab'}
            onClick={() => setActiveTab(tab)}
          >
            {tab.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>
      <div className="movie-grid">
        {movies.map((movie) => (
          <div key={movie.id} className="movie-card" onClick={() => {
            setSelectedMovie(movie);
            setModalIsOpen(true);
          }}>
            <img src={movie.image} alt={movie.title} />
            <div className="movie-info">
              <div className="rating">
                <span className="star">★</span> {(movie.rating && !isNaN(Number(movie.rating))) ? Number(movie.rating).toFixed(1) : 'N/A'}
              </div>
              <h3>{movie.title}</h3>
              <button className="trailer-button" onClick={(e) => { e.stopPropagation(); window.open(movie.trailerUrl, '_blank'); }}>
                ▶ Trailer
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => {
          setSelectedMovie(null);
          setModalIsOpen(false);
        }}
        contentLabel="Movie Details"
        className="modal"
        overlayClassName="overlay"
      >
        {selectedMovie && (
          <div className="modal-content">
            <h2>{selectedMovie.title}</h2>
            <img src={selectedMovie.image} alt={selectedMovie.title} />
            <p>Rating: {(selectedMovie.rating && !isNaN(Number(selectedMovie.rating))) ? Number(selectedMovie.rating).toFixed(1) : 'N/A'}</p>
            <p>{selectedMovie.description ? selectedMovie.description : 'No description available.'}</p>
            <label>
              <input
                type="checkbox"
                checked={watched[selectedMovie.id] || false}
                onChange={handleWatchedChange}
              />
              Watched
            </label>
            <CommentsSection movieId={selectedMovie.id} />
            <button onClick={() => {
              setSelectedMovie(null);
              setModalIsOpen(false);
            }}>Close</button>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default App;
