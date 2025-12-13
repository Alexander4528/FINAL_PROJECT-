import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(query);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchInput)}`;
    }
  };

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/posts/search?q=${query}`);
        setResults(response.data.results);
      } catch (error) {
        console.error('Ошибка поиска:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>🔍 Поиск постов</h1>
      
      <form onSubmit={handleSearch} style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Введите поисковый запрос..."
            style={{
              flex: 1,
              padding: '12px 15px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          />
          <button
            type="submit"
            style={{
              padding: '12px 25px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Найти
          </button>
        </div>
      </form>

      {query && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Результаты поиска для: "{query}"</h3>
        </div>
      )}

      {loading ? (
        <p>Загрузка результатов...</p>
      ) : results.length === 0 && query ? (
        <p>Ничего не найдено. Попробуйте другой запрос.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {results.map(post => (
            <div key={post.id} style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}>
              <h4 style={{ margin: '0 0 10px 0' }}>
                <Link to={`/posts/${post.id}`} style={{ color: '#2c3e50', textDecoration: 'none' }}>
                  {post.title}
                </Link>
              </h4>
              <p style={{ color: '#666', marginBottom: '10px' }}>
                {post.content.substring(0, 150)}...
              </p>
              <div style={{ display: 'flex', gap: '10px', fontSize: '14px', color: '#7f8c8d' }}>
                <span>👤 {post.author}</span>
                {post.tags && post.tags.map(tag => (
                  <span key={tag} style={{
                    backgroundColor: '#ecf0f1',
                    padding: '3px 8px',
                    borderRadius: '12px'
                  }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchPage;