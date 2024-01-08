import React from "react";
import PropTypes from "prop-types";

// Text field component
const TextField = ({ label, name, value, onChange, big }) => {
    const Tag = (big) ? "textarea" : "input";

    return (
        <div>
            <label>{label || name}</label>
            <Tag type={big ? null : "text"} name={name} value={value} onChange={(e) => onChange(e, name, e.target.value)} />
        </div>
    );
};

TextField.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    onChange: PropTypes.func,
    value: PropTypes.string,
    big: PropTypes.bool,
};

TextField.defaultProps = {
    big: false,
}

// Choice select component
const ChoiceSelect = ({ label, name, options, value, onChange }) => {
    return (
        <div>
            <label>{label || name}</label>
            <select name={name} value={value} onChange={(e) => onChange(e, name, e.target.value)}>
                {(options ? options : {}).map((option, index) => (
                    <option key={index} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
};

ChoiceSelect.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    onChange: PropTypes.func,
    options: PropTypes.array,
    value: PropTypes.string,
};

// Number input component
const NumberInput = ({ label, name, value, onChange }) => {
    if (isNaN(value) || isNaN(parseFloat(value))) {
        value = "";
    }
    return (
        <div>
            <label>{label || name}</label>
            <input
                name={name}
                type="number"
                value={value}
                onChange={(e) => onChange(e, name, e.target.value)}
            />
        </div>
    );
};

NumberInput.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    onChange: PropTypes.func,
    value: PropTypes.string,
};

// Multiple choice checkbox component
/** @param {Array} selectedOptions */
const MultipleChoice = ({
    label,
    name,
    options,
    selectedOptions,
    onChange,
}) => {
    return <div>
        <label>{label || name}</label>
        {options.map((option, index) => (
            <div key={index}>
                <input
                    type="checkbox"
                    value={option}
                    name={name}
                    checked={selectedOptions.includes(
                        option
                    )}
                    onChange={(e) => {
                        const checked = e.target.checked;
                        if (checked) {
                            if (!selectedOptions.includes(option)) {
                                selectedOptions.push(option);
                            }
                        } else {
                            const index = selectedOptions.indexOf(option);
                            if (index !== -1) {
                                selectedOptions.splice(index, 1);
                            }
                        }
                        console.log(e, name, selectedOptions, checked, option)
                        onChange(e, name, selectedOptions)
                    }}
                />
                <label htmlFor={name}>{option}</label>
            </div>
        ))}
    </div>;
};

MultipleChoice.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    onChange: PropTypes.func,
    options: PropTypes.array.isRequired,
    selectedOptions: PropTypes.array,
};

MultipleChoice.defaultProps = {
    selectedOptions: [],
}

export { TextField, ChoiceSelect, NumberInput, MultipleChoice };
