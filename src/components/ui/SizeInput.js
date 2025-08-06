'use client';

export const SizeInput = ({ value, onChange, placeholder }) => {
    return (
        <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-24 p-2 border rounded"
        />
    );
};