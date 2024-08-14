import axios from "axios";
import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { Link, useParams } from "react-router-dom";
import "./TaskTable.jsx";
import axiosInstance from "../../api.jsx";
import TopNavbar from "../TopNavbar/TopNavbar.jsx";
import "./task.css";
import { useAuth } from '../../authContext.jsx'


const getTenantIdFromUrl = () => {
  // Example: Extract tenant_id from "/3/home"
  const pathArray = window.location.pathname.split('/');
  if (pathArray.length >= 2) {
    return pathArray[1]; 
  }
  return null;
};
export const Taskinfo=()=>{
  const { userId } = useAuth();
  const tenantId = getTenantIdFromUrl();
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showAllFiles, setShowAllFiles] = useState(false);
  

  const [addtasktable, setAddTaskTable] = useState({
    subject: "",
    due_date: "",
    status: "",
    priority: "",
    description: "",
    contact: null,
    account: "",
    createdBy: "",
    related_to: "",
    Reminder: "",
    repeat: "",
    closedTime: "",
    Notes: "",
    modifiedBy: "",
  });

  const { id } = useParams();

  const renderFiles = (files) => {
    return files.map((file, index) => (
      <li key={index} className="account-file-item">
        <span className="file-icon">📄</span>
        <a href={file.url} target="_blank" rel="noopener noreferrer">{file.name}</a>
      </li>
    ));
  };

  const handleUploadedFile = async (event) => {
    const selectedFile = event.target.files[0];
    console.log('Selected file:', selectedFile);
    
    if (selectedFile) {
      setFile(selectedFile);
      console.log('File state set:', selectedFile);

      try {
        console.log('Uploading file to Azure Blob Storage...');
        const fileUrl = await uploadToBlob(selectedFile, userId, tenantId);
        console.log('File uploaded to Azure, URL:', fileUrl);

        console.log('Sending POST request to backend...');
        const response = await axiosInstance.post('/documents/', {
          name: selectedFile.name,
          document_type: selectedFile.type,
          description: 'Your file description',
          file_url: fileUrl,
          entity_type: 12,
          entity_id: id,
          tenant: tenantId,
        });
        console.log('POST request successful, response:', response.data);

        setUploadedFiles(prevFiles => [...prevFiles, { name: selectedFile.name, url: fileUrl }]);
        console.log('File uploaded successfully:', response.data);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    } else {
      console.log('No file selected');
    }
  };
  const handleMoreClick = () => {
    setShowAllFiles(!showAllFiles);
  };

  useEffect(() => {
    const fetchUploadedFiles = async () => {
      try {
        const response = await axiosInstance.get(`/documents/?entity_type=10&entity_id=${id}`);
        setUploadedFiles(response.data);
        
      } catch (error) {
        console.error("Error fetching uploaded files:", error);
      }
    };
    fetchUploadedFiles();
  }, [id, tenantId, ]);
  

            const [meetings, setMeetings] = useState([]);
            useEffect(() => {
                const fetchTaskData = async () => {
                  try {
                    const response = await axiosInstance.get(`/tasks/${id}`);
                  
                    setAddTaskTable(response.data);
                  } catch (error) {
                    console.error("Error fetching account data:", error);
                  }
                };
            
                fetchTaskData();
              }, [id]);
             
              const handleChange = (e) => {
                const { name, value } = e.target;
                setEditedTask((prev) => ({ ...prev, [name]: value }));
              };
            
            
              const handleSubmit = async () => {
                try {
                  const response = await axiosInstance.put(`/tasks/${id}/`, editedTask);
                  setAddTaskTable(response.data);
                  setIsEditing(false);
                  console.log("Task information updated successfully:", response.data);
              
                  const interactionData = {
                    entity_type: "tasks",
                    entity_id: id,
                    interaction_type: "Task Update",
                    tenant_id: tenantId,
                    notes: `Task updated. New details - Priority: ${editedTask.priority}, Due Date: ${editedTask.due_date}, Status: ${editedTask.status}, Related To: ${editedTask.related_to}, Task Owner: ${editedTask.account}, Description: ${editedTask.description}, Tenant: ${editedTask.tenant}`,
                    interaction_datetime: new Date().toISOString(),
                  };
              
                  await axiosInstance.post('/interaction/', interactionData);
                  console.log('Interaction logged successfully');
                } catch (error) {
                  console.error("Error updating task information:", error);
                }
              };
              
              
              const handleCancel = () => {
                setIsEditing(false);
                setEditedTask(addtasktable); // Revert back to original task information
              };
              const handleAddNote = (event) => {
                event.preventDefault();
                const newNote = {
                  id: new Date().getTime(),
                  text: addtasktable.Notes,
                };
                setAddTaskTable({
                    ...addtasktable,
                    RecentNotes: [newNote, ...addtasktable.RecentNotes],
                    Notes: "",
                  });
                };
            
                const handleEdit = () => {
                  setIsEditing(true);
                  // Initialize editedTask with the current task details
                  setEditedTask({
                    priority: addtasktable.priority,
                    due_date: addtasktable.due_date,
                    status: addtasktable.status,
                    related_to: addtasktable.related_to,
                    account: addtasktable.account,
                    createdBy: addtasktable.createdBy,
                    contact: addtasktable.contact,
                    subject: addtasktable.subject,
                    Reminder: addtasktable.Reminder,
                    repeat: addtasktable.repeat,
                    closedTime: addtasktable.closedTime,
                    Notes: addtasktable.Notes,
                    modifiedBy: addtasktable.modifiedBy,
                  });
                };
                
                  const handleAttach = () => {
                    console.log("Attach happened");
                  };
                  const handleNew = () => {
                    console.log("Add New happened");
                  };
                
                  const toggleAdditionalDetails = () => {
                    setAddTaskTable(!addtasktable);
                  };
                  const handleAddMeeting = (event) => {
                    event.preventDefault();
                    const newMeeting = {
                      CadenceName: addtasktable.CadenceName,
                      Modules: addtasktable.Modules,
                      CreatedDate: addtasktable.CreatedDate,
                      CreatedBy: addtasktable.createdBy,
                    };
                    setMeetings([...meetings, newMeeting]);
                    setAddTaskTable({
                      ...addtasktable,
                      CadenceName: "",
                      Modules: "",
                      CreatedDate: "",
                      createdBy: "",
                    });
                    setIsModalOpen(false);
                  };
                  const handleCloseTask = () => {
                    setIsModalOpen(true);
                  };
                  const handleCancelCloseTask = () => {
                    setIsModalOpen(false);
                  };
                 
                  const handleConfirmCloseTask = () => {
                    setIsCompleted(true); // Mark the task as completed
                    setIsModalOpen(false);
                  };
                  const handleEditNotes = () => {
                    setIsEditing(true); // Set isEditing state to true to enable editing mode for notes
                  };
                  

  return (
    <div>
       <div className="right_div-taskinfo">
      <TopNavbar/>
     </div>
      <div className="alltogether">
        <div className="subjectlist">
        
          <Link to={`../${tenantId}/tasks`}  id='back-inter-task' >
            Back
          </Link>
        
        </div>

        <div className="addtasks">
          <div className="task-head">
            <h1>Tasks Info</h1>
          </div>
          <div className="combine">
          
            
 {!isEditing && (
  <div className="para1">
    <ul>
      <li className='task-info-data'>Priority - <span className='task-prior'>{addtasktable.priority}</span></li>
      <li className='task-info-data'>Due Date - <span className='task-prior'>{addtasktable.due_date}</span></li>
      <li className='task-info-data'>Status - <span className='task-prior'>{addtasktable.status}</span></li>
      <li className='task-info-data'>Related To - <span className='task-prior'>{addtasktable.related_to}</span></li>
      <li className='task-info-data'>Task Owner - <span className='task-prior'>{addtasktable.account}</span></li>
      <li className='task-info-data'>Description - <span className='task-prior'>{addtasktable.description}</span></li>
      <li className='task-info-data'>Tenant - <span className='task-prior'>{addtasktable.tenant}</span></li>
    </ul>
    <button onClick={handleEdit} className='task-edit'> Edit</button>
  </div>
)}

{isEditing && (
  <div className="para1">
    <ul>
      <li className='task-info-data'>Priority - <input type="text" name="priority" className='edit-task-data' value={editedTask.priority} onChange={handleChange} /></li>
      <li className='task-info-data'>Due Date - <input type="text" name="due_date" className='edit-task-data' value={editedTask.due_date} onChange={handleChange} /></li>
      <li className='task-info-data'>Status - <input type="text" name="status" className='edit-task-data' value={editedTask.status} onChange={handleChange} /></li>
      <li className='task-info-data'>Related To - <input type="text" name="related_to"  className='edit-task-data' value={editedTask.related_to} onChange={handleChange} /></li>
      <li className='task-info-data'>Task Owner - <input type="text" name="account" className='edit-task-data' value={editedTask.account} onChange={handleChange} /></li>
      <li className='task-info-data'>Description - <input type="text" name="description" className='edit-task-data' value={editedTask.description} onChange={handleChange} /></li>
      <li className='task-info-data'>Tenant - <input type="text" name="tenant" className='edit-task-data' value={editedTask.tenant} onChange={handleChange} /></li>
    </ul>
    <div>
      <button onClick={handleSubmit} className='task-edit-save'>Save</button>
      <button onClick={handleCancel} className='task-edit-cancel'>Cancel</button>
    </div>
  </div>
)}


              <div className="closetask">
                <button
                  className="close-task-button"
                  onClick={isCompleted ? undefined : handleCloseTask}
                >
                  {isCompleted ? "Completed" : "Close Task"}
                </button>
                <Modal
                  isOpen={isModalOpen}
                  onRequestClose={handleCancelCloseTask}
                >
                  <div className="modal-content">
                    <h2>
                      Are you sure you want to mark this task as completed?
                    </h2>
                    <div className="modal-buttons">
                      <button onClick={handleConfirmCloseTask}>
                        Mark as completed
                      </button>
                      <button onClick={handleCancelCloseTask}>Cancel</button>
                    </div>
                  </div>
                </Modal>
             
            </div>
          </div>

          <div className="info-task-show">
            <div className="hidedetail">
              <button onClick={toggleAdditionalDetails}>
                {addtasktable ? "Hide Details" : "Show Details"}
              </button>
            </div>
            <hr />

            <div className="showdetails"></div>
            {addtasktable && (
              <div className="detail">
                <h1 className='task-info-head'>Task Information :</h1>
                <div className="para1">
                {!isEditing && (
  <div className="hide-task-info">
    <ul>
      <li className='task-info-data1'>Task Owner - <span className='task-prior'>{addtasktable.contact}</span></li>
      <li className='task-info-data1'>Subject - <span className='task-prior'>{addtasktable.subject}</span></li>
      <li className='task-info-data1'>Due Date - <span className='task-prior'>{addtasktable.due_date}</span></li>
      <li className='task-info-data1'>Related To - <span className='task-prior'>{addtasktable.related_to}</span></li>
      <li className='task-info-data1'>Status - <span className='task-prior'>{addtasktable.status}</span></li>
      <li className='task-info-data1'>Priority - <span className='task-prior'>{addtasktable.priority}</span></li>
      <li className='task-info-data1'>Created By - <span className='task-prior'>{addtasktable.createdBy}</span></li>
    </ul>
    <button onClick={handleEdit} className='task-edit1'>Edit</button>
  </div>
)}

{isEditing && (
  <div className="hide-task-info">
    <ul>
      <li className='task-info-data1'>Task Owner - <input type="text"  className='edit-task-data' name="contact" value={editedTask.contact} onChange={handleChange} /></li>
      <li className='task-info-data1'>Subject - <input type="text" name="subject" className='edit-task-data' value={editedTask.subject} onChange={handleChange} /></li>
      <li className='task-info-data1'>Due Date - <input type="text" name="due_date"  className='edit-task-data' value={editedTask.due_date} onChange={handleChange} /></li>
      <li className='task-info-data1'>Related To - <input type="text" name="related_to" className='edit-task-data'  value={editedTask.related_to} onChange={handleChange} /></li>
      <li className='task-info-data1'>Status - <input type="text" name="status" className='edit-task-data' value={editedTask.status} onChange={handleChange} /></li>
      <li className='task-info-data1'>Priority - <input type="text" name="priority" className='edit-task-data' value={editedTask.priority} onChange={handleChange} /></li>
      <li className='task-info-data1'>Created By - <input type="text" name="createdBy"className='edit-task-data' value={editedTask.createdBy} onChange={handleChange} /></li>
    </ul>
    <div>
      <button onClick={handleSubmit} className='task-edit1-save1'>Save</button>
      <button onClick={handleCancel} className='task-edit1-cancel1'>Cancel</button>
    </div>
  </div>
)}

                </div>
              </div>
            )}
          </div>
          <div className="info-noteee">
  <div className="notes-container">
    <div className="recent">
      <div >
        <h1 className="notes">Notes</h1>
      </div>

      <div>
        <button className="recent-notes-button">Recent Notes</button>

        <ul className="recent-notes-list">
          {/* Display recent notes here */}
        </ul>
      </div>
    </div>

    {!isEditing && (
      <div>
        <textarea
          name="Notes"
          value={editedTask.Notes}
          onChange={handleChange}
          className="notes-textarea"
          placeholder="add a note........"
        ></textarea>
        <div>
          <button onClick={handleEditNotes} className='task-edit1'>Edit</button>
         
        </div>
      </div>
    )}

    {isEditing && (
      <form className='form_taskk' onSubmit={handleSubmit}>
        <textarea
          name="Notes"
          value={editedTask.Notes}
          onChange={handleChange}
          className="notes-textarea"
          placeholder="add a note........"
        ></textarea>
        <div>
          <button type="submit"  className='task-edit1-save1'>Save</button>
          <button onClick={handleCancel} className='task-edit1-cancel1'>Cancel</button>
        </div>
      </form>
    )}
  </div>
</div>

          <div className="info-attach-task">
            <div >
              <div className="attachments-heads">
                <h2>Attachments</h2>
              </div>
              <div className="attachment-upload2-task">
              <input
          type="file"
          id="attachment-input"
          onChange={handleUploadedFile}
          style={{ display: 'none' }}
        />
  <label htmlFor="attachment-input1" className="clicktoupload2">Upload</label>
  
</div>
<div className="uploaded-files-task">{/*important*/}
          <ul>
            {renderFiles(uploadedFiles.slice(0, 3))}
          </ul>
          {uploadedFiles.length > 3 && (
            <a href="#" className="show-more-button" onClick={handleMoreClick}>
              Show More
              {showAllFiles ? ' Show Less' : ''}
            </a>
          )}
        </div>
        {showAllFiles && (
          <div className="popup">
            <div className="popup-content">
              <h2>Uploaded Files</h2>
              <button className="close-button" onClick={handleMoreClick}>Close</button>
              <ul>
                {renderFiles(uploadedFiles)}
              </ul>
            </div>
          </div>
        )}
            </div>
          </div>
          
          <div className="info-link">
            <div className="info1">
              <div className="heads">
                <h2>Links</h2>

              </div>
              <div className="linksbtn">
              <button>+Add Manage</button>
            </div>
              
            </div>
          </div>
          <div className="info-action">
            <div className="heads">
              <h2>Upcoming Actions</h2>

            </div>
            <div className="linksbtn">
              <button>+Add Data</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Taskinfo;
