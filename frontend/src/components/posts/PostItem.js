import React, { useState, useContext, useEffect } from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faComment, faTrash } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../context/AuthContext';
import { userService } from '../../services/api';

const PostItem = ({ post, onDelete }) => {
  const { currentUser } = useContext(AuthContext);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        const response = await userService.getUser(post.userId);
        setAuthor(response.data);
      } catch (error) {
        console.error("Error fetching post author:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthor();
  }, [post.userId]);

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const canDelete = currentUser && currentUser.id === post.userId;

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center bg-light">
        <div className="d-flex align-items-center">
          {loading ? (
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : (
            <>
              <div className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center me-2" 
                   style={{ width: '40px', height: '40px' }}>
                {author?.profileImageUrl ? (
                  <img 
                    src={author.profileImageUrl} 
                    alt={author.username} 
                    className="rounded-circle" 
                    width="40" 
                    height="40" 
                  />
                ) : (
                  <span>{author?.username.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <h6 className="mb-0">{author?.username}</h6>
                <small className="text-muted">{formatDate(post.createdAt)}</small>
              </div>
            </>
          )}
        </div>
        {canDelete && (
          <Button 
            variant="outline-danger" 
            size="sm" 
            onClick={() => onDelete(post.id)}
            title="Delete post"
          >
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        )}
      </Card.Header>
      
      <Card.Body>
        <Card.Text>{post.description}</Card.Text>
        
        <Row className="media-container g-2 mb-3">
          {post.mediaUrls.map((url, index) => (
            <Col key={index} xs={12} md={post.mediaUrls.length > 1 ? 6 : 12} lg={post.mediaUrls.length > 2 ? 4 : (post.mediaUrls.length > 1 ? 6 : 12)}>
              {post.isVideo ? (
                <video 
                  src={url} 
                  className="img-fluid rounded" 
                  controls 
                  style={{ maxHeight: '300px', width: '100%', objectFit: 'contain' }}
                />
              ) : (
                <img 
                  src={url} 
                  alt={`Post media ${index}`} 
                  className="img-fluid rounded" 
                  style={{ maxHeight: '300px', width: '100%', objectFit: 'contain' }}
                />
              )}
            </Col>
          ))}
        </Row>
        
        <div className="d-flex">
          <Button variant="outline-primary" className="me-2">
            <FontAwesomeIcon icon={faHeart} className="me-1" /> 
            {post.likesCount || 0}
          </Button>
          <Button variant="outline-secondary">
            <FontAwesomeIcon icon={faComment} className="me-1" /> 
            Comment
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PostItem;