'use client';

import { useState } from 'react';

import { Heart } from 'lucide-react';

import { useUser } from '@providers/User';

import { supabase } from '@util/supabase/frontend';



export type PostType = {
    id: string;
    user_id: string;
    lat: number;
    lng: number;
    location: string;
    time: string;
    type: boolean;
    post_urls: string[];
    created_at: string;
    profiles: {
        display_name: string;
    };
    numLikes: number;
    isLiked: boolean; // Did logged in user like this?
};

interface PostProps {
    post: PostType;
}

export default function Post({ post: originalPost }: PostProps) {
    const { user } = useUser();

    const [post, setPost] = useState<PostType>(originalPost);

    const localDate = new Date(post.time);
    const formattedTime = localDate.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        month: 'short',
        day: 'numeric',
        hour12: true
    });

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
                    .eq('post_id', post.id)
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
                    .insert({ post_id: post.id, user_id: user.id });
            }
        } catch (error) {
            console.log("Error when togglgin like: ", error)
        }
    };


    return (
        <div className='border-4 border-(--primary) rounded-lg overflow-hidden transition max-w-xl mx-auto'>
            <div className='p-2 p bg-white border-b-2 border-(--primary)'>
                <div className='flex justify-between text-gray-600 text-sm'>
                    <span>Location: ({post.lat}, {post.lng})</span>
                    <span>{formattedTime}</span>
                </div>
            </div>

            <img 
                src={post.post_urls[0]} 
                alt={post.type ? 'Sunrise' : 'Sunset'}
                className='w-full aspect-square object-cover'
            />

            <div className='p-3 bg-white flex justify-between items-center'>
                <span className='font-semibold'>@{post.profiles.display_name}</span>
                <div className='flex items-center gap-1' onClick={(e) => {
                    e.stopPropagation();
                    toggleLike();
                }}>
                    <span className='font-bold text-lg'>{post.numLikes}</span>
                    <Heart className={`w-5 h-5 text-(--primary) ${post.isLiked && 'fill-(--primary)'}`} />
                </div>
            </div>
        </div>
    );
}