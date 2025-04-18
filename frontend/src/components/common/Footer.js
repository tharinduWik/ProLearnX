import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-5">
      <Container className="text-center">
        <p className="mb-0">© {new Date().getFullYear()} ProLearnX - The Ultimate Skill Sharing & Learning Platform</p>
        <p className="small mt-2 mb-0">
          Share your IT skills, track your progress, and join our community of learners
        </p>
      </Container>
    </footer>
  );
};

export default Footer;