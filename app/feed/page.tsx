'use client';

import { useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { supabase } from '@util/supabase/frontend';

import { useUser } from '@providers/User';
import Post, { PostType } from '@components/Post';
import FormInput from '@/src/components/Form/Input';
import FormDropdown from '@/src/components/Form/Dropdown';

export default function Feed() {
    const router = useRouter();
    const { user } = useUser();

    const PAGE_SIZE = 4;

    const [longitude, setLongitude] = useState('');
    const [latitude, setLatitude] = useState('');
    const [pictureType, setPictureType] = useState('None');
    const [order, setOrder] = useState('Newest');

    const [posts, setPosts] = useState<PostType[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const loaderRef = useRef<HTMLDivElement | null>(null);

    const fetchPosts = async (pageNumber: number, replace = false) => {
        setLoading(true);

        let query = supabase
        .from('posts')
        .select(`
            *,
            profiles!posts_user_id_fkey(display_name),
            likes(count),
            user_like:likes!likes_post_id_fkey(user_id)
        `)
		.order('created_at', { ascending: order !== 'Newest' })
        .range(pageNumber * PAGE_SIZE, pageNumber * PAGE_SIZE + PAGE_SIZE - 1)
        .eq('user_like.user_id', user?.id ?? null);

        if (pictureType !== 'None') query = query.eq('type', pictureType === 'Sunrise');

        if (latitude !== '') {
            const lat = Number(latitude);
            query = query.gte('lat', lat - 0.01).lte('lat', lat + 0.01);
        }
        if (longitude !== '') {
            const lng = Number(longitude);
            query = query.gte('lng', lng - 0.01).lte('lng', lng + 0.01);
        }

        const { data, error } = await query;

        if (error) {
            setMessage(error.message);
            setLoading(false);
            return;
        }

        const mapped = data.map(p => ({
            ...p,
            numLikes: p.likes?.[0]?.count ?? 0,
            isLiked: p.user_like?.length > 0
        }));

        replace ? setPosts(mapped) : setPosts(prev => [...prev, ...mapped]);

        if (mapped.length < PAGE_SIZE) setHasMore(false);

        setLoading(false);
    };

    useEffect(() => {
        setPage(0);
        setPosts([]);
        setHasMore(true);
        fetchPosts(0, true);
    }, [longitude, latitude, pictureType, order]);

    useEffect(() => {
        if (page === 0) return;
        fetchPosts(page);
    }, [page]);

    useEffect(() => {
        if (!loaderRef.current || !hasMore) return;

        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !loading) setPage(prev => prev + 1);
        });

        observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, [hasMore, loading]);

    return (
        <div>
            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: '10px', gap: '10px'}}>
                <div style={{display: 'flex', flexDirection: 'row', gap: '5px'}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center'}}>
                        <label className="block text-sm font-medium mb-1"> Latitude </label>
                        <FormInput type='text' placeholder='latitude' value={latitude} onChange={setLatitude} />
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center'}}>
                        <label className="block text-sm font-medium mb-1"> Longitude </label>
                        <FormInput type='text' placeholder='longitude' value={longitude} onChange={setLongitude} />
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center'}}>
                        <label className="block text-sm font-medium mb-1"> Type </label>
                        <FormDropdown type='string' value={pictureType} options={['Sunrise', 'Sunset', 'None']} onChange={setPictureType} />
                    </div>
					<div style={{display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center'}}>
                        <label className="block text-sm font-medium mb-1"> Sort By </label>
                        <FormDropdown type='string' value={order} options={['Newest', 'Oldest']} onChange={setOrder} />
                    </div>
                </div>
            </div>

            <div className="py-5 flex flex-col gap-10">
                {posts.map(post => (
                    <div key={post.id} onClick={() => router.push(`/post/${post.id}`)}>
                        <Post post={post} />
                    </div>
                ))}

                {loading && <p className='text-center'>Loading more posts...</p>}
            </div>

            {/* Must have for scrolling: */}
            <div ref={loaderRef} style={{ height: 40 }} />

            {message && <p>{message}</p>}
        </div>
    );
}