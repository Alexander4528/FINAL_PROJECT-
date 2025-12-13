import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CommentList from '../../components/CommentList';
import { useAuthStore } from '../../store/authStore';

// Mock dependencies
jest.mock('../../store/authStore');
jest.mock('../../services/api', () => ({
  createComment: jest.fn(),
  updateComment: jest.fn(),
  deleteComment: jest.fn(),
}));

const mockComments = [
  {
    id: 'comment1',
    content: 'This is the first comment',
    createdAt: '2024-01-15T10:30:00Z',
    author: {
      id: 'user1',
      username: 'author1',
      avatar: null,
    },
  },
  {
    id: 'comment2',
    content: 'This is the second comment',
    createdAt: '2024-01-14T15:45:00Z',
    author: {
      id: 'user2',
      username: 'author2',
      avatar: null,
    },
  },
];

describe('CommentList Component', () => {
  beforeEach(() => {
    useAuthStore.mockReturnValue({
      user: { id: 'current-user', username: 'currentuser', role: 'USER' },
      isAuthenticated: true,
    });
  });

  test('renders comment form when user is authenticated', () => {
    render(
      <BrowserRouter>
        <CommentList 
          comments={mockComments} 
          postId="post1" 
          onCommentsUpdate={jest.fn()} 
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Add a comment')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Share your thoughts...')).toBeInTheDocument();
    expect(screen.getByText('Post Comment')).toBeInTheDocument();
  });

  test('shows login prompt when user is not authenticated', () => {
    useAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
    });

    render(
      <BrowserRouter>
        <CommentList 
          comments={mockComments} 
          postId="post1" 
          onCommentsUpdate={jest.fn()} 
        />
      </BrowserRouter>
    );

    expect(screen.getByText(/Please login to join the discussion/i)).toBeInTheDocument();
    expect(screen.getByText('login')).toHaveAttribute('href', '/login');
  });

  test('displays comments count', () => {
    render(
      <BrowserRouter>
        <CommentList 
          comments={mockComments} 
          postId="post1" 
          onCommentsUpdate={jest.fn()} 
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Comments (2)')).toBeInTheDocument();
  });

  test('renders all comments', () => {
    render(
      <BrowserRouter>
        <CommentList 
          comments={mockComments} 
          postId="post1" 
          onCommentsUpdate={jest.fn()} 
        />
      </BrowserRouter>
    );

    expect(screen.getByText('This is the first comment')).toBeInTheDocument();
    expect(screen.getByText('This is the second comment')).toBeInTheDocument();
    expect(screen.getByText('author1')).toBeInTheDocument();
    expect(screen.getByText('author2')).toBeInTheDocument();
  });

  test('shows edit and delete buttons for own comments', () => {
    const ownComment = {
      id: 'comment3',
      content: 'My own comment',
      createdAt: '2024-01-15T10:30:00Z',
      author: {
        id: 'current-user',
        username: 'currentuser',
        avatar: null,
      },
    };

    render(
      <BrowserRouter>
        <CommentList 
          comments={[ownComment]} 
          postId="post1" 
          onCommentsUpdate={jest.fn()} 
        />
      </BrowserRouter>
    );

    expect(screen.getByLabelText('Edit comment')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete comment')).toBeInTheDocument();
  });

  test('does not show edit/delete buttons for other users comments', () => {
    render(
      <BrowserRouter>
        <CommentList 
          comments={mockComments} 
          postId="post1" 
          onCommentsUpdate={jest.fn()} 
        />
      </BrowserRouter>
    );

    expect(screen.queryByLabelText('Edit comment')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Delete comment')).not.toBeInTheDocument();
  });

  test('enters edit mode when edit button is clicked', () => {
    const ownComment = {
      id: 'comment3',
      content: 'My own comment',
      createdAt: '2024-01-15T10:30:00Z',
      author: {
        id: 'current-user',
        username: 'currentuser',
        avatar: null,
      },
    };

    render(
      <BrowserRouter>
        <CommentList 
          comments={[ownComment]} 
          postId="post1" 
          onCommentsUpdate={jest.fn()} 
        />
      </BrowserRouter>
    );

    const editButton = screen.getByLabelText('Edit comment');
    fireEvent.click(editButton);

    expect(screen.getByDisplayValue('My own comment')).toBeInTheDocument();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('submits new comment', async () => {
    const mockOnUpdate = jest.fn();
    const { createComment } = require('../../services/api');
    const mockResponse = {
      data: {
        comment: {
          id: 'new-comment',
          content: 'New comment text',
          author: {
            id: 'current-user',
            username: 'currentuser',
            avatar: null,
          },
        },
      },
    };
    createComment.mockResolvedValue(mockResponse);

    render(
      <BrowserRouter>
        <CommentList 
          comments={mockComments} 
          postId="post1" 
          onCommentsUpdate={mockOnUpdate} 
        />
      </BrowserRouter>
    );

    const textarea = screen.getByPlaceholderText('Share your thoughts...');
    const submitButton = screen.getByText('Post Comment');

    fireEvent.change(textarea, { target: { value: 'New comment text' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createComment).toHaveBeenCalledWith('post1', { content: 'New comment text' });
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  test('shows empty state when no comments', () => {
    render(
      <BrowserRouter>
        <CommentList 
          comments={[]} 
          postId="post1" 
          onCommentsUpdate={jest.fn()} 
        />
      </BrowserRouter>
    );

    expect(screen.getByText('No comments yet. Be the first to share your thoughts!')).toBeInTheDocument();
  });
});