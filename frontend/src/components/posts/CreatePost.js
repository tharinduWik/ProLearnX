import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import { postService } from '../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faTrash, faSync } from '@fortawesome/free-solid-svg-icons';
import { storage } from '../../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const CreatePost = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');
  const [isVideo, setIsVideo] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedMediaUrls, setUploadedMediaUrls] = useState([]);
  const [step, setStep] = useState('upload'); // 'upload' or 'create'

  const validationSchema = Yup.object({
    description: Yup.string().required('Description is required'),
    files: Yup.mixed()
      .required('At least one file is required')
      .test(
        'fileCount',
        'Maximum 3 files are allowed',
        value => value && value.length <= 3
      )
      .test(
        'fileSize',
        'File size is too large',
        value => {
          if (!value) return true;
          return Array.from(value).every(file => file.size <= 50 * 1024 * 1024); // 50MB max
        }
      )
      .test(
        'fileType',
        'Unsupported file type',
        value => {
          if (!value) return true;
          return Array.from(value).every(
            file => file.type.startsWith('image/') || file.type.startsWith('video/')
          );
        }
      )
  });

  const uploadFileToFirebase = async (file) => {
    try {
      const mediaName = `post_${currentUser.id}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const storageRef = ref(storage, `postMedia/${mediaName}`);
      
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      
      console.log('File uploaded successfully to Firebase:', downloadUrl);
      return downloadUrl;
    } catch (error) {
      console.error('Firebase upload error:', error);
      throw error;
    }
  };

  const handleUploadMedia = async (values, { setSubmitting }) => {
    setError('');
    setIsUploading(true);
    
    try {
      const mediaUrls = [];
      const mediaFiles = Array.from(values.files);
      
      toast.info('Uploading files to storage...', { autoClose: false, toastId: 'uploading' });
      
      for (const file of mediaFiles) {
        const url = await uploadFileToFirebase(file);
        mediaUrls.push(url);
      }
      
      toast.dismiss('uploading');
      toast.success('Files uploaded successfully!');
      
      setUploadedMediaUrls(mediaUrls);
      setStep('create');
    } catch (err) {
      console.error('Media upload error:', err);
      
      if (err.code && err.code.startsWith('storage/')) {
        setError(`Firebase Storage error: ${err.message}`);
        toast.error('Storage upload failed');
      } else {
        setError(err.message || 'Failed to upload media. Please try again.');
        toast.error('Failed to upload media');
      }
    } finally {
      toast.dismiss('uploading');
      setIsUploading(false);
      setSubmitting(false);
    }
  };

  const handleCreatePost = async (values) => {
    setError('');
    setIsUploading(true);
    
    try {
      const postData = {
        userId: currentUser.id,
        description: values.description,
        isVideo: isVideo,
        mediaUrls: uploadedMediaUrls
      };
      
      console.log("Creating post with data:", postData);
      toast.info('Saving post...', { autoClose: false, toastId: 'saving' });
      
      const response = await postService.createPostWithUrls(postData);
      
      toast.dismiss('saving');
      console.log("Server response:", response.data);
      toast.success('Post created successfully!');
      navigate('/');
    } catch (err) {
      console.error('Post creation error:', err);
      
      if (err.code === 'ECONNABORTED') {
        setError('The server is taking too long to respond. Your media has been uploaded but the post could not be created.');
        toast.error('Server timeout. Please try again to create your post with the uploaded media.');
      } else if (err.response) {
        const errorMessage = err.response.data || err.message;
        setError(`Server error: ${err.response.status} - ${errorMessage}`);
        
        if (errorMessage.includes('MongoDB') || errorMessage.includes('SSLException')) {
          setError('Database connection error. Please try again later or contact support.');
        }
        
        toast.error(`Server error: ${err.response.status}`);
      } else {
        setError(err.message || 'Failed to create post. Please try again.');
        toast.error('Failed to create post');
      }
    } finally {
      toast.dismiss('saving');
      setIsUploading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    if (step === 'upload') {
      await handleUploadMedia(values, { setSubmitting });
    } else {
      await handleCreatePost(values);
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setError('');
    setStep('upload');
    setUploadedMediaUrls([]);
  };

  const handleFileChange = (event, setFieldValue) => {
    const files = event.currentTarget.files;
    
    const videoExists = Array.from(files).some(file => file.type.startsWith('video/'));
    setIsVideo(videoExists);
    
    if (files.length > 3) {
      toast.error('You can only upload a maximum of 3 files');
      return;
    }
    
    if (videoExists && Array.from(files).filter(file => file.type.startsWith('video/')).length > 1) {
      toast.error('You can only upload one video');
      return;
    }
    
    setFieldValue('files', files);
    
    const fileArray = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image'
    }));
    
    setPreviews(fileArray);
    
    if (videoExists) {
      const videoFile = Array.from(files).find(file => file.type.startsWith('video/'));
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      
      videoElement.onloadedmetadata = () => {
        URL.revokeObjectURL(videoElement.src);
        if (videoElement.duration > 30) {
          toast.error('Video must be less than 30 seconds');
          setFieldValue('files', null);
          setPreviews([]);
        }
      };
      
      videoElement.src = URL.createObjectURL(videoFile);
    }
  };
  
  const removeFile = (index, setFieldValue, values) => {
    const newFiles = Array.from(values.files).filter((_, i) => i !== index);
    
    const newIsVideo = newFiles.some(file => file.type.startsWith('video/'));
    setIsVideo(newIsVideo);
    
    const dataTransfer = new DataTransfer();
    newFiles.forEach(file => {
      dataTransfer.items.add(file);
    });
    
    setFieldValue('files', dataTransfer.files);
    
    setPreviews(previews.filter((_, i) => i !== index));
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow">
            <Card.Header className="bg-primary text-white">
              <h3>{step === 'upload' ? 'Upload Media' : 'Create Post'}</h3>
              {step === 'create' && (
                <div className="mt-2 small">
                  Media uploaded successfully! Now create your post.
                </div>
              )}
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger">
                  <p><strong>Error:</strong> {error}</p>
                  {(error.includes('Database connection') || error.includes('MongoDB')) && (
                    <p className="mt-2 mb-0">
                      <small>This appears to be a server database connection issue. Your media has been uploaded successfully.
                      You can try again later using the same media.</small>
                    </p>
                  )}
                  {step === 'create' && (
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      className="mt-2"
                      onClick={handleRetry}
                    >
                      <FontAwesomeIcon icon={faSync} className="me-1" />
                      Start Over
                    </Button>
                  )}
                </Alert>
              )}
              
              <Formik
                initialValues={{ description: '', files: null }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize={true}
              >
                {({
                  handleSubmit,
                  handleChange,
                  handleBlur,
                  values,
                  touched,
                  errors,
                  isSubmitting,
                  setFieldValue
                }) => (
                  <Form noValidate onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="description"
                        value={values.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.description && !!errors.description}
                        placeholder="Share your knowledge or learning experience..."
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.description}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    {step === 'upload' && (
                      <Form.Group className="mb-3">
                        <Form.Label>Upload Media (Max 3 files, images or videos)</Form.Label>
                        <Form.Control
                          type="file"
                          name="files"
                          onChange={(e) => handleFileChange(e, setFieldValue)}
                          onBlur={handleBlur}
                          isInvalid={touched.files && !!errors.files}
                          accept="image/*,video/*"
                          multiple
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.files}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                          You can upload up to 3 images, or 1 video (max 30 seconds)
                        </Form.Text>
                      </Form.Group>
                    )}
                    
                    {step === 'upload' && previews.length > 0 && (
                      <div className="mb-3">
                        <h5>Media Preview</h5>
                        <div className="d-flex flex-wrap gap-2">
                          {previews.map((file, index) => (
                            <div key={index} className="position-relative">
                              {file.type === 'image' ? (
                                <img 
                                  src={file.preview} 
                                  alt={`Preview ${index}`} 
                                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                  className="rounded"
                                />
                              ) : (
                                <video 
                                  src={file.preview} 
                                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                  className="rounded"
                                  controls
                                />
                              )}
                              <Button 
                                variant="danger" 
                                size="sm" 
                                className="position-absolute top-0 end-0"
                                onClick={() => removeFile(index, setFieldValue, values)}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {step === 'create' && uploadedMediaUrls.length > 0 && (
                      <div className="mb-3">
                        <h5>Uploaded Media</h5>
                        <div className="d-flex flex-wrap gap-2">
                          {uploadedMediaUrls.map((url, index) => (
                            <div key={index}>
                              {isVideo ? (
                                <video 
                                  src={url} 
                                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                  className="rounded"
                                  controls
                                />
                              ) : (
                                <img 
                                  src={url} 
                                  alt={`Uploaded ${index}`} 
                                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                  className="rounded"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="d-grid">
                      <Button 
                        variant="primary" 
                        type="submit" 
                        disabled={isSubmitting || isUploading}
                        className="mt-3"
                      >
                        {isSubmitting || isUploading ? (
                          step === 'upload' ? 'Uploading...' : 'Creating Post...'
                        ) : (
                          <>
                            <FontAwesomeIcon icon={step === 'upload' ? faUpload : faSync} className="me-2" />
                            {step === 'upload' ? 'Upload Media' : 'Create Post'}
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreatePost;