'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import Button from '@components/Button';

import { supabase } from '@util/supabase/frontend';



export default function Navbar() {
    const router = useRouter();
    const [isSignedIn, setIsSignedIn] = useState<boolean>(false);


    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setIsSignedIn(!!user);
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsSignedIn(!!session?.user);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);


    return (
        <nav className='fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex justify-between items-center h-16'>
                    <div className='flex items-center cursor-pointer' onClick={() => router.push('/')}>
                        <h3 className='text-xl font-semibold text-amber-600'>
                            Horizon
                        </h3>
                    </div>

                    <div className='flex items-center gap-4'>
                        <Button onClick={() => router.push('/search')}>Search</Button>

                        <Button onClick={() => router.push('/upload')}>Upload</Button>

                        {isSignedIn ?
                            <Button onClick={() => router.push('/account')}>Account</Button>
                        :
                            <Button onClick={() => router.push('/onboarding/signup')}>Sign Up</Button>
                        }
                    </div>
                </div>
            </div>
        </nav>
    );
}