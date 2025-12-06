'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

import { User } from '@supabase/supabase-js';

import { supabase } from '@util/supabase/frontend';

import { CheckIfLoading } from '@components/CheckIfLoading';



interface UserContextType {
    user: User | null;
    signUp: (email: string, password: string, username?: string) => Promise<{ error: Error | null }>;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const signUp = async (email: string, password: string, username?: string) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { username },
                    emailRedirectTo: undefined
                }
            });

            if (error) {
                return { error };
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
                    return { error: new Error('Account created but profile setup failed. Please contact support.') };
                }
            }

            return { error: null };
        } catch (err) {
            return { error: err as Error };
        }
    };

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <UserContext.Provider value={{
            user,
            signUp,
            signIn,
            signOut
        }}>
            <CheckIfLoading loading={loading}>
                {children}
            </CheckIfLoading>
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider.');
    }
    return context;
}