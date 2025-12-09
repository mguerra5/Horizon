'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { supabase } from '@util/supabase/frontend';

import { useUser } from '@providers/User';

import { CheckIfLoading } from '@components/CheckIfLoading';
import FormInput  from '@components/Form/Input'
import Post, { PostType } from '@components/Post';
import FormDropdown from '@components/Form/Dropdown';



export default function Feed() {
    const router = useRouter();
    const { user } = useUser();

    const [longitude, setLongitude] = useState<string>('');
    const [latitude, setLatitude] = useState<string>('');
    const [type, setType] = useState<string>('None');
    const [posts, setPosts] = useState<PostType[]>([]);

    const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            let query = supabase
                .from('posts')
                .select(`
                    *,
                    profiles!posts_user_id_fkey(display_name),
                    likes(count),
                    user_like:likes!likes_post_id_fkey(user_id)
                `)
                .eq('user_like.user_id', user?.id ?? null);

            if (type !== 'None') query = query.eq('type', type === 'Sunrise');
            if (latitude !== '') {
                const lat = Number(latitude);
                query = query.gte('lat', lat - 0.001).lte('lat', lat + 0.001);
            }
            if (longitude !== '') {
                const lng = Number(longitude);
                query = query.gte('lng', lng - 0.001).lte('lng', lng + 0.001);
            }

            const { data, error } = await query;

            if (error) {
                console.log(error);
                setMessage(error.message);
                setLoading(false);
                return;
            }

            const mappedPosts = data.map((p, i) => {
                return {
                    ...p,
                    numLikes: p.likes?.[0]?.count ?? 0,
                    isLiked: p.user_like?.length > 0
                };
            });

            setPosts(mappedPosts);
            setLoading(false);
        };

        fetchData();
    }, [longitude, latitude, type]);

    return (
        <CheckIfLoading loading={loading}>
            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: '10px'}}>
                <div style={{display: 'flex', flexDirection: 'row', gap: '5px'}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center'}}>
                    <label className="block text-sm font-medium mb-1">
                        Latitude
                    </label>
                    <FormInput
                        type='text'
                        placeholder='longitude'
                        value={longitude}
                        onChange={setLongitude}
                    />
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center'}}>
                    <label className="block text-sm font-medium mb-1">
                        Longitude
                    </label>
                    <FormInput
                        type='text'
                        placeholder='latitude'
                        value={latitude}
                        onChange={setLatitude}
                    />
                    </div>

                    <div style={{display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center'}}>
                    <label className="block text-sm font-medium mb-1">
                        Type
                    </label>
                    <FormDropdown
                        type='string'
                        value={type}
                        options={['Sunrise', 'Sunset', 'None']}
                        onChange={setType}
                    />
                    </div>
                </div>

                <div className='py-5 flex flex-col gap-10'>
                    {posts.map((post) => {
                        return (
                            <div key={post.id} onClick={() => router.push(`/post/${post.id}`)}>
                                <Post post={post} />
                            </div>
                        );
                    })}
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