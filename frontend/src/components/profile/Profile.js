import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tab, Tabs } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import { userService, postService } from '../../services/api';
import PostItem from '../posts/PostItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faUser } from '@fortawesome/free-solid-svg-icons';

const Profile = () => {
  const { currentUser } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await userService.getUser(currentUser.id);
        setUser(userResponse.data);
        
        const postsResponse = await postService.getUserPosts(currentUser.id);
        setUserPosts(postsResponse.data);
      } catch (err) {
        setError('Failed to load profile data');
        console.error('Error fetching profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchUserData();
    }
  }, [currentUser]);

  const validationSchema = Yup.object({
    username: Yup.string().required('Username is required'),
    bio: Yup.string().max(250, 'Bio must be at most 250 characters')
  });

  const handleUpdateProfile = async (values, { setSubmitting }) => {
    try {
      const updatedUser = await userService.updateUser(currentUser.id, values);
      setUser(updatedUser.data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data || 'Failed to update profile');
      toast.error('Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postService.deletePost(postId);
        setUserPosts(userPosts.filter(post => post.id !== postId));
        toast.success('Post deleted successfully');
      } catch (err) {
        toast.error('Failed to delete post');
      }
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="mt-4">
        <Col lg={4}>
          <Card className="shadow-sm mb-4">
            <Card.Body className="text-center">
              <div className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center mx-auto mb-3" 
                   style={{ width: '100px', height: '100px' }}>
                {user?.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt={user.username} 
                    className="rounded-circle" 
                    width="100" 
                    height="100" 
                  />
                ) : (
                  <FontAwesomeIcon icon={faUser} size="3x" />
                )}
              </div>
              <h3>{user?.username}</h3>
              <p className="text-muted">{user?.email}</p>
              <p>{user?.bio || 'No bio yet'}</p>
            </Card.Body>
          </Card>
          
          <Card className="shadow-sm">
            <Card.Header>Edit Profile</Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Formik
                initialValues={{
                  username: user?.username || '',
                  bio: user?.bio || ''
                }}
                validationSchema={validationSchema}
                onSubmit={handleUpdateProfile}
              >
                {({
                  handleSubmit,
                  handleChange,
                  handleBlur,
                  values,
                  touched,
                  errors,
                  isSubmitting
                }) => (
                  <Form noValidate onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={values.username}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.username && !!errors.username}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.username}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Bio</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="bio"
                        value={values.bio}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.bio && !!errors.bio}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.bio}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Updating...' : (
                        <>
                          <FontAwesomeIcon icon={faSave} className="me-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={8}>
          <Tabs defaultActiveKey="posts" className="mb-3">
            <Tab eventKey="posts" title="My Posts">
              {userPosts.length === 0 ? (
                <div className="text-center p-5 bg-light rounded">
                  <h4>You haven't created any posts yet</h4>
                  <p>Share your knowledge with the community!</p>
                  <Button href="/create-post" variant="primary">Create Your First Post</Button>
                </div>
              ) : (
                userPosts.map(post => (
                  <PostItem 
                    key={post.id} 
                    post={post} 
                    onDelete={handleDeletePost} 
                  />
                ))
              )}
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;