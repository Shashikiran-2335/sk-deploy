import './FacultyInformationForm.css';
import React, { useState } from 'react';
import { useAuth } from '../security/AuthContext';

export default function FacultyInformationForm() {
    const authContext = useAuth();
    const [facultyData, setFacultyData] = useState({
        name: '',
        department: '',
        teachingexperience: 0,
        industryexperience: 0,
        joining_date: '',
        designation: '',
        total_experience: 0
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFacultyData({
            ...facultyData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            nameoftheFaculty: facultyData.name,
            joiningdate: facultyData.joining_date,
            department: facultyData.department,
            designation: facultyData.designation,
            teachingExperience: facultyData.teachingexperience,
            industryExperience: facultyData.industryexperience,
            totalExperience: facultyData.total_experience
        };
        authContext.UpdateFacultyInformationFormHandle(data);
    };

    return (
        <div className="form-group-container">
            <h2>Faculty Information Form</h2>
            <form onSubmit={handleSubmit}>
                <table>
                    <thead>
                        <tr>
                            <th colSpan="2">Faculty Information</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <div className="form-group">
                                    <label htmlFor="name">Name of the Faculty:</label>
                                    <input type="text" id="name" name="name" value={facultyData.name} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="department">Department:</label>
                                    <input type="text" id="department" name="department" value={facultyData.department} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <div id="teaching_industry_experience">
                                        <div id="teaching_experience">
                                            <label htmlFor="teachingexperience">Teaching:</label>
                                            <input type="number" name="teachingexperience" value={facultyData.teachingexperience} onChange={handleInputChange} placeholder="Teaching" />
                                        </div>
                                        <div id="industry_experience">
                                            <label htmlFor="industryexperience">Industry:</label>
                                            <input type="number" name="industryexperience" value={facultyData.industryexperience} onChange={handleInputChange} placeholder="Industry" />
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div className="form-group">
                                    <label htmlFor="joining_date">Date of Joining:</label>
                                    <input type="date" id="joining_date" name="joining_date" value={facultyData.joining_date} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="designation">Designation:</label>
                                    <input type="text" id="designation" name="designation" value={facultyData.designation} onChange={handleInputChange} />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="total_experience">Total experience (Years):</label>
                                    <input type="number" id="total_experience" name="total_experience" value={facultyData.total_experience} onChange={handleInputChange} />
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div className="form-group">
                    <input type="submit" value="Submit" />
                </div>
            </form>
        </div>
    );
}

        // try {
        //     const response = await axios.post("http://localhost:8080/updateFacultyInformationForm", {
        //         nameoftheFaculty: facultyData.name,
        //         joiningdate: facultyData.joining_date,
        //         department: facultyData.department,
        //         designation: facultyData.designation,
        //         teachingExperience: facultyData.teachingexperience,
        //         industryExperience: facultyData.industryexperience,
        //         totalExperience: facultyData.total_experience
        //     });
        //     console.log(response.data);
        // } catch (error) {
        //     console.error("There was an error submitting the form:", error);
        // }