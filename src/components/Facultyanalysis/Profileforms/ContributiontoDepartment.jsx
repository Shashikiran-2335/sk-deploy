import React, { useState } from 'react';
import './ContributiontoSchoolForm.css';
import Dropdown from './Dropdown/Dropdown';

const ContributiontoDepartmentForm = () => {
  const [contributions, setContributions] = useState([{ responsibility: '', contribution: '', score: '' }]);

  const handleInputChange = (index, event) => {
    const { name, value } = event.target;
    const newContributions = [...contributions];
    newContributions[index][name] = value;
    setContributions(newContributions);
  };

  const handleAddRow = () => {
    setContributions([...contributions, { responsibility: '', contribution: '', score: '' }]);
  };

  const handleRemoveRow = (index) => {
    const newContributions = contributions.filter((_, i) => i !== index);
    setContributions(newContributions);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Add your submit logic here
    console.log(contributions);
  };

  return (
    <div className="contribution-form-container">
      <h3>Contribution to the Department</h3>
      <form onSubmit={handleSubmit}>
        <table className="table">
          <thead>
            <tr>
              <th>Responsibility / Activity</th>
              <th>Contribution(s)</th>
              <th>Score</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contributions.map((contribution, index) => (
              <tr key={index}>
                <td>
                  <Dropdown items={[' Class in-charge',
                    ' Timetable in-charge',
                    ' sponsored projects',
                    '  departmental newsletter',
                    '  Workshops',
                    '  conferences',
                    '  seminars',
                    '  FDP',
                    '  Hack-a-thon',
                    ' NAAC Work',
                    ' NBA Work',
                    ' NIRF work',
                    ' UGC Work',
                  ]}
                  placeholder={'Enter Responsibility/Activity organized '}
                  value={contribution.responsibility}
                //onChange={handleInputChange(index)}
                contributions={contributions}
                indexvalue={index}
                  />
                  {/* <input
                    list={`responsibilities-${1000+index}`}
                    name="responsibility"
                    placeholder="Enter Responsibility/Activity organized"
                    value={contribution.responsibility}
                    onChange={(event) => handleInputChange(index, event)}
                    className="input-field"
                  /> */}
                  {/* <datalist id={`responsibilities-${1000+index}`}>
                    {[
                     ' Class in-charge',
                    ' Timetable in-charge',
                    ' sponsored projects',
                    '  departmental newsletter',
                    '  Workshops',
                    '  conferences',
                    '  seminars',
                    '  FDP',
                    '  Hack-a-thon',
                    ' NAAC Work',
                    ' NBA Work',
                    ' NIRF work',
                    ' UGC Work',
                    ].map((item, idx) => (
                      <option key={idx} value={item} />
                    ))}
                  </datalist> */}
                </td>
                <td>
                  <input
                    type="text"
                    name="contribution"
                     placeholder="Enter Contribution's"
                    value={contribution.contribution}
                    onChange={(event) => handleInputChange(index, event)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    name="score"
                    value={contribution.score}
                    onChange={(event) => handleInputChange(index, event)}
                  />
                </td>
                <td>
                  <button type="button" className='Action-btns' onClick={() => handleRemoveRow(index)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="actions-container-contribution">
          <button type="button" className='Action-btns' onClick={handleAddRow}>Add</button>
          <button type="submit" className='Action-btns'>Submit</button>
        </div>
      </form>
    </div>
  );
};

export default ContributiontoDepartmentForm;
