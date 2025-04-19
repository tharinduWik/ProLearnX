import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { postService } from '../../services/api';
import PostItem from './PostItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await postService.getAllPosts();
      setPosts(response.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again later.');
      toast.error('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    fetchPosts();
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postService.deletePost(postId);
        setPosts(posts.filter(post => post.id !== postId));
        toast.success('Post deleted successfully');
      } catch (err) {
        toast.error('Failed to delete post');
        console.error('Error deleting post:', err);
      }
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading posts...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Skill Sharing Posts</h2>
        <Link to="/create-post">
          <Button variant="primary">
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Create Post
          </Button>
        </Link>
      </div>
      
      {error && (
        <Alert variant="danger">
          {error}
          <div className="mt-2">
            <Button variant="outline-danger" size="sm" onClick={handleRetry}>
              Retry
            </Button>
          </div>
        </Alert>
      )}
      
      {!loading && !error && posts.length === 0 && (
        <div className="text-center p-5 bg-light rounded">
          <h4>No posts yet</h4>
          <p>Be the first to share your knowledge!</p>
          <Link to="/create-post">
            <Button variant="primary">
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Create Post
            </Button>
          </Link>
        </div>
      )}
      
      <Row>
        {posts.map(post => (
          <Col key={post.id} xs={12}>
            <PostItem post={post} onDelete={handleDeletePost} />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default PostList;