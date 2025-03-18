type CreateVideoParams = {
  mainCharacter: string
  background: string
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
    const body = {
      model: "vidu2.0",
      images: [params.mainCharacter, params.background],
      prompt: params.prompt,
      duration: "4",
      seed: "0",
      aspect_ratio: params.aspectRatio === "vertical" ? "9:16" : 
                   params.aspectRatio === "horizontal" ? "16:9" : "1:1",
      resolution: params.resolution === "360" ? "360p" : "720p",
      movement_amplitude: "auto"
    }

    const response = await fetch("https://api.vidu.com/ent/v2/reference2video", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.VIDU_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Không thể tạo video")
    }

    const data = await response.json()
    return {
      success: true,
      videoId: data.video_id,
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

