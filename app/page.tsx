'use client';

import { supabase } from '@util/supabase/frontend';
import { useEffect, useState } from 'react';
import { CheckIfLoading } from '@components/CheckIfLoading';
import FormInput  from '@components/Form/Input'

interface postSchema {
    id : Number,
    created_at : Date,
    longitude : Number,
    latitude : Number,
    location : String,
    time : Date,
    type : Boolean,
    user_id : Number
    image_link : string,
}

function Post(data : postSchema) {

    return (<div>
        
    </div>)
}


export default function Home() {
    const [longitude, setLongitude] = useState<string>('');
    const [latitude, setLatitude] = useState<string>('');
    const [data, setData] = useState<postSchema[]>([]);
    
    const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const createPosts = async () => {
        const {data, error} = await supabase.from('posts').select();

        if (error) {
            console.log(error);
            setMessage(error.message);
            setLoading(false);
            return;
        }

        if (data != null) {
            setLoading(false);
            return;
        }

        // change later
        setData(data);
    }

    useEffect(() => {
        createPosts();
    }, [longitude, latitude])

    return (<CheckIfLoading loading={loading}>
            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                <div style={{display: 'flex', flexDirection: 'row', gap: '5px'}}>
                    <FormInput
                        type='text'
                        placeholder='longitude'
                        value={longitude}
                        onChange={setLongitude}
                    />

                    <FormInput
                        type='text'
                        placeholder='latitude'
                        value={latitude}
                        onChange={setLatitude}
                    />
                </div>


                {data.map(item => <Post {...item}/> )}
                
                {message && (
                    <p style={{ marginTop: 20 }}>
                        {message}
                    </p>
                )}
            </div>
        </CheckIfLoading>
    );
}
