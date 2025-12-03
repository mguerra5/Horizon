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
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);


    const handleSignUp = async () => {
        setLoading(true);
        setMessage('');

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username },
                emailRedirectTo: undefined
            }
        });

        if (error) {
            console.log(error);
            setMessage(error.message);
            setLoading(false);
            return;
        }

        if (data.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: data.user.id,
                    display_name: username || email.split('@')[0],
                    created_at: new Date().toISOString()
                });

            if (profileError) {
                console.error('Profile creation error:', profileError);
                setMessage('Account created but profile setup failed. Please contact support.');
            } else {
                console.log('Profile created successfully');
                router.push('/');
            }
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
                <h1 className='text-2xl text-center pb-5'>Create an Account</h1>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <FormInput
                        type='email'
                        placeholder='Email'
                        value={email}
                        onChange={setEmail}
                    />

                    <FormInput
                        type='text'
                        placeholder='Username'
                        value={username}
                        onChange={setUsername}
                    />

                    <FormInput
                        type='password'
                        placeholder='Password'
                        value={password}
                        onChange={setPassword}
                    />

                    <Button onClick={handleSignUp}>Sign Up</Button>

                    <p className='text-center'>If you have an account, <Link className='text-(--orange)' href='/onboarding/login'>Log In</Link></p>
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