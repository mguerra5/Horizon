'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@util/supabase/frontend';
import { CheckIfLoading } from '@components/CheckIfLoading';
import Post, { PostType } from '@components/Post';
import { useUser } from '@providers/User';



export default function PostPage() {
    const { user } = useUser();

    const router = useRouter();
    const params = useParams();
    const postId = params.postId as string;

    const [post, setPost] = useState<PostType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');


    const toggleLike = async () => {
        try {
            if (!post || !user) return;
            if (post.isLiked) {
                // Unlike post.
                setPost(() => ({
                    ...post,
                    isLiked: false,
                    numLikes: post.numLikes - 1
                }));
                await supabase
                    .from('likes')
                    .delete()
                    .eq('post_id', postId)
                    .eq('user_id', user.id);
            } else {
                // Like post.
                setPost(() => ({
                    ...post,
                    isLiked: true,
                    numLikes: post.numLikes + 1
                }));
                await supabase
                    .from('likes')
                    .insert({ post_id: postId, user_id: user.id });
            }
        } catch (error) {
            console.log("Error when togglgin like: ", error)
        }
    };

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);

                const { data, error } = await supabase
                    .from('posts')
                    .select(`
                        *,
                        profiles ( display_name ),
                        likes (user_id)
                    `)
                    .eq('id', postId)
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

                const likesArray = Array.isArray(data.likes) ? data.likes : (data.likes ? [data.likes] : []);
                const numLikes = likesArray.length;
                const isLiked = user ? likesArray.some((like: any) => like.user_id === user.id) : false;
                setPost({
                    ...data,
                    numLikes,
                    isLiked
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
                {error ? (
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
                ) : post ? (
                    <Post
                        post={post}
                        toggleLike={toggleLike}
                    />
                ) : null}
                
            </div>
        </CheckIfLoading>
    );
}