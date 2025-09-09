import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { getRecentSongs } from '../api/discoverService';
import SongCard from '../components/SongCard';
import { useNavigate } from 'react-router-dom';

function RecentSongs() {
  const [recentSongs, setRecentSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadRecentSongs = async (pageNum = 0, append = false) => {
    if (!user?.id) {
      setError('Bạn cần đăng nhập để xem lịch sử nghe nhạc');
      setLoading(false);
      return;
    }

    try {
      setLoading(pageNum === 0);
      const limit = 20; // Load 20 songs per page
      const response = await getRecentSongs(user.id, limit, pageNum);
      
      if (response.success && response.data) {
        const newSongs = response.data;
        
        if (append) {
          setRecentSongs(prev => [...prev, ...newSongs]);
        } else {
          setRecentSongs(newSongs);
        }
        
        // Check if there are more songs
        setHasMore(newSongs.length === limit);
      } else {
        setError(response.message || 'Không thể tải danh sách bài hát gần đây');
      }
    } catch (error) {
      console.error('Error loading recent songs:', error);
      setError('Có lỗi xảy ra khi tải bài hát gần đây');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecentSongs();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadRecentSongs(nextPage, true);
  };

  if (loading && page === 0) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h2 className="mb-1">🎵 Nghe gần đây</h2>
              <p className="text-muted mb-0">Những bài hát bạn đã nghe gần đây</p>
            </div>
            <Button variant="outline-secondary" onClick={() => navigate('/')}>
              ← Về trang chủ
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger">{error}</Alert>
          </Col>
        </Row>
      )}

      {!error && recentSongs.length === 0 && (
        <Row>
          <Col>
            <Card className="text-center py-5">
              <Card.Body>
                <h5>🎧 Chưa có lịch sử nghe nhạc</h5>
                <p className="text-muted">Hãy bắt đầu nghe nhạc để xem lịch sử tại đây!</p>
                <Button variant="primary" onClick={() => navigate('/discover')}>
                  Khám phá âm nhạc
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {recentSongs.length > 0 && (
        <>
          <Row>
            {recentSongs.map((song, index) => (
              <Col key={`${song.id}-${index}`} xs={12} sm={6} md={4} lg={3} className="mb-4">
                <SongCard song={song} />
              </Col>
            ))}
          </Row>

          {hasMore && (
            <Row className="mt-4">
              <Col className="text-center">
                <Button 
                  variant="outline-primary" 
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Đang tải...
                    </>
                  ) : (
                    'Xem thêm bài hát'
                  )}
                </Button>
              </Col>
            </Row>
          )}
        </>
      )}
    </Container>
  );
}

export default RecentSongs;
