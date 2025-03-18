import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const mainCharacter = formData.get("mainCharacter") as File
    const background = formData.get("background") as File
    const optionalImage = formData.get("optionalImage") as File | null
    const prompt = formData.get("prompt") as string
    const aspectRatio = formData.get("aspectRatio") as string
    const resolution = formData.get("resolution") as string

    if (!mainCharacter || !background) {
      return NextResponse.json({ error: "Thiếu ảnh nhân vật chính hoặc bối cảnh" }, { status: 400 })
    }

    // Create a new FormData object to send to the Vidu API
    const apiFormData = new FormData()
    apiFormData.append("mainCharacter", mainCharacter)
    apiFormData.append("background", background)

    if (optionalImage) {
      apiFormData.append("optionalImage", optionalImage)
    }

    // Thêm các tham số bắt buộc
    apiFormData.append("prompt", prompt)
    apiFormData.append("aspectRatio", aspectRatio)
    apiFormData.append("resolution", resolution)
    apiFormData.append("duration", "4")
    apiFormData.append("model", "vidu-2.0")

    // Gọi API Vidu
    const response = await fetch("https://api.vidu.com/v1/videos", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VIDU_API_KEY}`,
        "Content-Type": "multipart/form-data",
      },
      body: apiFormData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: errorData.message || "Không thể tạo video" }, { status: response.status })
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      videoId: data.videoId,
      message: "Đã bắt đầu xử lý video",
    })
  } catch (error: any) {
    console.error("Error processing video:", error)
    return NextResponse.json({ error: "Đã xảy ra lỗi khi xử lý video" }, { status: 500 })
  }
}

