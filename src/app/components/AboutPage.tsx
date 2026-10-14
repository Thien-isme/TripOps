import {
  Target,
  Users,
  Award,
  TrendingUp,
  Heart,
  Shield,
  Sparkles,
  Globe,
} from "lucide-react";

interface AboutPageProps {
  onShowLogin: () => void;
}

export function AboutPage({ onShowLogin }: AboutPageProps) {
  const values = [
    {
      icon: Heart,
      title: "Tận tâm",
      description:
        "Chúng tôi luôn đặt lợi ích và trải nghiệm của khách hàng lên hàng đầu trong mọi quyết định.",
      color: "from-red-500 to-pink-500",
    },
    {
      icon: Shield,
      title: "Uy tín",
      description:
        "Minh bạch, trung thực và luôn giữ lời hứa với khách hàng và đối tác.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Sparkles,
      title: "Sáng tạo",
      description:
        "Không ngừng đổi mới, ứng dụng công nghệ để mang đến trải nghiệm tốt nhất.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Globe,
      title: "Đa dạng",
      description:
        "Cung cấp đa dạng các tour du lịch phù hợp với mọi nhu cầu và ngân sách.",
      color: "from-green-500 to-emerald-500",
    },
  ];

  const milestones = [
    {
      year: "2020",
      title: "Thành lập TourViet",
      description:
        "Khởi đầu với tầm nhìn kết nối du khách với những trải nghiệm tuyệt vời tại Việt Nam.",
    },
    {
      year: "2021",
      title: "Mở rộng toàn quốc",
      description:
        "Ra mắt văn phòng tại Hà Nội và Đà Nẵng, phục vụ hàng ngàn khách hàng.",
    },
    {
      year: "2022",
      title: "Ứng dụng AI",
      description:
        "Tích hợp công nghệ AI để tìm kiếm và gợi ý tour thông minh.",
    },
    {
      year: "2023",
      title: "50,000+ khách hàng",
      description:
        "Phục vụ hơn 50,000 khách hàng với hàng ngàn tour du lịch chất lượng.",
    },
  ];

  const team = [
    {
      name: "Nguyễn Văn A",
      position: "Giám đốc điều hành",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      bio: "Hơn 15 năm kinh nghiệm trong ngành du lịch",
    },
    {
      name: "Trần Thị B",
      position: "Giám đốc vận hành",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
      bio: "Chuyên gia về quản lý tour và dịch vụ khách hàng",
    },
    {
      name: "Lê Văn C",
      position: "Giám đốc công nghệ",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
      bio: "Tiên phong ứng dụng AI trong du lịch",
    },
    {
      name: "Phạm Thị D",
      position: "Giám đốc marketing",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
      bio: "Chuyên gia về truyền thông và phát triển thương hiệu",
    },
  ];

  const stats = [
    { value: "50,000+", label: "Khách hàng hài lòng" },
    { value: "1,000+", label: "Tour du lịch" },
    { value: "200+", label: "Điểm đến" },
    { value: "4.9/5", label: "Đánh giá trung bình" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold mb-6">
              Về Chúng Tôi
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              TourViet - Nền tảng đặt tour du lịch thông minh,
              kết nối bạn với những trải nghiệm tuyệt vời tại
              Việt Nam
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 -mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg text-center hover:shadow-xl transition-all"
              >
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80"
                alt="About TourViet"
                className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
              />
            </div>
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Sứ mệnh
                  </h2>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Mang đến cho du khách những trải nghiệm du
                  lịch tuyệt vời nhất tại Việt Nam thông qua
                  công nghệ hiện đại và dịch vụ chuyên nghiệp.
                  Chúng tôi cam kết làm cho việc tìm kiếm và đặt
                  tour trở nên dễ dàng, nhanh chóng và tin cậy.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Tầm nhìn
                  </h2>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Trở thành nền tảng đặt tour du lịch hàng đầu
                  Việt Nam, được biết đến với công nghệ AI tiên
                  tiến và dịch vụ khách hàng xuất sắc. Chúng tôi
                  hướng tới việc kết nối hàng triệu du khách với
                  những điểm đến tuyệt vời.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Cam kết
                  </h2>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Luôn đổi mới và cải tiến để mang đến trải
                  nghiệm tốt nhất. Chúng tôi cam kết minh bạch
                  trong mọi giao dịch, đảm bảo chất lượng dịch
                  vụ và hỗ trợ khách hàng 24/7.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Giá trị cốt lõi
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Những giá trị định hình văn hóa và cách chúng tôi
              phục vụ khách hàng
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all group"
                >
                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${value.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Hành trình phát triển
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Những cột mốc quan trọng trong quá trình phát
              triển của TourViet
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-600 to-purple-600 hidden lg:block"></div>

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`relative grid grid-cols-1 lg:grid-cols-2 gap-8 ${
                    index % 2 === 0 ? "" : "lg:flex-row-reverse"
                  }`}
                >
                  {index % 2 === 0 ? (
                    <>
                      <div className="lg:text-right lg:pr-12">
                        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all inline-block">
                          <div className="text-3xl font-bold text-blue-600 mb-2">
                            {milestone.year}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {milestone.title}
                          </h3>
                          <p className="text-gray-600">
                            {milestone.description}
                          </p>
                        </div>
                      </div>
                      <div className="hidden lg:block"></div>
                    </>
                  ) : (
                    <>
                      <div className="hidden lg:block"></div>
                      <div className="lg:pl-12">
                        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all inline-block">
                          <div className="text-3xl font-bold text-purple-600 mb-2">
                            {milestone.year}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {milestone.title}
                          </h3>
                          <p className="text-gray-600">
                            {milestone.description}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                  <div className="absolute left-1/2 top-6 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full hidden lg:block"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Đội ngũ lãnh đạo
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Những người dẫn dắt TourViet phát triển và thành
              công
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 font-medium mb-3">
                    {member.position}
                  </p>
                  <p className="text-sm text-gray-600">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Tham gia cùng chúng tôi
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Hãy trở thành một phần của cộng đồng TourViet và
            khám phá Việt Nam theo cách của bạn
          </p>
          <button
            onClick={onShowLogin}
            className="px-10 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all shadow-xl font-bold text-lg transform hover:scale-105"
          >
            Đăng nhập ngay
          </button>
        </div>
      </section>
    </div>
  );
}