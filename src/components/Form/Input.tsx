
import { twMerge } from 'tailwind-merge';


interface StringFormInput {
    type: 'email' | 'text' | 'password';
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
    className?: string;
}

interface NumberFormInput {
    type: 'number';
    placeholder: string;
    value: number;
    onChange: (v: number) => void;
    className?: string;
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
            className={twMerge(
                'p-2.5 rounded-[10px] flex-none min-w-0 border border-black',
                props.className
            )}
        />
    );
}