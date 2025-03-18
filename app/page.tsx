import { VideoProcessor } from "@/components/video-processor"

export default function Home() {
  return (
    <main className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gradient elegant-heading">Làm Hoạt Hình Cùng TDNM</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg elegant-subheading">
            Tạo các tác phẩm hoạt hình độc đáo với công nghệ AI tiên tiến. Tải lên hình ảnh nhân vật chính và bối cảnh
            để bắt đầu hành trình sáng tạo của bạn.
          </p>
        </header>

        <VideoProcessor />

        <footer className="mt-20 text-center text-sm text-gray-500 py-6 border-t border-gray-100">
          <p className="font-light tracking-wide">© 2025 TDNM. Tất cả các quyền được bảo lưu.</p>
        </footer>
      </div>
    </main>
  )
}

