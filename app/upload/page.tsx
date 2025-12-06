'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

import { supabase } from '@util/supabase/frontend';
import FormInput from '@components/Form/Input';
import FormDropdown from '@components/Form/Dropdown';
import { CheckIfLoading } from '@components/CheckIfLoading';
import Button from '@components/Button';



type Coord = {
    lat: number;
    lng: number;
};

export default function UploadPage() {
    const router = useRouter();

    const [message, setMessage] = useState<string>('');
    const [coords, setCoords] = useState<Coord>({ lat: 0, lng: 0 });
    const [sunEvent, setSunEvent] = useState<string>('Sunrise');
    const [uploadedImage, setUploadedImage] = useState<{ file: File; preview: string } | null>(null);


    const [loading, setLoading] = useState<boolean>(false);


    const updateLatCoords = (newLat: number) => {
        setCoords((oldCoords) => ({
            ...oldCoords,
            lat: newLat
        }));
    }
    const updateLngCoords = (newLng: number) => {
        setCoords((oldCoords) => ({
            ...oldCoords,
            lng: newLng
        }));
    }



    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            const preview = URL.createObjectURL(file);
            setUploadedImage({ file, preview });
            setMessage('');
        }
    };

    const onDropRejected = () => {
        setMessage('Please upload a valid image file (PNG, JPG, JPEG)');
    };

    const removeImage = () => {
        if (uploadedImage) {
            URL.revokeObjectURL(uploadedImage.preview);
            setUploadedImage(null);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        onDropRejected,
        accept: {
            'image/png': ['.png'],
            'image/jpeg': ['.jpg', '.jpeg']
        },
        multiple: false,
        maxFiles: 1
    });

    const handleUpload = async () => {
        if (coords.lat == 0 || coords.lng == 0) {
            setMessage('Please input coords');
            return;
        }
        if (!uploadedImage) {
            setMessage('Please upload an image');
            return;
        }

        try {
            setLoading(true);
            setMessage('');
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                setMessage('You must be logged in to upload');
                return;
            }

            const { data: post, error: insertError } = await supabase
                .from('posts')
                .insert({
                    user_id: user.id,
                    lat: coords.lat,
                    lng: coords.lng,
                    location: '',
                    type: sunEvent === 'Sunrise', // true for sunrise, false for sunset
                    time: new Date().toISOString(),
                    post_urls: []
                })
                .select()
                .single();

            if (insertError || !post) {
                console.error('Insert error:', insertError);
                setMessage('Failed to create post: ' + insertError?.message);
                return;
            }

            const fileExt = uploadedImage.file.name.split('.').pop();
            const filePath = `${user.id}/${post.id}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('post-images')
                .upload(filePath, uploadedImage.file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                await supabase.from('posts').delete().eq('id', post.id);
                setMessage('Failed to upload image: ' + uploadError.message);
                return;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('post-images')
                .getPublicUrl(filePath);

            const { error: updateError } = await supabase
                .from('posts')
                .update({ post_urls: [publicUrl] })
                .eq('id', post.id);

            if (updateError) {
                console.error('Update error:', updateError);
                setMessage('Post created but failed to update with image URL');
                return;
            }

            router.push(`/post/${post.id}`);
        } catch (error) {
            console.error('Upload error:', error);
            setMessage(error as any);
            setLoading(false);
        }
    };


    useEffect(() => {
        const checkSignedIn = async () => {
            try {
                setLoading(true);

                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    console.log('Not logged in, routing.');
                    router.push('/onboarding/signup');
                }
                setLoading(false);
            } catch (error) {
                console.log('Error when checking signin: ', error);
                setMessage(error as string);
            } finally {
                setLoading(false);
            }
        }
        checkSignedIn();
    }, []);


    return (
        <CheckIfLoading loading={loading}>
            <div style={{ margin: '40px auto' }}>
                <h1 className='text-2xl text-center pb-5'>Create a Post</h1>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <h2 className='text-l'>Latitude and Longitude Coordinates</h2>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <p className='text-3xl'>(</p>

                            <FormInput
                                type='number'
                                placeholder='Latitude'
                                value={coords.lat}
                                onChange={updateLatCoords}
                                className='p-1 px-2 max-w-[150px]'
                            />

                            <p className='text-3xl'>,</p>

                            <FormInput
                                type='number'
                                placeholder='Longitude'
                                value={coords.lng}
                                onChange={updateLngCoords}
                                className='p-1 px-2 max-w-[150px]'
                            />

                            <p className='text-3xl'>)</p>
                        </div>
                    </div>
  

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <h2 className='text-l'>Sunset or Sunrise?</h2>
                        <FormDropdown
                            type='string'
                            value={sunEvent}
                            options={['Sunrise', 'Sunset']}
                            onChange={setSunEvent}
                        />
                    </div>


                    <div style={{ width: '100%', maxWidth: '500px' }}>
                        {!uploadedImage ? (
                            <div>
                                <div
                                    {...getRootProps()}
                                    className={`flex flex-col rounded-lg items-center justify-center w-full h-48 border-4 border-(--primary) cursor-pointer transition ${
                                        isDragActive ? 'bg-(--primary-faded)' : 'bg-gray-200 hover:bg-gray-300'
                                    }`}
                                >
                                    <input {...getInputProps()} />
                                    <Upload className='w-16 h-16 mb-2' strokeWidth={3} />
                                    <span className='text-xl font-medium'>
                                        {isDragActive ? 'Drop picture here' : 'Upload your picture'}
                                    </span>
                                    <span className='text-sm text-gray-500 mt-1'>or drag and drop</span>
                                </div>
                                <p className='text-sm text-gray-400 ml-2 mt-1'>.png, .jpg, .jpeg</p>
                            </div>
                        ) : (
                            <div className='relative'>
                                <img 
                                    src={uploadedImage.preview} 
                                    alt='Uploaded preview' 
                                    className='w-full h-auto border-4 border-black'
                                />
                                <button
                                    onClick={removeImage}
                                    className='mt-2 px-4 py-2 bg-(--destructive-faded) hover:bg-(--destructive) text-black font-medium transition cursor-pointer'
                                >
                                    Remove Image
                                </button>
                            </div>
                        )}
                    </div>

                    <Button onClick={handleUpload}>Upload</Button>
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