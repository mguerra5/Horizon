'use client';

import { useEffect, useState } from 'react';

import { useRouter, useParams } from 'next/navigation';

import { supabase } from '@util/supabase/frontend';

import { useUser } from '@providers/User';

import { CheckIfLoading } from '@components/CheckIfLoading';
import Post, { PostType } from '@components/Post';



export default function PostPage() {
    const { user } = useUser();

    const router = useRouter();
    const params = useParams();
    const postId = params.postId as string;

    const [post, setPost] = useState<PostType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);

                const { data, error } = await supabase
                    .from('posts')
                    .select(`
                        *,
                        profiles!posts_user_id_fkey(display_name),
                        likes(count),
                        user_like:likes!likes_post_id_fkey(user_id)
                    `)
                    .eq('id', postId)
                    .eq('user_like.user_id', user?.id ?? null)
                    .single();

                if (error) {
                    console.error('Error fetching post:', error);
                    setError('Failed to load post');
                    return;
                }

                if (!data) {
                    setError('Post not found');
                    return;
                }

                setPost({
                    ...data,
                    numLikes: data.likes?.[0]?.count ?? 0,
                    isLiked: data.user_like?.length > 0
                });
            } catch (err) {
                console.error('Unexpected error:', err);
                setError('An unexpected error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (postId) {
            fetchPost();
        }
    }, [postId]);

    return (
        <CheckIfLoading loading={loading}>
            <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px' }}>
                {error ?
                    <div>
                        <h1 className='text-2xl mb-4'>Error</h1>
                        <p>{error}</p>
                        <button 
                            onClick={() => router.push('/')}
                            className='mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300'
                        >
                            Go Back
                        </button>
                    </div>
                :
                    post ? <Post post={post} /> : null
                }
            </div>
        </CheckIfLoading>
    );
}