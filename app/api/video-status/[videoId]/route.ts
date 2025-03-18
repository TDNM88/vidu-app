import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { videoId: string } }) {
  try {
    // Xử lý OPTIONS request cho CORS preflight
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      })
    }

    const videoId = params.videoId

    if (!videoId || typeof videoId !== "string" || videoId.length !== 24) {
      return NextResponse.json({ error: "ID video không hợp lệ" }, { status: 400 })
    }

    console.log(`Request headers: ${JSON.stringify(request.headers)}`)
    console.log(`Video ID: ${videoId}`)
    console.log(`API URL: https://api.vidu.com/v1/videos/${videoId}`)
    // Call the Vidu API to check video status
    const response = await fetch(`https://api.vidu.com/v1/videos/${videoId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.VIDU_API_KEY}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      const errorData = await response.text().then(text => text ? JSON.parse(text) : {})
      return NextResponse.json(
        { error: errorData.message || "Không thể kiểm tra trạng thái video" },
        { status: response.status },
      )
    }

    const data = await response.json()

    return NextResponse.json({
      status: data.status,
      progress: data.progress,
      videoUrl: data.videoUrl,
      message: data.message,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      }
    })
  } catch (error: any) {
    console.error("Error checking video status:", error)
    return NextResponse.json({ error: "Đã xảy ra lỗi khi kiểm tra trạng thái video" }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      }
    })
  }
}

