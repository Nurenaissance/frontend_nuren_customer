import React, { Component } from "react";
import Chart from "react-apexcharts";
import "./chart.css";
import axiosInstance from "../../api";

export class BarChart1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      optionsMixedChart: {
        // ... (keep the existing options)
      },
      seriesMixedChart: [
        {
          name: "Revenue",
          type: "column",
          data: []
        },
        {
          name: "Leads Amount",
          type: "line",
          data: []
        }
      ],
      error: null
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    try {
      const response = await axiosInstance.get('generate-report/');
      console.log('API Response:', response.data); // Debugging line

      let dataToProcess = response.data;

      // Check if the data is not an array but an object with a data property
      if (!Array.isArray(dataToProcess) && dataToProcess.data) {
        dataToProcess = dataToProcess.data;
      }

      // If it's still not an array, we'll treat it as a single item
      if (!Array.isArray(dataToProcess)) {
        dataToProcess = [dataToProcess];
      }

      const categories = dataToProcess.map(item => new Date(item.created_at).toLocaleDateString());
      const revenue = dataToProcess.map(item => parseFloat(item.revenue));
      const leadsAmount = dataToProcess.map(item => parseFloat(item.leads_amount));

      this.setState(prevState => ({
        optionsMixedChart: {
          ...prevState.optionsMixedChart,
          xaxis: {
            ...prevState.optionsMixedChart.xaxis,
            categories: categories
          }
        },
        seriesMixedChart: [
          {
            ...prevState.seriesMixedChart[0],
            data: revenue
          },
          {
            ...prevState.seriesMixedChart[1],
            data: leadsAmount
          }
        ]
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
      this.setState({ error: error.message });
    }
  }

  render() {
    const { error } = this.state;

    if (error) {
      return <div>Error: {error}</div>;
    }

    if (this.state.seriesMixedChart[0].data.length === 0) {
      return <div>Loading...</div>;
    }

    const chartContainerStyle = {
      background: 'linear-gradient(to right, #f6f9fc, #ffffff)',
      borderRadius: '15px',
      padding: '20px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      maxWidth: '800px',
      margin: '0 auto',
    };

    const titleStyle = {
      textAlign: 'center',
      color: '#333',
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '20px',
      textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
    };

    return (
      <div className="app" style={chartContainerStyle}>
        <h1 style={titleStyle}>Revenue vs Leads Amount</h1>
        <Chart
          options={this.state.optionsMixedChart}
          series={this.state.seriesMixedChart}
          type="line"
          width="100%"
          height="400px"
        />
      </div>
    );
  }
}