'use client';

import { useRouter } from 'next/navigation';

import { Heart } from 'lucide-react';



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
    toggleLike: () => void;
}

export default function Post({ post, toggleLike }: PostProps) {
    const router = useRouter();

    const localDate = new Date(post.time);
    const formattedTime = localDate.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        month: 'short',
        day: 'numeric',
        hour12: true
    });


    return (
        <div className='border-4 border-(--primary) rounded-lg overflow-hidden transition max-w-xl mx-auto'>
            <div className='p-2 p bg-white border-b-2 border-(--primary)'>
                <div className='flex justify-between text-gray-600 text-sm'>
                    <span>Location: ({post.lng}, {post.lat})</span>
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