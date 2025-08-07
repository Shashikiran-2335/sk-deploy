// DropdownInput.js

import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Dropdown.css';

const Dropdown = ({ items,indexvalue,placeholder,contributions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  //const [index,setIndex] = useState(indexvalue);
  const inputRef = useRef(null);

 
  const handleInputChange = (e) => {
      setInputValue(e.target.value);
      const object=contributions[indexvalue];
      object.responsibility=e.target.value;
    //   console.log(contributions);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleItemClick = (item) => {
      setInputValue(item);
      const object=contributions[indexvalue];
      object.responsibility=item;
    setIsOpen(false);

  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="dropdown-input" ref={inputRef}>
      <input
        type="text"
        className="input-field"
        placeholder={placeholder}
        id={indexvalue}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && filteredItems.length > 0 && (
        <ul className="dropdown-menu">
          {filteredItems.map((item, index) => (
            <li
              key={index}
              className="dropdown-item"
              onClick={() => handleItemClick(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

Dropdown.propTypes = {
    items: PropTypes.arrayOf(PropTypes.string).isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    index: PropTypes.number.isRequired,
    placeholder: PropTypes.string,
  };
export default Dropdown;
