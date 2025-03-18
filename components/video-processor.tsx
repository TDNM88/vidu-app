"use client"

import type React from "react"

import { useState } from "react"
import { ImageUploader } from "./image-uploader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, AlertCircle, CheckCircle2, Sparkles } from "lucide-react"
import { VideoPlayer } from "./video-player"
import { createVideo, checkVideoStatus } from "@/lib/vidu-api"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { AspectRatioPreview } from "./aspect-ratio-preview"

type UploadedImage = {
  file: File
  preview: string
}

type ProcessingStatus = "idle" | "uploading" | "processing" | "completed" | "error"

type AspectRatio = "vertical" | "horizontal" | "square"
type Resolution = "360" | "720"

type VideoSettings = {
  prompt: string
  aspectRatio: AspectRatio
  resolution: Resolution
}

export function VideoProcessor() {
  const [mainCharacter, setMainCharacter] = useState<UploadedImage | null>(null)
  const [background, setBackground] = useState<UploadedImage | null>(null)
  const [optionalImage, setOptionalImage] = useState<UploadedImage | null>(null)
  const [status, setStatus] = useState<ProcessingStatus>("idle")
  const [progress, setProgress] = useState(0)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("upload")
  const { toast } = useToast()

  const [videoSettings, setVideoSettings] = useState<VideoSettings>({
    prompt: "",
    aspectRatio: "horizontal",
    resolution: "720",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!mainCharacter || !background) {
      setError("Vui lòng tải lên ảnh nhân vật chính và bối cảnh")
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng tải lên ảnh nhân vật chính và bối cảnh",
        variant: "destructive",
      })
      return
    }

    try {
      setStatus("uploading")
      setProgress(10)
      setError(null)

      const formData = new FormData()
      formData.append("mainCharacter", mainCharacter.file)
      formData.append("background", background.file)
      if (optionalImage?.file) {
        formData.append("optionalImage", optionalImage.file)
      }

      formData.append("prompt", videoSettings.prompt)
      formData.append("aspectRatio", videoSettings.aspectRatio)
      formData.append("resolution", videoSettings.resolution)

      // Create the video request
      const result = await createVideo({
        mainCharacter: mainCharacter.file,
        background: background.file,
        optionalImage: optionalImage?.file || null,
        prompt: videoSettings.prompt,
        aspectRatio: videoSettings.aspectRatio,
        resolution: videoSettings.resolution,
      })

      if (!result.success || !result.videoId) {
        throw new Error(result.message || "Không thể tạo video")
      }

      setVideoId(result.videoId)
      setProgress(30)
      setStatus("processing")
      setActiveTab("processing")

      // Poll for video status
      const intervalId = setInterval(async () => {
        if (!result.videoId) return

        try {
          const statusResult = await checkVideoStatus(result.videoId)

          if (statusResult.status === "completed") {
            clearInterval(intervalId)
            setVideoUrl(statusResult.videoUrl || null)
            setProgress(100)
            setStatus("completed")
            setActiveTab("result")
            toast({
              title: "Thành công",
              description: "Video của bạn đã được tạo thành công!",
              variant: "default",
            })
          } else if (statusResult.status === "processing") {
            // Update progress based on API response or increment
            setProgress((prev) => Math.min(prev + 5, 90))
          } else if (statusResult.status === "error") {
            throw new Error(statusResult.message || "Xử lý video thất bại")
          }
        } catch (err) {
          clearInterval(intervalId)
          setStatus("error")
          setError("Đã xảy ra lỗi khi kiểm tra trạng thái video")
          toast({
            title: "Lỗi",
            description: "Đã xảy ra lỗi khi kiểm tra trạng thái video",
            variant: "destructive",
          })
        }
      }, 3000)

      // Cleanup interval on component unmount
      return () => clearInterval(intervalId)
    } catch (err: any) {
      setStatus("error")
      setError(err.message || "Đã xảy ra lỗi khi xử lý video")
      toast({
        title: "Lỗi",
        description: err.message || "Đã xảy ra lỗi khi xử lý video",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setMainCharacter(null)
    setBackground(null)
    setOptionalImage(null)
    setStatus("idle")
    setProgress(0)
    setVideoId(null)
    setVideoUrl(null)
    setError(null)
    setActiveTab("upload")
  }

  const renderStatusContent = () => {
    switch (status) {
      case "uploading":
        return (
          <div className="text-center py-12">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <Loader2 className="h-20 w-20 animate-spin text-primary opacity-25" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-primary text-lg font-medium">{progress}%</span>
              </div>
            </div>
            <h3 className="text-xl font-serif font-medium mb-3 text-shadow-sm">Đang tải lên hình ảnh...</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Vui lòng không đóng trang này trong quá trình tải lên.
            </p>
            <Progress value={progress} className="w-full max-w-md mx-auto h-2" />
          </div>
        )
      case "processing":
        return (
          <div className="text-center py-12">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-opacity-50"></div>
              <div
                className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent"
                style={{ animation: "spin 1.5s linear infinite" }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-blue-600 text-lg font-medium">{progress}%</span>
              </div>
            </div>
            <h3 className="text-xl font-serif font-medium mb-3 text-shadow-sm">Đang xử lý video...</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Quá trình này có thể mất vài phút. Chúng tôi đang tạo ra tác phẩm hoạt hình độc đáo cho bạn.
            </p>
            <Progress value={progress} className="w-full max-w-md mx-auto h-2" />
            <div className="mt-8 text-sm text-gray-400 italic">
              "Nghệ thuật là sự thể hiện của trí tưởng tượng và sáng tạo"
            </div>
          </div>
        )
      case "completed":
        return (
          <div className="text-center py-12">
            <div className="mb-6 relative">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <div className="absolute -top-2 -right-2 transform translate-x-1/2 -translate-y-1/2">
                <Sparkles className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
            <h3 className="text-2xl font-serif font-medium mb-6 text-shadow-sm">Tác phẩm của bạn đã sẵn sàng!</h3>
            {videoUrl && <VideoPlayer src={videoUrl} />}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button onClick={resetForm} variant="outline" className="elegant-button px-6 py-2.5">
                Tạo tác phẩm mới
              </Button>
              {videoUrl && (
                <Button
                  asChild
                  className="elegant-button bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-6 py-2.5"
                >
                  <a href={videoUrl} download target="_blank" rel="noopener noreferrer">
                    Tải xuống tác phẩm
                  </a>
                </Button>
              )}
            </div>
          </div>
        )
      case "error":
        return (
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h3 className="text-xl font-serif font-medium mb-3 text-shadow-sm">Đã xảy ra lỗi</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {error || "Không thể xử lý video. Vui lòng thử lại sau."}
            </p>
            <Button onClick={resetForm} className="elegant-button px-6 py-2.5">
              Thử lại
            </Button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Card className="shadow-elegant hover:shadow-elegant-hover transition-shadow duration-300 border-0 overflow-hidden">
      <CardContent className="p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 p-1 bg-gray-100/80 rounded-lg">
            <TabsTrigger
              value="upload"
              disabled={status === "uploading" || status === "processing"}
              className="font-medium tracking-wide rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm py-2.5"
            >
              Tải lên
            </TabsTrigger>
            <TabsTrigger
              value="processing"
              disabled={status === "idle" || status === "completed"}
              className="font-medium tracking-wide rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm py-2.5"
            >
              Xử lý
            </TabsTrigger>
            <TabsTrigger
              value="result"
              disabled={status !== "completed"}
              className="font-medium tracking-wide rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm py-2.5"
            >
              Kết quả
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="bg-blue-50/70 border border-blue-100 rounded-lg p-5 mb-8">
                <h3 className="font-serif text-lg font-medium text-blue-800 mb-2">Hướng dẫn sử dụng</h3>
                <p className="text-blue-700/80 text-sm mb-2">
                  Ứng dụng này cho phép bạn tạo video hoạt hình từ hình ảnh. Một số cài đặt đã được thiết lập sẵn, trong
                  khi các tùy chọn khác có thể được điều chỉnh theo ý muốn của bạn.
                </p>
                <p className="text-blue-700/80 text-sm">Các cài đặt mặc định không thể thay đổi:</p>
                <ul className="text-sm text-blue-700/80 mt-3 space-y-1.5">
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></span>
                    Thời lượng: <span className="font-medium ml-1">4 giây</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2"></span>
                    Mô hình: <span className="font-medium ml-1">TDNM 25-Dev</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-serif text-xl font-medium mb-5 text-gray-800">Hình ảnh của bạn</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <ImageUploader
                    label="Nhân Vật Chính"
                    onChange={setMainCharacter}
                    value={mainCharacter}
                    required
                    disabled={status === "uploading" || status === "processing"}
                  />

                  <ImageUploader
                    label="Bối Cảnh"
                    onChange={setBackground}
                    value={background}
                    required
                    disabled={status === "uploading" || status === "processing"}
                  />

                  <ImageUploader
                    label="Tùy Chọn"
                    onChange={setOptionalImage}
                    value={optionalImage}
                    disabled={status === "uploading" || status === "processing"}
                  />
                </div>
              </div>

              <div className="space-y-6 mt-10">
                <h3 className="font-serif text-xl font-medium mb-5 text-gray-800">Tùy chỉnh tác phẩm</h3>
                <div>
                  <Label htmlFor="prompt" className="text-base font-medium mb-2 block">
                    Gợi ý (Prompt)
                  </Label>
                  <div className="mt-1.5">
                    <textarea
                      id="prompt"
                      rows={3}
                      maxLength={1000}
                      placeholder="Mô tả chi tiết về tác phẩm hoạt hình bạn muốn tạo..."
                      className="w-full rounded-lg border border-gray-300 shadow-sm px-4 py-3 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200"
                      value={videoSettings.prompt}
                      onChange={(e) => setVideoSettings({ ...videoSettings, prompt: e.target.value })}
                      disabled={status === "uploading" || status === "processing"}
                    />
                    <div className="text-xs text-gray-500 mt-2 text-right">
                      {videoSettings.prompt.length}/1000 ký tự
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="aspectRatio" className="text-base font-medium mb-2 block">
                    Tỷ lệ khung hình
                  </Label>
                  <select
                    id="aspectRatio"
                    className="w-full mt-1.5 rounded-lg border border-gray-300 shadow-sm px-4 py-2.5 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200"
                    value={videoSettings.aspectRatio}
                    onChange={(e) => setVideoSettings({ ...videoSettings, aspectRatio: e.target.value as AspectRatio })}
                    disabled={status === "uploading" || status === "processing"}
                  >
                    <option value="vertical">Dọc (9:16)</option>
                    <option value="horizontal">Ngang (16:9)</option>
                    <option value="square">Vuông (1:1)</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="resolution" className="text-base font-medium mb-2 block">
                    Độ phân giải
                  </Label>
                  <select
                    id="resolution"
                    className="w-full mt-1.5 rounded-lg border border-gray-300 shadow-sm px-4 py-2.5 focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200"
                    value={videoSettings.resolution}
                    onChange={(e) => setVideoSettings({ ...videoSettings, resolution: e.target.value as Resolution })}
                    disabled={status === "uploading" || status === "processing"}
                  >
                    <option value="360">360p</option>
                    <option value="720">720p (Khuyến nghị)</option>
                  </select>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-serif text-base font-medium mb-3">Xem trước tỷ lệ khung hình</h3>
                <AspectRatioPreview
                  aspectRatio={videoSettings.aspectRatio}
                  mainCharacterSrc={mainCharacter?.preview}
                  backgroundSrc={background?.preview}
                />
                <p className="text-xs text-gray-500 text-center mt-3 italic">
                  Đây chỉ là xem trước tỷ lệ khung hình, không phải kết quả cuối cùng
                </p>
              </div>

              {error && status === "idle" && (
                <Alert variant="destructive" className="mt-6 border border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-600 font-medium">Lỗi</AlertTitle>
                  <AlertDescription className="text-red-600/90">{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-center mt-10">
                <Button
                  type="submit"
                  size="lg"
                  disabled={status === "uploading" || status === "processing" || !mainCharacter || !background}
                  className="elegant-button px-8 py-3 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  {status === "uploading" || status === "processing" ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Tạo Tác Phẩm
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="processing">{renderStatusContent()}</TabsContent>

          <TabsContent value="result">{renderStatusContent()}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

