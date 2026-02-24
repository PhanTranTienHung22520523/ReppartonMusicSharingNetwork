import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMusic, FaCheck } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalContainer = styled(motion.div)`
  width: 100%;
  max-width: 600px;
  background: rgba(30, 30, 30, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(29, 185, 84, 0.1) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
  }
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #fff 0%, #b3b3b3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 12px;
`;

const Subtitle = styled.p`
  color: #b3b3b3;
  font-size: 1.1rem;
  margin-bottom: 32px;
  line-height: 1.5;
`;

const GenresGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  margin-bottom: 32px;
`;

const GenrePill = styled(motion.button)`
  background: ${props => props.selected ? 'rgba(29, 185, 84, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.selected ? '#1db954' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.selected ? '#1db954' : '#fff'};
  padding: 12px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: ${props => props.selected ? 'rgba(29, 185, 84, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
    transform: translateY(-2px);
  }
`;

const SubmitButton = styled(motion.button)`
  background: linear-gradient(90deg, #1db954 0%, #17a74a 100%);
  color: #000;
  border: none;
  padding: 16px 40px;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  opacity: ${props => props.disabled ? 0.5 : 1};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 0 20px rgba(29, 185, 84, 0.4);
  }
`;

const GENRES = [
    'Pop', 'Rock', 'R&B', 'Hip Hop', 'Jazz',
    'Electronic', 'Classical', 'Indie', 'Country', 'K-Pop',
    'Blues', 'Metal', 'Reggae', 'Soul', 'Latin'
];

const OnboardingModal = () => {
    const { user, login } = useAuth(); // login to update user state after onboarding
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [loading, setLoading] = useState(false);

    const toggleGenre = (genre) => {
        if (selectedGenres.includes(genre)) {
            setSelectedGenres(selectedGenres.filter(g => g !== genre));
        } else {
            setSelectedGenres([...selectedGenres, genre]);
        }
    };

    const handleSubmit = async () => {
        if (selectedGenres.length < 3) return;
        setLoading(true);

        try {
            const response = await axios.post(
                `http://localhost:8081/api/users/${user.id}/onboarding`, // Assuming user-service port
                { preferredGenres: selectedGenres },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.data.success) {
                // Update user context manually or re-fetch profile
                // For simplicity, we assume parent component handles re-fetch or we reload
                // Or optimally, update auth context:
                const updatedUser = { ...user, isOnboarded: true, preferredGenres: selectedGenres };
                // We might need a way to update auth context state directly
                window.location.reload(); // Simple brute force to refresh state from server
            }
        } catch (error) {
            console.error("Onboarding failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <Overlay
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <ModalContainer
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                >
                    <Content>
                        <Title>Welcome to Repparton</Title>
                        <Subtitle>
                            To give you the best recommendations, tell us what kind of music moves you.
                            <br />Select at least 3 genres.
                        </Subtitle>

                        <GenresGrid>
                            {GENRES.map(genre => (
                                <GenrePill
                                    key={genre}
                                    selected={selectedGenres.includes(genre)}
                                    onClick={() => toggleGenre(genre)}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {selectedGenres.includes(genre) && <FaCheck size={12} />}
                                    {genre}
                                </GenrePill>
                            ))}
                        </GenresGrid>

                        <SubmitButton
                            onClick={handleSubmit}
                            disabled={selectedGenres.length < 3 || loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {loading ? 'Setting up...' : `Start Listening (${selectedGenres.length}/3)`}
                        </SubmitButton>
                    </Content>
                </ModalContainer>
            </Overlay>
        </AnimatePresence>
    );
};

export default OnboardingModal;
