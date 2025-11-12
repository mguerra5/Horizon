import { NextResponse, NextRequest } from 'next/server';



export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;

    const location = searchParams.get('location');
    console.log(location);

    // fetch info from sunset api

    return NextResponse.json({  }, { status: 200 });
}