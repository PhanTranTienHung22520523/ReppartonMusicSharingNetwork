import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaCheckCircle, FaEnvelope } from 'react-icons/fa';
import { verifyEmail, sendVerificationCode, verifyCode } from '../api/auth';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const emailFromQuery = searchParams.get('email') || '';
  
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendSuccess, setResendSuccess] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [codeVerifySuccess, setCodeVerifySuccess] = useState('');

  useEffect(() => {
    if (emailFromQuery) {
      setResendEmail(emailFromQuery);
    }
  }, [emailFromQuery]);

  // Auto verify if token present
  useEffect(() => {
    if (token && !verified && !loading) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleVerify = async () => {
    if (!token) {
      setError('No verification token found');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyEmail(token);
      setVerified(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Link-based resend removed; use code-based flow instead

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCodeVerifySuccess('');

    try {
      await sendVerificationCode(resendEmail);
      setCodeSent(true);
      setResendSuccess('Verification code sent! Check your email.');
    } catch (err) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCodeVerifySuccess('');

    try {
      await verifyCode(resendEmail, code);
      setCodeVerifySuccess('Email verified successfully. Redirecting...');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.message || 'Code verification failed');
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
              {verified ? (
                <FaCheckCircle size={64} className="text-success mb-3" />
              ) : (
                <FaEnvelope size={64} className="text-primary mb-3" />
              )}
              <h3>{verified ? 'Email Verified!' : 'Email Verification'}</h3>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}
            {resendSuccess && <Alert variant="success">{resendSuccess}</Alert>}

            {verified ? (
              <Alert variant="success">
                Your email has been verified successfully. Redirecting to login...
              </Alert>
            ) : token ? (
              <div className="text-center">
                {loading && (
                  <>
                    <Spinner animation="border" variant="primary" className="mb-3" />
                    <p>Verifying your email...</p>
                  </>
                )}
              </div>
            ) : (
              <>
                <Alert variant="info">
                  Please enter your email and press "Send Verification Code" to receive a 6-digit code.
                </Alert>

                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <div className="d-grid gap-2">
                    <Button variant="outline-primary" onClick={handleSendCode} disabled={loading || !resendEmail}>
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Sending...
                        </>
                      ) : (
                        'Send Verification Code'
                      )}
                    </Button>

                    {/* Link-based resend removed - using code-based verification */}
                  </div>
                </Form>

                {codeSent && (
                  <Form className="mt-3" onSubmit={handleVerifyCode}>
                    <Form.Group className="mb-3">
                      <Form.Label>Verification Code</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter the 6-digit code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Button variant="success" type="submit" className="w-100" disabled={loading}>
                      Verify Code
                    </Button>
                  </Form>
                )}

                {codeVerifySuccess && <Alert variant="success" className="mt-3">{codeVerifySuccess}</Alert>}

                <div className="text-center mt-3">
                  <Button variant="link" onClick={() => navigate('/login')}>
                    Back to Login
                  </Button>
                </div>
              </>
            )}
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
}
