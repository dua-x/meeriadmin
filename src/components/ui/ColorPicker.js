'use client';

export const ColorPicker = ({ value, onChange }) => {
    return (
        <div className="flex items-center gap-2">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Color name or hex code"
            />
            <div 
                className="w-8 h-8 rounded border"
                style={{ backgroundColor: value }}
            />
        </div>
    );
};