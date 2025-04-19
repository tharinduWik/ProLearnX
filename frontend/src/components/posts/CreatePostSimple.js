import React, { useState, useContext } from 'react';
import { Form, Button, Alert, Container, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase/config';
import { postService } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const CreatePostSimple = () => {
  const [postContent, setPostContent] = useState('');
  const [postMedia, setPostMedia] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPostMedia(file);
      // Create a preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      
      // Clean up the preview URL when component unmounts
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!postContent.trim() && !postMedia) {
      setError('Post must have either text or media content');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      let mediaUrl = null;
      
      if (postMedia) {
        // Upload to Firebase
        const mediaName = `post_${currentUser.id}_${Date.now()}_${postMedia.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const storageRef = ref(storage, `postMedia/${mediaName}`);
        
        toast.info('Uploading media...', { autoClose: false, toastId: 'uploading' });
        await uploadBytes(storageRef, postMedia);
        mediaUrl = await getDownloadURL(storageRef);
        toast.dismiss('uploading');
      }
      
      const postData = {
        userId: currentUser.id,
        description: postContent,
        mediaUrls: mediaUrl ? [mediaUrl] : [],
        isVideo: postMedia ? postMedia.type.startsWith('video/') : false
      };
      
      toast.info('Creating post...', { autoClose: false, toastId: 'creating' });
      const response = await postService.createPostWithUrls(postData);
      toast.dismiss('creating');
      
      toast.success('Post created successfully!');
      navigate('/');
    } catch (err) {
      console.error('Post creation error:', err);
      if (err.response && err.response.status === 503) {
        setError('Database connection error. Please try again later.');
      } else {
        setError('Error creating post: ' + (err.friendlyMessage || err.message));
      }
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header>Create New Post</Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Post Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="What's on your mind?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Upload Media (Image or Video)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
              />
              <Form.Text className="text-muted">
                You can upload one image or video (max 50MB)
              </Form.Text>
            </Form.Group>
            
            {preview && (
              <div className="mb-3">
                <h6>Preview:</h6>
                {postMedia?.type.startsWith('image/') ? (
                  <img 
                    src={preview} 
                    alt="Preview" 
                    style={{ maxWidth: '100%', maxHeight: '300px' }}
                    className="img-thumbnail"
                  />
                ) : (
                  <video 
                    src={preview} 
                    controls 
                    style={{ maxWidth: '100%', maxHeight: '300px' }}
                    className="img-thumbnail"
                  />
                )}
              </div>
            )}
            
            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Creating Post...' : 'Create Post'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreatePostSimple;
