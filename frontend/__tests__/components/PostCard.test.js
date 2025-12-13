import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PostCard from '../../components/PostCard';
import { useAuthStore } from '../../store/authStore';

// Mock auth store
jest.mock('../../store/authStore');
jest.mock('../../services/api', () => ({
  likePost: jest.fn(),
  favoritePost: jest.fn(),
}));

const mockPost = {
  id: '1',
  title: 'Test Post Title',
  excerpt: 'This is a test post excerpt for testing purposes.',
  content: 'Full content of the test post',
  createdAt: '2024-01-15T10:30:00Z',
  author: {
    id: 'user1',
    username: 'testuser',
    avatar: null,
  },
  tags: [
    { id: 'tag1', name: 'JavaScript' },
    { id: 'tag2', name: 'React' },
  ],
  _count: {
    likes: 42,
    comments: 15,
    favorites: 7,
  },
  userLike: false,
  userFavorite: false,
};

describe('PostCard Component', () => {
  beforeEach(() => {
    useAuthStore.mockReturnValue({
      user: { id: 'current-user', role: 'USER' },
      isAuthenticated: true,
    });
  });

  test('renders post information correctly', () => {
    render(
      <BrowserRouter>
        <PostCard post={mockPost} />
      </BrowserRouter>
    );

    // Check title
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    
    // Check excerpt
    expect(screen.getByText('This is a test post excerpt for testing purposes.')).toBeInTheDocument();
    
    // Check author
    expect(screen.getByText('testuser')).toBeInTheDocument();
    
    // Check tags
    expect(screen.getByText('#JavaScript')).toBeInTheDocument();
    expect(screen.getByText('#React')).toBeInTheDocument();
    
    // Check stats
    expect(screen.getByText('42')).toBeInTheDocument(); // likes
    expect(screen.getByText('15')).toBeInTheDocument(); // comments
  });

  test('displays relative time', () => {
    render(
      <BrowserRouter>
        <PostCard post={mockPost} />
      </BrowserRouter>
    );

    // Should display relative time (like "X days ago")
    const timeElement = screen.getByText(/ago/i);
    expect(timeElement).toBeInTheDocument();
  });

  test('has link to post detail page', () => {
    render(
      <BrowserRouter>
        <PostCard post={mockPost} />
      </BrowserRouter>
    );

    const postLink = screen.getByText('Test Post Title').closest('a');
    expect(postLink).toHaveAttribute('href', '/posts/1');
  });

  test('has link to author profile', () => {
    render(
      <BrowserRouter>
        <PostCard post={mockPost} />
      </BrowserRouter>
    );

    const authorLink = screen.getByText('testuser').closest('a');
    expect(authorLink).toHaveAttribute('href', '/users/user1');
  });

  test('shows like button as outlined when not liked', () => {
    render(
      <BrowserRouter>
        <PostCard post={mockPost} />
      </BrowserRouter>
    );

    const likeButton = screen.getByLabelText(/like post/i);
    expect(likeButton).toBeInTheDocument();
    // Check that it doesn't have filled class (simplified check)
    expect(likeButton.querySelector('svg')).not.toHaveClass('fill-current');
  });

  test('shows like button as filled when liked', () => {
    const likedPost = { ...mockPost, userLike: true };
    
    render(
      <BrowserRouter>
        <PostCard post={likedPost} />
      </BrowserRouter>
    );

    const likeButton = screen.getByLabelText(/unlike post/i);
    expect(likeButton).toBeInTheDocument();
  });

  test('calls onUpdate when like button is clicked', async () => {
    const mockOnUpdate = jest.fn();
    const { likePost } = require('../../services/api');
    likePost.mockResolvedValue({ data: { liked: true } });

    render(
      <BrowserRouter>
        <PostCard post={mockPost} onUpdate={mockOnUpdate} />
      </BrowserRouter>
    );

    const likeButton = screen.getByLabelText(/like post/i);
    fireEvent.click(likeButton);

    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(likePost).toHaveBeenCalledWith('1');
    expect(mockOnUpdate).toHaveBeenCalled();
  });

  test('shows message when user is not authenticated and tries to like', () => {
    // Mock unauthenticated user
    useAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
    });

    // Mock toast
    const toast = require('react-hot-toast');
    toast.error = jest.fn();

    render(
      <BrowserRouter>
        <PostCard post={mockPost} />
      </BrowserRouter>
    );

    const likeButton = screen.getByLabelText(/like post/i);
    fireEvent.click(likeButton);

    expect(toast.error).toHaveBeenCalledWith('Please login to like posts');
  });
});