import PropTypes from "prop-types"
import React, { useState, useEffect } from 'react';
import { TextField, ChoiceSelect, NumberInput, MultipleChoice } from './FormComponents';

const DynamicForm = ({jsonUrl}) => {
    const [formData, setFormData] = useState({});
    const [formFields, setFormFields] = useState([]);
  
    const fetchJsonFile = async () => {
        try {
            fetch(jsonUrl)
              .then(res => res.json())
              .then(data => {
                setFormFields(data.entries)
              });
        } catch (error) {
            console.error('Error reading the file:', error);
        }
    }

    useEffect(() => {
        fetchJsonFile()
    }, []);
  
    const handleChange = (event, name, value) => {
      console.log("NAME", name)
      console.log("VALUE", value)
      console.log("FORMDATA", formData)
      setFormData({
        ...formData,
        [name]: value,
      });
    };
  
    const renderFormField = (field) => {
      switch (field.type) {
        case 'text':
          return (
            <TextField
                key={field.name}
                label={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
            />
          );
        case 'choice':
          return (
            <ChoiceSelect
                key={field.name}
                label={field.name}
                name={field.name}
                options={field.options}
                value={formData[field.name] || ''}
                onChange={handleChange}
            />
          );
        case 'number':
          return (
            <NumberInput
                key={field.name}
                label={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                min={field.range[0]}
                max={field.range[1]}
            />
          );
        case 'checkboxes':
          return (
            <MultipleChoice
                key={field.name}
                label={field.name}
                name={field.name}
                options={field.options}
                selectedOptions={formData[field.name] || []}
                onChange={handleChange}
            />
          );
        default:
          return null;
      }
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      console.log('Form Data:', formData);
      // TODO: generate pdf
    };
  
    return (
      <form onSubmit={handleSubmit}>
        {formFields.map((field) => renderFormField(field))}
        <button type="submit">Submit</button>
      </form>
    );
  };

DynamicForm.propTypes = {
  jsonUrl: PropTypes.string
}
  
export default DynamicForm;