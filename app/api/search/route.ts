import { NextResponse, NextRequest } from 'next/server';



export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const url = 'https://api.sunrise-sunset.org/json';
    const lat = Number(searchParams.get('lat'));
    const lng = Number(searchParams.get('lng'));
    const date = searchParams.get('date') ?? ''; // defaults to today's date.
    const formatted = 1; // formats times in ISO format.
    const tzid = 'America/Chicago'; // times returned will be in Chicago timezone.

    let query: string = `${url}?lat=${lat}&lng=${lng}`;
    if (date) {
      query += `&date=${date}`;
    }
    query += `&formatted=${formatted}&tzid=${tzid}`;

    const resp = await fetch(query);
    const data = await resp.json();   

    return NextResponse.json(data, { status: 200 });
}


