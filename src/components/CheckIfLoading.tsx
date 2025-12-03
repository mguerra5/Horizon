import LoadingIcons from 'react-loading-icons'


export default function Loading() {
    return (
        <div style={{padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%'}}>
            <LoadingIcons.TailSpin stroke='black' />
            <h3 style={{color: 'black'}}>Loading</h3>
        </div>
    );
}

export function CheckIfLoading({ loading, children }: { loading: boolean, children: React.ReactNode }) {
    if (loading) return <Loading />;
    return <>{children}</>;
}

export function LoadingIconBlack() {
    return <LoadingIcons.TailSpin stroke='black' />;
}