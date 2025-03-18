type CreateVideoParams = {
  mainCharacter: File
  background: File
  optionalImage: File | null
  prompt: string
  aspectRatio: "vertical" | "horizontal" | "square"
  resolution: "360" | "720"
}

type CreateVideoResponse = {
  success: boolean
  videoId?: string
  message?: string
}

type VideoStatus = "pending" | "processing" | "completed" | "error"

type CheckVideoStatusResponse = {
  status: VideoStatus
  progress?: number
  videoUrl?: string
  message?: string
}

export async function createVideo(params: CreateVideoParams): Promise<CreateVideoResponse> {
  try {
    const formData = new FormData()
    formData.append("mainCharacter", params.mainCharacter)
    formData.append("background", params.background)

    if (params.optionalImage) {
      formData.append("optionalImage", params.optionalImage)
    }

    // Add the new parameters
    formData.append("prompt", params.prompt)
    formData.append("aspectRatio", params.aspectRatio)
    formData.append("resolution", params.resolution)

    // Add the default parameters
    formData.append("duration", "4")
    formData.append("model", "vidu-2.0")

    const response = await fetch("https://api.vidu.com/v1/videos", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VIDU_API_KEY}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Không thể tạo video")
    }

    const data = await response.json()
    return {
      success: true,
      videoId: data.videoId,
    }
  } catch (error: any) {
    console.error("Error creating video:", error)
    return {
      success: false,
      message: error.message || "Đã xảy ra lỗi khi tạo video",
    }
  }
}

export async function checkVideoStatus(videoId: string): Promise<CheckVideoStatusResponse> {
  try {
    const response = await fetch(`https://api.vidu.com/v1/videos/${videoId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.VIDU_API_KEY}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Không thể kiểm tra trạng thái video")
    }

    const data = await response.json()
    return {
      status: data.status,
      progress: data.progress,
      videoUrl: data.videoUrl,
      message: data.message,
    }
  } catch (error: any) {
    console.error("Error checking video status:", error)
    return {
      status: "error",
      message: error.message || "Đã xảy ra lỗi khi kiểm tra trạng thái video",
    }
  }
}

