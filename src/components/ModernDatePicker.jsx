import React from 'react';
import DatePicker from 'react-datepicker';

const ModernDatePicker = ({ value, onChange, min, className, placeholderText }) => {
    // We add timezone offset compensation to ensure the local date matches the selected day
    const selectedDate = value ? new Date(value + 'T12:00:00Z') : null;
    const minDate = min ? new Date(min + 'T12:00:00Z') : null;

    const handleChange = (date) => {
        if (date) {
            // Convert to YYYY-MM-DD local format safely
            const offset = date.getTimezoneOffset()
            date = new Date(date.getTime() - (offset*60*1000))
            const formatted = date.toISOString().split('T')[0];
            onChange(formatted);
        } else {
            onChange('');
        }
    };

    return (
        <div className="w-full">
            <DatePicker
                selected={selectedDate}
                onChange={handleChange}
                minDate={minDate}
                dateFormat="yyyy-MM-dd"
                className={className}
                placeholderText={placeholderText || "Select Date"}
                wrapperClassName="w-full"
            />
        </div>
    );
};

export default ModernDatePicker;
