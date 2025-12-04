'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation'

import { supabase } from '@util/supabase/frontend';
import Button from '@components/Button';
import FormInput from '@components/Form/Input';
import { CheckIfLoading } from '@components/CheckIfLoading';



export default function AccountPage() {
    const router = useRouter();

    const [userId, setUserId] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);


    const saveUserInfo = async () => {
        try {
            setLoading(true);
            setMessage('');

            const authUpdates: { email?: string; password?: string; data?: { username: string } } = {};

            if (email && email !== '') {
                authUpdates.email = email;
            }
            if (password && password !== '') {
                authUpdates.password = password;
            }
            if (username && username !== '') {
                authUpdates.data = { username };
            }

            if (Object.keys(authUpdates).length > 0) {
                const { error: authError } = await supabase.auth.updateUser(authUpdates);
                if (authError) {
                    console.log(authError);
                    setMessage(`Error: ${authError.message}`);
                    setLoading(false);
                    return;
                }
            }

            if (username && username !== '' && userId) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({ display_name: username })
                    .eq('id', userId);

                if (profileError) {
                    console.log(profileError);
                    setMessage(`Error updating profile: ${profileError.message}`);
                    setLoading(false);
                    return;
                }
            }

            setMessage('Account updated successfully!');
            setPassword('');
        } catch (error) {
            console.log(error);
            setMessage(`Something went wrong: ${error as any}`);
        } finally {
            setLoading(false);
        }
    };


    const logOut = async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signOut();
            if (error) throw Error(error.message);
            router.push('/');
        } catch (error) {
            console.log(error);
            setMessage(`Something went wrong: ${error as any}`);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                
                if (authError || !user) {
                    console.log(authError);
                    router.push('/onboarding/login');
                    return;
                }

                setUserId(user.id);
                setEmail(user.email || '');

                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('display_name')
                    .eq('id', user.id)
                    .single();

                if (profileError) {
                    console.log(profileError);
                } else if (profile) {
                    setUsername(profile.display_name || '');
                }
            } catch (error) {
                console.log(error);
                setMessage(`Something went wrong: ${error as any}`);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [router]);


    return (
        <CheckIfLoading loading={loading}>
            <div style={{ maxWidth: 400, margin: '40px auto' }}>
                <h1 className='text-2xl text-center pb-5'>Edit Account Info</h1>

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
                        placeholder='Reset Password'
                        value={password}
                        onChange={setPassword}
                    />

                    <Button onClick={saveUserInfo}>Sign Up</Button>
                    <Button className='bg-(--destructive)' onClick={logOut}>Log Out</Button>
                </div>

                {message && <p className='mt-5 text-center'>{message}</p>}
            </div>
        </CheckIfLoading>
    );
}