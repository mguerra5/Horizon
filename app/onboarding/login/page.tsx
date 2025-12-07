'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation'
import Link from 'next/link';

import { supabase } from '@util/supabase/frontend';
import Button from '@components/Button';
import FormInput from '@components/Form/Input';
import { CheckIfLoading } from '@components/CheckIfLoading';
import { useUser } from '@providers/User';



export default function SignUpPage() {
    const router = useRouter();
    const { user, signIn } = useUser();

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);


    const handleLogin = async () => {
        setLoading(true);
        setMessage('');

        const { error } = await signIn(email, password);

        if (error) {
            console.log(error);
            setMessage(error.message);
            setLoading(false);
            return;
        }

        router.push('/');
        setLoading(false);
    };


    useEffect(() => {
        if (user) {
            console.log('Already logged in, routing.');
            router.push('/');
        }
    }, [user, router]);


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

                    <Button onClick={handleLogin}>Log In</Button>
                    
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