'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation'
import Link from 'next/link';

import { supabase } from '@util/supabase/frontend';
import Button from '@components/Button';
import FormInput from '@components/Form/Input';
import { CheckIfLoading } from '@components/CheckIfLoading';



export default function SignUpPage() {
    const router = useRouter();

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);


    const handleSignUp = async () => {
        setLoading(true);
        setMessage('');

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        console.log(data)
        if (error) {
            console.log(error)
            setMessage(error.message);
        } else {
            router.push('/');
        }
        setLoading(false);
    };


    useEffect(() => {
        const checkSignedIn = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                console.log('Already logged in, routing.');
                router.push('/');
            }
        }
        checkSignedIn();
    }, []);


    return (
        <CheckIfLoading loading={loading}>
            <div style={{ maxWidth: 400, margin: '40px auto' }}>
                <h1 className='text-2xl text-center pb-5'>Log In</h1>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <FormInput
                        type='email'
                        placeholder='Email'
                        value={email}
                        onChange={setEmail}
                    />

                    <FormInput
                        type='password'
                        placeholder='Password'
                        value={password}
                        onChange={setPassword}
                    />

                    <Button onClick={handleSignUp}>Log In</Button>
                    
                    <p className='text-center'>If you do not have an account, <Link className='text-(--primary)' href='/onboarding/signup'>Sign Up</Link></p>
                </div>

                {message && (
                    <p style={{ marginTop: 20 }}>
                        {message}
                    </p>
                )}
            </div>
        </CheckIfLoading>
    );
}