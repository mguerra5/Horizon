"use client"

import { supabase } from '@util/supabase/frontend';
import { useEffect, useState } from 'react';
import { CheckIfLoading } from '@components/CheckIfLoading';
import FormInput  from '@components/Form/Input'
import PostPage from '../post/[postId]/page'
import { PostType } from '@/src/components/Post';
import Link from 'next/link';
import FormDropdown from '@/src/components/Form/Dropdown';

export default function Feed() {
    const [longitude, setLongitude] = useState<string>('');
    const [latitude, setLatitude] = useState<string>('');
    const [type, setType] = useState<string>('None');
    const [postData, setPostData] = useState<PostType[]>([]);
    
    const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
      const fetchData = async () => {
        let query = supabase.from('posts').select();
        if (type != 'None') {
          query = query.eq('type', type == 'Sunrise');
        }
        if (latitude != '') {
          query.eq('lng', Number(latitude));
        }

        if (longitude != '') {
          query.eq('lng', Number(longitude));
        }

        const {data, error} = await query;

        if (error) {
            console.log(error);
            setMessage(error.message);
            setLoading(false);
            return;
        }

        setPostData(data);
      };

      fetchData();
    }, [longitude, latitude, type]);

    return (<CheckIfLoading loading={loading}>
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

                <div>
                {postData.map((item, idx) => (
                  <div key={idx}>
                    <Link href={'/post/' + item.id} style={{position: 'absolute', marginTop: '40px', width: '616px', height: '570px'}}/>
                    {<PostPage postId={item.id}/>}
                  </div>))}
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