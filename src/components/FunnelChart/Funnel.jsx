import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import axiosInstance from "../../api.jsx";

const Funnel = () => {
  const [seriesData, setSeriesData] = useState([{
    name: "Funnel Series",
    data: [],
  }]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('report/lead_stages/');
        const leadStagesData = response.data;

        // Assuming the data comes as an array of arrays
        const categoriesData = [];
        const data = [];
        leadStagesData.forEach((stage, index) => {
          if (index > 0) { // Skip the first item as it is the header
            categoriesData.push(stage[0]);
            data.push(stage[1]);
          }
        });

        setCategories(categoriesData);
        setSeriesData([{ name: "Funnel Series", data: data }]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const options = {
    series: seriesData,
    chart: {
      type: 'bar',
      height: 350,
    },
    plotOptions: {
      bar: {
        borderRadius: 5,
        horizontal: true,
        barHeight: '80%',
        isFunnel: true,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val, opt) {
        return opt.w.globals.labels[opt.dataPointIndex] + ':  ' + val;
      },
      dropShadow: {
        enabled: true,
      },
    },
    title: {
      text: 'Lead Stage',
      align: 'middle',
    },
    xaxis: {
      categories: categories,
    },
    legend: {
      show: false,
    },
  };

  return (
    <div className="funnel-chart">
      <Chart options={options} series={seriesData} type="bar" height={350} />
    </div>
  );
};

export default Funnel;
