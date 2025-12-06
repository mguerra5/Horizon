interface StringFormInput {
    type: 'email' | 'text' | 'password';
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
}

interface NumberFormInput {
    type: 'number';
    placeholder: string;
    value: number;
    onChange: (v: number) => void;
}

type FormInputProps = StringFormInput | NumberFormInput;

export default function FormInput(props: FormInputProps) {
    return (
        <input
            type={props.type}
            placeholder={props.placeholder}
            required
            value={props.value}
            onChange={(e) => {
                if (props.type !== 'number') {
                    props.onChange(e.target.value);
                } else {
                    props.onChange(Number(e.target.value));
                }
            }}
            style={{
                padding: 10,
                borderRadius: 10,
                flex: '0 0 auto',
                minWidth: 0,
                border: '1px solid black',
                width: '150px'
            }}
        />
    );
}