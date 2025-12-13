import React from 'react';
import { Link } from 'react-router-dom';

function PostCard({ post }) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ margin: '0 0 10px 0' }}>
        <Link 
          to={`/posts/${post.id}`}
          style={{ color: '#2c3e50', textDecoration: 'none' }}
        >
          {post.title}
        </Link>
      </h3>
      
      <p style={{ 
        color: '#666', 
        marginBottom: '15px',
        lineHeight: '1.5'
      }}>
        {post.content?.substring(0, 150)}...
      </p>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '14px',
        color: '#7f8c8d'
      }}>
        <span>👤 {post.author || 'Автор'}</span>
        <span>📅 {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Недавно'}</span>
      </div>
      
      {post.tags && post.tags.length > 0 && (
        <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {post.tags.map(tag => (
            <span key={tag} style={{
              backgroundColor: '#ecf0f1',
              padding: '3px 8px',
              borderRadius: '12px',
              fontSize: '12px'
            }}>
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default PostCard;