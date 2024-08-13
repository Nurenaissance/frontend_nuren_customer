import React, { useState, useEffect } from 'react';
import "./chart.css";
import {
    LineChart,
    ResponsiveContainer,
    Legend,
    Tooltip,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import axiosInstance from "../../api";

export function LineChart1() {
    const [chartData, setChartData] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axiosInstance.get('generate-report/');
            console.log('API Response:', response.data);
            
            let dataToProcess = response.data;
            if (!Array.isArray(dataToProcess) && dataToProcess.data) {
                dataToProcess = dataToProcess.data;
            }
            if (!Array.isArray(dataToProcess)) {
                dataToProcess = [dataToProcess];
            }

            const processedData = dataToProcess.map(item => ({
                name: new Date(item.created_at).toLocaleDateString(),
                revenue: parseFloat(item.revenue),
                leadsAmount: parseFloat(item.leads_amount)
            }));

            setChartData(processedData);

            // Calculate total revenue
            const total = processedData.reduce((sum, item) => sum + item.revenue, 0);
            setTotalRevenue(total.toFixed(2));
        } catch (error) {
            console.error('Error fetching data:', error);
            setError(error.message);
        }
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (chartData.length === 0) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <h2 className="text-heading">Revenue Over Time</h2>
			<div className="linechart-container">
            <h2>Total Revenue: ${totalRevenue}</h2>
            <ResponsiveContainer width="100%" aspect={3}>
                <LineChart data={chartData} >
                    <CartesianGrid />
                    <XAxis dataKey="name" interval={"preserveStartEnd"} />
                    <YAxis />
                    <Legend />
                    <Tooltip />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="leadsAmount"
                        stroke="#82ca9d"
                    />
                </LineChart>
            </ResponsiveContainer>
			</div>
        </>
    );
}

export default LineChart1;