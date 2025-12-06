interface FormDropdownProps {
    type: 'string';
    value: string;
    options: string[];
    onChange: (v: string) => void;
}

export default function FormDropdown(props: FormDropdownProps) {
    return (
        <select
            required
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            className='p-2.5 rounded-[10px] flex-none min-w-0 border border-black cursor-pointer'
        >
            {props.options.map((option, index) => (
                <option key={index} value={option}>
                    {option}
                </option>
            ))}
        </select>
    );
}