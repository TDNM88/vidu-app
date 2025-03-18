import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Lấy dữ liệu từ request body
    const { images, prompt, duration, seed, aspect_ratio, resolution, movement_amplitude } = await request.json()

    // Validate required fields
    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'Thiếu hoặc images không hợp lệ' }, { status: 400 })
    }

    if (!prompt) {
      return NextResponse.json({ error: 'Thiếu prompt' }, { status: 400 })
    }

    // Chuẩn bị request body theo mẫu API
    const requestBody = {
      model: "vidu2.0",
      images,
      prompt,
      duration: duration || "4",
      seed: seed || "0",
      aspect_ratio: aspect_ratio || "16:9",
      resolution: resolution || "720p",
      movement_amplitude: movement_amplitude || "auto"
    }

    // Gọi API Vidu
    const response = await fetch('https://api.vidu.com/ent/v2/reference2video', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.VIDU_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    // Xử lý response
    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ 
        error: errorData.message || 'Lỗi khi tạo video',
        status: response.status
      })
    }

    const responseData = await response.json()

    return NextResponse.json({
      success: true,
      data: responseData,
      message: 'Tạo video thành công',
    })

  } catch (error: any) {
    console.error('Error generating video:', error)
    return NextResponse.json({ 
      error: 'Đã xảy ra lỗi khi tạo video',
      details: error.message 
    }, { status: 500 })
  }
}

