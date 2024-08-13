import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./callLogs.css"; // Assuming the CSS file is named callLogs.css

const CallLogs = () => {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const callIds = [
    "34742d26-de3c-4a76-81c0-ea578dfeee8c",
    "aaf62eba-62cb-4d8b-817c-51f52874967f",
    "8854962e-ec86-4b9e-a45b-7b7efa2ebd62",
    "e32a92fe-65a2-49dc-8e7f-29dad7a82125",
    "0be90aea-771c-4457-8434-b19076af258b",
    "a8888522-d424-4c59-933e-3080ac982f1c",
    "8e4d116d-1532-4055-8c99-d2f658694ca3",
    "43195eeb-b944-4928-8099-5e531517ff7d",
    "306fb211-a2d2-457a-92b2-7debbfa562ed",
    "445e8897-f81f-4d1f-ae29-222353bcbd41",
    "6d2caa11-ce35-4d25-b2d3-15b759ae8bb4",
    "f26d9a16-111f-4e49-a8ac-e172c39de8ea",
    "8a54dbe5-bbce-4907-aa80-44080dbb6c59",
    "4b984683-0aea-4ee5-8791-a4a7b9884e23",
    "1b73a031-bb5a-4399-a544-83ff88f3c0c9",
    "366b7695-6357-4467-be8c-ee8348f07287",
    "ccd57dda-bee9-4cf6-827d-80431f3d19a6",
    "c4aae507-4d75-4479-815b-d29d704bb652",
    "05b43962-4d65-4ffd-a347-d16fd3102cb9",
    "e9e45b4b-192e-4850-833d-9a7946f14aba",
    "48121006-5137-4578-94a0-e93098b38c4f",
    "6f7f2074-c1b9-429d-aa83-d9736e3a8848",
    "dc8e9d9c-0b22-4d37-92a5-7d4abbbf64b6",
    "3a31cffd-ae37-467a-83a8-6caa19615473",
    "3b95dee5-0043-418e-8fa9-4a8450a5daf8",
    "51877b73-bf92-47dd-844e-6662753bc5fc",
    "2f20d30d-c178-46c9-bd3c-6960ddfccb9a",
    "4a391fe7-3de4-4a5c-8ebf-9283c2cb8755",
    "e269d0f3-0478-4a30-a673-3bfff9524f31",
    "034a7725-6f0d-40d3-a848-e7bfb94fc733",
    "e55b782d-295b-4f24-8887-9b8b11baa132",
    "aac56141-775e-488e-8892-56f00e0be7fb",
    "95e1308e-2fec-49a8-9bf8-a72f179d4312",
    "5a314ea9-7175-4e65-bed9-a967b418224e",
    "36ef09ae-16e4-4d8e-bfa2-7b2345ee8a84",
    "a8f0c096-2c40-4c24-aa5b-ea34b33aee95",
    "922af112-dae7-435d-a5fb-eb4c3617351a",
    "6c5c5103-3a73-4638-9228-7c1c7c242a1a",
    "bf894ade-31e5-4ec6-99ed-32bae0e94d5c",
    "3d648eef-cb6a-4462-8ee1-1ea1a75a114e",
    "4798ae31-4531-44d7-a761-11008de3ca21",
    "07941881-10e6-4092-a2c7-57ee2b8f795b",
    "7fd0fe79-d7ca-4b6f-99ad-a016c81fcb4e",
    "62003ac2-1557-426b-a5b0-f605f611791f",
    "14575cc0-b3c8-45bf-b57d-76fe3bbfa1aa",
    "188ca631-2973-4887-b60e-4ac45565afc0",
    "128f81d8-f5ea-4cf1-92d7-ff1bb4248990",
    "938f3a12-6a0e-467a-b97f-785f51445d84",
    "81257902-a5ca-4ff5-ac1e-5c4ba1b12072",
    "0133ed03-bbdc-40d1-a9f4-db0f5b74bb23"
  ];

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const allResponses = await Promise.all(
        callIds.map(async (callId) => {
          const response = await axios.post('https://api.bland.ai/logs', {
            call_id: callId
          }, {
            headers: {
              Authorization: 'sk-7b7ga99r8bjlzd32o0gxm0cm4euirmjah50mzbxmt6rjcg0z05mm4jhmk29ckjfm69',
              'Content-Type': 'application/json',
            }
          });
          return response.data;
        })
      );

      const filteredData = allResponses.flatMap(response => {
       if (typeof response === 'object') {
          return [{
            to: response.to,
            concatenated_transcript: response.concatenated_transcript,
            queue_status: response.queue_status,
            summary: response.summary,
            price: response.price,
            max_duration: response.max_duration
          }];
        } else {
          console.error('Unexpected response format:', response);
          return []; // Empty array for unexpected responses
        }
      });
      setLogs(filteredData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleLogSelection = (log) => {
    setSelectedLog(log);
  };

  const filteredLogs = logs.filter(
    (log) => log.concatenated_transcript.toLowerCase().includes(searchTerm.toLowerCase()) ||
             log.to.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="call-container">
      <div className="contacts">
        <h2>Contacts</h2>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ul>
          {filteredLogs.map((log, index) => (
            <li key={index} onClick={() => handleLogSelection(log)}>
              <div>{log.to}</div>
            </li>
          ))}
        </ul>
      </div>
      <div className="conversation">
        <h2>Conversation</h2>
        {selectedLog && (
          <div className="conversation-text">
            {selectedLog.concatenated_transcript
              .split('\n')
              .map((text, index) => (
                <p key={index}>{text}</p>
              ))}
          </div>
        )}
      </div>
      <div className="details">
        <h2>Details</h2>
        {selectedLog && (
          <div>
            <p><strong>Queue Status:</strong> {selectedLog.queue_status}</p>
            <p><strong>Summary:</strong> {selectedLog.summary}</p>
            <p><strong>Price:</strong> {selectedLog.price}</p>
            <p><strong>Max Duration:</strong> {selectedLog.max_duration}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallLogs;
