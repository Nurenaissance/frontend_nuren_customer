import React, { useState, useEffect } from 'react';
import { Chart } from 'react-google-charts';
import axiosInstance from "../../api.jsx";

const DonutChart = () => {
  const [data, setData] = useState([['Stage', 'Count']]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('report/opportunity_stages/');
        const stagesData = response.data;

        // Assuming the data is already in the required format
        setData(stagesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2 style={{ textAlign: "center" }}>Opportunity Stage</h2>
      <Chart
        chartType="PieChart"
        width="100%"
        height="400px"
        data={data}
        options={{
          title: 'Opportunity Stage',
          pieHole: 0.4,
        }}
      />
    </div>
  );
};

export default DonutChart;
