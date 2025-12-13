import React from 'react';
import PostCard from './PostCard'; // Убедитесь что PostCard.js существует
// или Postcard.js (обратите внимание на регистр)

function PostList({ posts, loading }) {
  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Загрузка постов...</div>;
  }

  if (!posts || posts.length === 0) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Посты не найдены</div>;
  }

  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

export default PostList;