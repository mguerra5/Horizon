interface FormInputProps {
    type: 'email' | 'text' | 'password';
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
}

export default function FormInput({
    type,
    placeholder,
    value,
    onChange
}: FormInputProps) {
    return (
        <input
            type={type}
            placeholder={placeholder}
            required
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
                padding: 10,
                borderRadius: 10,
                border: '1px solid black'
            }}
        />
    );
}