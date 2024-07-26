import React, { Component } from "react";
import Chart from "react-apexcharts";
import "./chart.css";

export class BarChart1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      optionsMixedChart: {
        chart: {
          id: "revenue-lead-chart",
          toolbar: {
            show: false
          },
          background: 'transparent',
          fontFamily: 'Arial, sans-serif',
        },
        plotOptions: {
          bar: {
            columnWidth: "60%",
            borderRadius: 5,
            distributed: true,
          }
        },
        stroke: {
          width: [0, 4],
          curve: 'smooth'
        },
        xaxis: {
          categories: ["Sep 01", "Sep 02", "Sep 03", "Sep 04", "Sep 05", "Sep 06", "Sep 07"],
          labels: {
            style: {
              colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26a69a'],
              fontSize: '12px'
            }
          }
        },
        yaxis: {
          tickAmount: 5,
          min: 0,
          max: 50000,
          labels: {
            formatter: function(val) {
              return val.toLocaleString()
            },
            style: {
              colors: '#555',
              fontSize: '12px'
            }
          }
        },
        markers: {
          size: 6,
          strokeWidth: 3,
          fillOpacity: 1,
          strokeOpacity: 1,
          hover: {
            size: 8
          }
        },
        colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26a69a'],
        dataLabels: {
          enabled: false
        },
        legend: {
          show: true,
          position: 'top',
          horizontalAlign: 'right',
          markers: {
            width: 12,
            height: 12,
            radius: 12
          },
          itemMargin: {
            horizontal: 10,
            vertical: 0
          },
          labels: {
            colors: '#333'
          }
        },
        tooltip: {
          shared: true,
          intersect: false,
          y: {
            formatter: function (y) {
              if (typeof y !== "undefined") {
                return "$ " + y.toLocaleString();
              }
              return y;
            }
          }
        },
        grid: {
          borderColor: '#f1f1f1',
        },
        theme: {
          palette: 'palette1' // You can change this to palette2, palette3, etc.
        }
      },
      seriesMixedChart: [
        {
          name: "Revenue",
          type: "column",
          data: [38000, 42000, 35000, 18000, 5000, 49000, 25000]
        },
        {
          name: "Leads",
          type: "line",
          data: [42000, 45000, 25000, 19000, 8000, 25000, 10000]
        }
      ]
    };
  }

  render() {
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
        <h1 style={titleStyle}>Revenue vs Leads</h1>
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