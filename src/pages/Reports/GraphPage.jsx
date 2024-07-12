import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LabelList // Import LabelList from recharts
} from 'recharts';
import CustomTooltip from './CustomTooltip'; // Assuming CustomTooltip is imported from the same file

const GraphPage = ({ chartData, barChartData, donutChartData, reportId }) => {
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#d94a49', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const renderDonutChart = (data, innerRadius, outerRadius) => (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: ${value}`}
          outerRadius={outerRadius}
          innerRadius={innerRadius}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} /> {/* Use the custom tooltip */}
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderChart = () => {
    switch (reportId) {
      case 'lead_source':
        return (
          <>
            {/* Line Chart */}
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} /> {/* Use the custom tooltip */}
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
            {/* Bar Chart */}
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} /> {/* Use the custom tooltip */}
                <Legend />
                <Bar dataKey="value" fill="#8884d8">
                  <LabelList dataKey="value" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Donut Chart */}
            {renderDonutChart(donutChartData, 70, 150)}
          </>
        );
      case 'converted_leads':
      case 'total_calls':
      case 'sales this month':
        return (
          <>
            {/* Bar Chart */}
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} /> {/* Use the custom tooltip */}
                <Legend />
                <Bar dataKey="value" fill="#8884d8">
                  <LabelList dataKey="value" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Line Chart */}
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} /> {/* Use the custom tooltip */}
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
            {/* Donut Chart */}
            {renderDonutChart(donutChartData, 50, 140)}
          </>
        );
      case 'total_opportunities':
      case 'today_lead':
        return (
          <>
            {/* Donut Chart */}
            {renderDonutChart(donutChartData, 60, 160)}
            {/* Line Chart */}
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} /> {/* Use the custom tooltip */}
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
            {/* Bar Chart */}
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} /> {/* Use the custom tooltip */}
                <Legend />
                <Bar dataKey="value" fill="#8884d8">
                  <LabelList dataKey="value" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </>
        );
      case 'total_leads':
        return (
          <>
            {/* Bar Chart */}
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="email" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} /> {/* Use the custom tooltip */}
                <Legend />
                <Bar dataKey="createdOn" fill="#8884d8">
                  <LabelList dataKey="createdOn" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Line Chart */}
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} /> {/* Use the custom tooltip */}
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
            {/* Donut Chart */}
            {renderDonutChart(donutChartData, 80, 170)}
          </>
        );
      default:
        return (
          <>
            {/* Line Chart */}
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} /> {/* Use the custom tooltip */}
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
            {/* Bar Chart */}
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} /> {/* Use the custom tooltip */}
                <Legend />
                <Bar dataKey="value" fill="#8884d8">
                  <LabelList dataKey="value" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Donut Chart */}
            {renderDonutChart(donutChartData, 70, 150)}
          </>
        );
    }
  };

  return (
    <div className="graph-page">
      <div className="chart">{renderChart()}</div>
    </div>
  );
};

export default GraphPage;
