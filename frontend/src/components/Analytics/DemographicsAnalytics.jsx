import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import * as analyticsApi from '../../services/analyticsService';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const DemographicsAnalytics = ({ artistId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [demographics, setDemographics] = useState(null);

  useEffect(() => {
    fetchDemographics();
  }, [artistId]);

  const fetchDemographics = async () => {
    try {
      setLoading(true);
      const data = await analyticsApi.getArtistDemographics(artistId);
      setDemographics(data);
      setError(null);
    } catch (err) {
      setError('Failed to load demographics data');
      console.error('Demographics error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading demographics...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!demographics) {
    return <Alert variant="info">No demographics data available</Alert>;
  }

  // Age Groups Chart Data
  const ageGroupsData = {
    labels: Object.keys(demographics.ageGroups?.groups || {}),
    datasets: [{
      label: 'Age Distribution',
      data: Object.values(demographics.ageGroups?.groups || {}),
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
      ],
      borderWidth: 1,
    }],
  };

  // Gender Distribution Chart Data
  const genderData = {
    labels: Object.keys(demographics.gender?.distribution || {}),
    datasets: [{
      label: 'Gender Distribution',
      data: Object.values(demographics.gender?.distribution || {}),
      backgroundColor: [
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 99, 132, 0.6)',
        'rgba(75, 192, 192, 0.6)',
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(75, 192, 192, 1)',
      ],
      borderWidth: 1,
    }],
  };

  // Location Distribution Chart Data
  const locationData = {
    labels: Object.keys(demographics.locations?.countries || {}),
    datasets: [{
      label: 'Listeners by Country',
      data: Object.values(demographics.locations?.countries || {}),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div className="demographics-analytics">
      <h3 className="mb-4">🌍 Listener Demographics</h3>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5>📊 Total Unique Listeners</h5>
              <h2 className="text-primary">{demographics.totalListeners?.toLocaleString()}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="mb-4">
        {/* Age Distribution */}
        <Col md={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Body>
              <h5 className="mb-3">👥 Age Distribution</h5>
              <div style={{ height: '300px' }}>
                <Pie data={ageGroupsData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Gender Distribution */}
        <Col md={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Body>
              <h5 className="mb-3">⚧ Gender Distribution</h5>
              <div style={{ height: '300px' }}>
                <Pie data={genderData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Location Distribution */}
      <Row className="mb-4">
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-3">🗺️ Geographic Distribution</h5>
              <div style={{ height: '400px' }}>
                <Bar 
                  data={locationData} 
                  options={{
                    ...chartOptions,
                    indexAxis: 'y',
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }} 
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Top Countries & Cities */}
      <Row>
        <Col md={6} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-3">🏆 Top Countries</h5>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Country</th>
                      <th>Listeners</th>
                      <th>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demographics.topCountries?.map((country, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{country.country}</td>
                        <td>{country.listeners?.toLocaleString()}</td>
                        <td>{country.percentage?.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-3">🏙️ Top Cities</h5>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>City</th>
                      <th>Listeners</th>
                      <th>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demographics.topCities?.map((city, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{city.city}</td>
                        <td>{city.listeners?.toLocaleString()}</td>
                        <td>{city.percentage?.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DemographicsAnalytics;
