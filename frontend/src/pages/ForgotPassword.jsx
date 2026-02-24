import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaEnvelope } from 'react-icons/fa';
import { forgotPassword } from '../api/auth';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <div className="d-flex justify-content-center">
        <Card style={{ width: '500px' }}>
          <Card.Body className="p-4">
            <div className="text-center mb-4">
              <FaEnvelope size={64} className="text-primary mb-3" />
              <h3>Forgot Password</h3>
              <p className="text-muted">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            {success ? (
              <>
                <Alert variant="success">
                  <strong>Email sent!</strong> Please check your inbox for the password reset link.
                  The link will expire in 1 hour.
                </Alert>
                <div className="text-center mt-3">
                  <Button variant="primary" onClick={() => navigate('/login')}>
                    Back to Login
                  </Button>
                </div>
              </>
            ) : (
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>

                <div className="text-center mt-3">
                  <Button variant="link" onClick={() => navigate('/login')}>
                    Back to Login
                  </Button>
                </div>
              </Form>
            )}
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}
