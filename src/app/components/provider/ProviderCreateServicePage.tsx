import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Eye,
  Edit3,
  CheckCircle2,
  Hotel,
  Utensils,
  Compass,
  Sparkles,
  Car,
  Image as ImageIcon,
  Plus,
  Trash2,
  Star,
  MapPin,
  DollarSign,
  Info,
  Layers,
  ExternalLink,
  ShieldCheck,
  Clock,
  Users,
  Bed,
  Coffee,
  Check,
  Ticket,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Service, User } from "@/app/types";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  allVietnamProvinces,
  getWardsForProvince,
  getCoordinatesForProvince,
} from "@/app/data/vietnamAdministrative";
import { GoogleMapLocationPicker } from "./GoogleMapLocationPicker";

interface ProviderCreateServicePageProps {
  currentUser: User;
  onSaveService: (serviceData: Omit<Service, "id">) => void;
  onBack: () => void;
  initialService?: Service; // If editing
}

export type ServiceCategory =
  | "hotel"
  | "fnb"
  | "attraction"
  | "activity"
  | "transportation";

const categoryOptions = [
  {
    value: "hotel" as ServiceCategory,
    label: "Lưu trú & Khách sạn",
    description: "Khách sạn, Resort, Homestay, Villa nghỉ dưỡng, Glamping",
    icon: Hotel,
    color: "from-blue-600 to-indigo-600",
    badge: "Lưu trú",
  },
  {
    value: "fnb" as ServiceCategory,
    label: "Ẩm thực & Nhà hàng",
    description: "Nhà hàng, Quán ăn đặc sản, Cà phê, Buffet, Tiệc đoàn tour",
    icon: Utensils,
    color: "from-amber-500 to-orange-600",
    badge: "Ẩm thực",
  },
  {
    value: "transportation" as ServiceCategory,
    label: "Phương tiện & Vận chuyển",
    description: "Xe du lịch 4-45 chỗ, Limousine, Tàu cano, Thuê xe",
    icon: Car,
    color: "from-cyan-500 to-blue-600",
    badge: "Vận chuyển",
  },
  {
    value: "attraction" as ServiceCategory,
    label: "Điểm tham quan & Vé",
    description: "Danh lam thắng cảnh, Di tích lịch sử, Khu du lịch sinh thái",
    icon: Compass,
    color: "from-teal-500 to-emerald-600",
    badge: "Tham quan",
  },
];

export function ProviderCreateServicePage({
  currentUser,
  onSaveService,
  onBack,
  initialService,
}: ProviderCreateServicePageProps) {
  const isEditing = !!initialService;

  // View mode: 'form' or 'preview'
  const [viewMode, setViewMode] = useState<"form" | "preview">("form");
  const [category, setCategory] = useState<ServiceCategory>(
    (initialService?.category as ServiceCategory) || "hotel"
  );

  // Common Fields
  const [name, setName] = useState(initialService?.name || "");
  const [description, setDescription] = useState(initialService?.description || "");

  // PRICE RANGE PER PERSON (Khoảng giá trên đầu người)
  const [priceFrom, setPriceFrom] = useState(
    initialService?.priceFrom?.toString() || initialService?.price?.toString() || "300000"
  );
  const [priceTo, setPriceTo] = useState(
    initialService?.priceTo?.toString() || "600000"
  );

  // 2-level administrative address (ONLY Province & Ward)
  const [province, setProvince] = useState(initialService?.province || "Lâm Đồng");
  const [ward, setWard] = useState(initialService?.ward || "Phường 3");
  const [street, setStreet] = useState(initialService?.street || "02 Trần Phú");

  // GPS Map Coordinates
  const [latitude, setLatitude] = useState<number>(
    initialService?.latitude || 11.9404
  );
  const [longitude, setLongitude] = useState<number>(
    initialService?.longitude || 108.4583
  );

  // Photo Gallery & Thumbnail Selector
  const defaultImages = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800",
  ];

  const [images, setImages] = useState<string[]>(
    initialService?.images && initialService.images.length > 0
      ? initialService.images
      : initialService?.image
      ? [initialService.image]
      : defaultImages
  );
  const [thumbnailIndex, setThumbnailIndex] = useState<number>(
    initialService?.thumbnailIndex || 0
  );
  const [newImageUrl, setNewImageUrl] = useState("");

  // ==========================================
  // 1. DEDICATED FIELDS FOR HOTEL / ACCOMMODATION
  // ==========================================
  const [hotelType, setHotelType] = useState(
    initialService?.subCategory || "Khách sạn (Hotel)"
  );
  const [stars, setStars] = useState(initialService?.stars?.toString() || "4");
  const [totalRooms, setTotalRooms] = useState(
    initialService?.totalRooms?.toString() || initialService?.capacity?.toString() || "30"
  );
  const [policies, setPolicies] = useState(
    initialService?.policies ||
      "Nhận phòng: 14:00 - Trả phòng: 12:00. Đã bao gồm buffet sáng hàng ngày. Miễn phí cho trẻ em dưới 6 tuổi."
  );
  const [hotelAmenities, setHotelAmenities] = useState<string[]>(
    initialService?.amenities || [
      "Wifi tốc độ cao miễn phí",
      "Điều hòa 2 chiều",
      "Smart TV 50 inch",
      "Bồn tắm nằm cao cấp",
      "Ban công ngắm cảnh riêng",
      "Thang máy",
      "Bãi đỗ xe 45 chỗ",
    ]
  );

  // ==========================================
  // 2. DEDICATED FIELDS FOR F&B / RESTAURANTS
  // ==========================================
  const [fnbModel, setFnbModel] = useState("Nhà hàng phục vụ đoàn tour lữ hành");
  const [cuisineStyle, setCuisineStyle] = useState(initialService?.cuisineType || "Đặc sản địa phương & Lẩu nướng");
  const [openingHours, setOpeningHours] = useState(initialService?.openingHours || "06:30 - 22:30");
  const [fnbCapacity, setFnbCapacity] = useState(initialService?.capacity?.toString() || "150");
  const [hasVipRoom, setHasVipRoom] = useState("Có phòng VIP máy lạnh riêng cho đoàn");
  const [fnbMenuHighlight, setFnbMenuHighlight] = useState(
    "Set menu 6 món: Khai vị gỏi hoa chuối, Heo rừng nướng ống tre, Cá tầm nướng muối ớt, Lẩu gà lá é, Cơm lam, Tráng miệng hoa quả."
  );
  const [dietaryOptions, setDietaryOptions] = useState<string[]>([
    "Hỗ trợ món chay thanh tịnh",
    "Có thực đơn riêng cho trẻ em",
    "Điều chỉnh gia vị theo vùng miền",
  ]);
  const [fnbTourFacilities, setFnbTourFacilities] = useState<string[]>([
    "Bãi đỗ xe 45 chỗ rộng rãi",
    "Có sân khấu & Âm thanh Gala",
    "Phòng máy lạnh thoáng mát",
    "Xuất hóa đơn VAT đầy đủ",
  ]);

  // ==========================================
  // 3. DEDICATED FIELDS FOR ATTRACTIONS
  // ==========================================
  const [attractionType, setAttractionType] = useState("Khu du lịch sinh thái & Danh lam thắng cảnh");
  const [attractionHours, setAttractionHours] = useState(initialService?.openingHours || "07:30 - 17:30 (Ngừng nhận khách 17:00)");
  const [ticketIncludes, setTicketIncludes] = useState(
    initialService?.ticketIncludes || "Vé vào cổng toàn khu, xe điện di chuyển nội khu, nước suối đóng chai, xem biểu diễn văn nghệ."
  );
  const [childTicketPolicy, setChildTicketPolicy] = useState("Trẻ em dưới 1m miễn phí, từ 1m - 1m4 tính 50% vé người lớn");
  const [attractionRules, setAttractionRules] = useState("Trang phục lịch sự khi vào khu di tích tâm linh, không xả rác bừa bãi");
  const [attractionFacilities, setAttractionFacilities] = useState<string[]>([
    "Bãi đỗ xe du lịch lớn",
    "Nhà hàng & Trạm dừng nghỉ nội khu",
    "Khu vệ sinh đạt chuẩn du lịch",
    "Cửa hàng đặc sản lưu niệm",
  ]);

  // ==========================================
  // 4. DEDICATED FIELDS FOR ACTIVITIES / EXPERIENCES
  // ==========================================
  const [activityType, setActivityType] = useState("Thể thao dưới nước & Khám phá thiên nhiên");
  const [duration, setDuration] = useState(initialService?.duration || "Khoảng 2.5 - 3 giờ");
  const [departureSlots, setDepartureSlots] = useState("Ca sáng 08:00 và Ca chiều hoàng hôn 14:30 hàng ngày");
  const [difficultyLevel, setDifficultyLevel] = useState(initialService?.difficultyLevel || "Dễ dàng - Vừa sức");
  const [ageRestriction, setAgeRestriction] = useState(initialService?.ageRestriction || "Từ 6 tuổi trở lên, người có thể lực bình thường");
  const [safetyGear, setSafetyGear] = useState(
    initialService?.safetyGear || "Áo phao tiêu chuẩn cứu sinh, mũ bảo hiểm chuyên dụng, túi chống nước, hướng dẫn viên chuyên nghiệp kèm sát"
  );
  const [guideRatio, setGuideRatio] = useState("Tối thiểu 1 Hướng dẫn viên / Huấn luyện viên kèm 5 khách");
  const [activityGroupSize, setActivityGroupSize] = useState(initialService?.capacity?.toString() || "Tối thiểu 2 khách, tối đa 20 khách/lượt");

  // ==========================================
  // 5. DEDICATED FIELDS FOR TRANSPORTATION
  // ==========================================
  const [vehicleType, setVehicleType] = useState(initialService?.vehicleType || "Xe 16 chỗ Limousine Hạng Thương Gia");
  const [vehicleBrandModel, setVehicleBrandModel] = useState("Ford Transit DCar Limousine VIP đời 2023 - 2024");
  const [seats, setSeats] = useState(initialService?.seats?.toString() || "16");
  const [serviceServiceType, setServiceServiceType] = useState("Thuê trọn gói theo tour / Đưa đón sân bay & Liên tỉnh");
  const [transportFacilities, setTransportFacilities] = useState<string[]>([
    "Ghế da cao cấp có ngả lưng & massage",
    "Wifi 4G tốc độ cao miễn phí",
    "Cổng sạc điện thoại USB tại từng vị trí ngồi",
    "Nước suối đóng chai & khăn lạnh",
    "Màn hình TV giải trí & Micro HDV",
    "Cốp hành lý rộng rãi",
  ]);
  const [driverStandard, setDriverStandard] = useState(
    "Tài xế nhiều năm kinh nghiệm cung đường đèo dốc du lịch, tác phong lịch sự, chạy êm ái an toàn."
  );

  // Auto-sync wards and map coordinates when province changes
  useEffect(() => {
    const coords = getCoordinatesForProvince(province);
    setLatitude(coords.lat);
    setLongitude(coords.lng);
    const availableWards = getWardsForProvince(province);
    if (!availableWards.includes(ward)) {
      setWard(availableWards[0] || "Phường 1");
    }
  }, [province]);

  const handleAddImage = () => {
    if (newImageUrl.trim() && !images.includes(newImageUrl.trim())) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    if (images.length <= 1) {
      alert("Cần giữ lại ít nhất 1 hình ảnh cho bài đăng dịch vụ.");
      return;
    }
    const filtered = images.filter((_, i) => i !== index);
    setImages(filtered);
    if (thumbnailIndex >= filtered.length) {
      setThumbnailIndex(0);
    }
  };

  const toggleArrayItem = (list: string[], setList: (val: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fromVal = parseFloat(priceFrom) || 0;
    const toVal = priceTo ? parseFloat(priceTo) : fromVal;
    const locationParts = [street, ward, province].filter(Boolean);
    const fullLocation = locationParts.join(", ");
    const thumbnailPhoto = images[thumbnailIndex] || images[0];

    const baseService: Omit<Service, "id"> = {
      providerId: currentUser.id,
      providerName: currentUser.businessName || currentUser.name,
      name,
      category,
      description,
      price: fromVal,
      priceFrom: fromVal,
      priceTo: toVal,
      pricePerPerson: fromVal,
      location: fullLocation,
      province,
      ward,
      street,
      latitude,
      longitude,
      image: thumbnailPhoto,
      images,
      thumbnailIndex,
      status: "pending",
      createdAt: initialService?.createdAt || new Date().toISOString().split("T")[0],
    };

    let fullPayload: Omit<Service, "id"> = { ...baseService };

    switch (category) {
      case "hotel":
        fullPayload = {
          ...baseService,
          subCategory: hotelType,
          stars: parseInt(stars) || 3,
          totalRooms: parseInt(totalRooms) || 0,
          capacity: parseInt(totalRooms) || 0,
          policies,
          amenities: hotelAmenities,
        };
        break;
      case "fnb":
        fullPayload = {
          ...baseService,
          subCategory: fnbModel,
          cuisineType: cuisineStyle,
          openingHours,
          capacity: parseInt(fnbCapacity) || 100,
          dietaryOptions,
          amenities: fnbTourFacilities,
        };
        break;
      case "attraction":
        fullPayload = {
          ...baseService,
          subCategory: attractionType,
          openingHours: attractionHours,
          ticketIncludes,
          amenities: attractionFacilities,
        };
        break;
      case "activity":
        fullPayload = {
          ...baseService,
          subCategory: activityType,
          duration,
          difficultyLevel,
          ageRestriction,
          safetyGear,
          amenities: [guideRatio, departureSlots],
        };
        break;
      case "transportation":
        fullPayload = {
          ...baseService,
          vehicleType,
          seats: parseInt(seats) || 16,
          amenities: transportFacilities,
        };
        break;
    }

    onSaveService(fullPayload);
  };

  const formatPriceRangeDisplay = () => {
    const fromVal = parseFloat(priceFrom);
    const toVal = parseFloat(priceTo);
    const unit = category === "hotel" ? "phòng" : "người";
    if (!isNaN(fromVal) && !isNaN(toVal) && toVal > fromVal) {
      return `${fromVal.toLocaleString("vi-VN")}đ - ${toVal.toLocaleString("vi-VN")}đ / ${unit}`;
    }
    if (!isNaN(fromVal)) {
      return `Từ ${fromVal.toLocaleString("vi-VN")}đ / ${unit}`;
    }
    return "Liên hệ báo giá";
  };

  const activeCategoryMeta = categoryOptions.find((c) => c.value === category)!;
  const ActiveIcon = activeCategoryMeta.icon;

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Top Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="rounded-xl border-gray-200 hover:bg-gray-100 text-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Quay lại danh sách
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {isEditing ? "Chỉnh sửa bài đăng dịch vụ" : "Đăng Dịch Vụ Mới"}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Form thông tin chuyên biệt cho từng loại hình dịch vụ du lịch & lữ hành
            </p>
          </div>
        </div>

        {/* Form vs Preview Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-gray-100/90 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode("form")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "form"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Nhập liệu thông tin
          </button>
          <button
            type="button"
            onClick={() => setViewMode("preview")}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "preview"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Xem trước (Preview)
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODE 1: FORM INPUT MODE */}
      {/* ========================================================= */}
      {viewMode === "form" && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Category Picker */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                  1
                </span>
                Chọn loại hình dịch vụ cần đăng
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Chọn đúng loại hình để hệ thống tự động tải form nhập liệu chuyên biệt tương ứng
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {categoryOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = category === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setCategory(opt.value);
                      if (opt.value === "hotel") setName("Khách sạn Đà Lạt Heritage 4 sao");
                      else if (opt.value === "fnb") setName("Nhà hàng Hải Sản Biển Xanh Phú Quốc");
                      else if (opt.value === "transportation") setName("Xe Limousine VIP 16 chỗ Hạng Thương Gia");
                      else if (opt.value === "attraction") setName("Vé Tham Quan Thung Lũng Tình Yêu");
                    }}
                    className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between h-32 ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-600/20"
                        : "border-gray-200 bg-gray-50/50 hover:bg-white hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-white bg-gradient-to-br ${opt.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-gray-900 leading-snug">
                        {opt.label}
                      </div>
                      <div className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                        {opt.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* =================================================================== */}
          {/* Step 2: DEDICATED FORM FIELDS PER SERVICE TYPE                     */}
          {/* =================================================================== */}

          {/* FORM 1: LƯU TRÚ & KHÁCH SẠN */}
          {category === "hotel" && (
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-blue-200 shadow-xs space-y-5 bg-gradient-to-b from-blue-50/20 to-white">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                      2
                    </span>
                    Biểu mẫu chuyên biệt: Dịch vụ Lưu trú & Khách sạn
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Cung cấp tên cơ sở lưu trú, loại hình, hạng sao, tổng số lượng phòng, chính sách và tiện nghi phòng
                  </p>
                </div>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-semibold text-xs">
                  <Hotel className="w-3.5 h-3.5 mr-1" />
                  Khách sạn / Lưu trú
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Tên cơ sở lưu trú */}
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Tên cơ sở lưu trú *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Khách sạn Đà Lạt Heritage, Dalat Wonder Resort, Homestay Mây Lang Thang..."
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                {/* 2. Loại hình */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Loại hình cơ sở lưu trú *
                  </label>
                  <select
                    value={hotelType}
                    onChange={(e) => setHotelType(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Khách sạn (Hotel)">Khách sạn (Hotel)</option>
                    <option value="Resort & Nghỉ dưỡng">Resort & Nghỉ dưỡng</option>
                    <option value="Homestay & Nhà dân">Homestay & Nhà dân</option>
                    <option value="Biệt thự / Villa">Biệt thự / Villa nguyên căn</option>
                    <option value="Căn hộ dịch vụ (Apartment)">Căn hộ dịch vụ (Apartment)</option>
                    <option value="Glamping & Cắm trại cao cấp">Glamping & Cắm trại cao cấp</option>
                  </select>
                </div>

                {/* 3. Hạng sao */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Hạng sao
                  </label>
                  <select
                    value={stars}
                    onChange={(e) => setStars(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="5">5 Sao ⭐⭐⭐⭐⭐ (Sang trọng bậc nhất)</option>
                    <option value="4">4 Sao ⭐⭐⭐⭐ (Cao cấp chuẩn quốc tế)</option>
                    <option value="3">3 Sao ⭐⭐⭐ (Tiện nghi đầy đủ)</option>
                    <option value="2">2 Sao ⭐⭐ (Tiêu chuẩn)</option>
                    <option value="1">1 Sao ⭐ (Kinh tế)</option>
                    <option value="0">Tiêu chuẩn du lịch (Chưa gắn sao)</option>
                  </select>
                </div>

                {/* 4. Tổng số lượng phòng ở chỗ lưu trú đó */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Tổng số lượng phòng ở chỗ lưu trú đó *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={totalRooms}
                    onChange={(e) => setTotalRooms(e.target.value)}
                    placeholder="VD: 50"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                {/* 5. Các chính sách đi kèm */}
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Các chính sách đi kèm (Nhận/trả phòng, Bữa ăn, Phụ thu, Hoàn hủy...) *
                  </label>
                  <textarea
                    rows={3}
                    value={policies}
                    onChange={(e) => setPolicies(e.target.value)}
                    placeholder="VD: Giờ nhận phòng 14:00 - Trả phòng 12:00. Bao gồm buffet sáng hàng ngày. Miễn phí cho trẻ em dưới 6 tuổi ngủ cùng bố mẹ. Hỗ trợ phụ thu thêm người 250.000đ/đêm. Miễn phí hủy trước 48 giờ..."
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* 6. Các thông tin tiện nghi của phòng */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Các thông tin tiện nghi của phòng & Tiện ích đi kèm
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {[
                    "Wifi tốc độ cao miễn phí",
                    "Điều hòa 2 chiều",
                    "Smart TV 50 inch",
                    "Bồn tắm nằm cao cấp",
                    "Ban công ngắm cảnh riêng",
                    "Thang máy",
                    "Bãi đỗ xe 45 chỗ",
                    "Bể bơi vô cực",
                    "Minibar & Nước suối",
                    "Máy sấy tóc & Đồ vệ sinh",
                    "Quầy Bar / Cafe tầng thượng",
                    "Dọn phòng hàng ngày",
                  ].map((amenity) => {
                    const checked = hotelAmenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => toggleArrayItem(hotelAmenities, setHotelAmenities, amenity)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium text-left border flex items-center justify-between transition-all ${
                          checked
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                        }`}
                      >
                        <span className="truncate">{amenity}</span>
                        {checked && <Check className="w-3.5 h-3.5 flex-shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* FORM 2: ẨM THỰC & NHÀ HÀNG */}
          {category === "fnb" && (
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-orange-200 shadow-xs space-y-5 bg-gradient-to-b from-orange-50/20 to-white">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-orange-900 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-orange-600 text-white text-xs flex items-center justify-center font-bold">
                      2
                    </span>
                    Biểu mẫu chuyên biệt: Dịch vụ Ẩm thực & Nhà hàng
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Cung cấp thông tin phong cách món, sức chứa đoàn khách, thực đơn set menu và tiện ích nhà hàng
                  </p>
                </div>
                <Badge className="bg-orange-100 text-orange-800 border-orange-200 font-semibold text-xs">
                  <Utensils className="w-3.5 h-3.5 mr-1" />
                  Ẩm thực / Nhà hàng
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Tên cơ sở ẩm thực / Nhà hàng *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Nhà hàng Hải Sản Biển Xanh Phú Quốc"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Mô hình cơ sở
                  </label>
                  <select
                    value={fnbModel}
                    onChange={(e) => setFnbModel(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    <option value="Nhà hàng phục vụ đoàn tour lữ hành">Nhà hàng phục vụ đoàn tour lữ hành</option>
                    <option value="Nhà hàng hải sản tươi sống">Nhà hàng hải sản tươi sống</option>
                    <option value="Nhà hàng ẩm thực đặc sản gia đình">Nhà hàng ẩm thực đặc sản gia đình</option>
                    <option value="Nhà hàng Buffet / Lẩu Nướng BBQ">Nhà hàng Buffet / Lẩu Nướng BBQ</option>
                    <option value="Quán Cà phê & Điểm tâm">Quán Cà phê & Điểm tâm</option>
                    <option value="Nhà hàng ẩm thực chay thanh tịnh">Nhà hàng ẩm thực chay thanh tịnh</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Phong cách ẩm thực
                  </label>
                  <input
                    type="text"
                    value={cuisineStyle}
                    onChange={(e) => setCuisineStyle(e.target.value)}
                    placeholder="VD: Hải sản biển đảo, Đặc sản Tây Nguyên, Món Việt..."
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Khung giờ mở cửa đón khách
                  </label>
                  <input
                    type="text"
                    value={openingHours}
                    onChange={(e) => setOpeningHours(e.target.value)}
                    placeholder="VD: 06:30 - 22:30 hàng ngày"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Sức chứa tối đa (Khách đoàn)
                  </label>
                  <input
                    type="number"
                    value={fnbCapacity}
                    onChange={(e) => setFnbCapacity(e.target.value)}
                    placeholder="VD: 200 khách"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Phòng VIP riêng / Không gian tiếp đoàn
                  </label>
                  <input
                    type="text"
                    value={hasVipRoom}
                    onChange={(e) => setHasVipRoom(e.target.value)}
                    placeholder="VD: Có 3 phòng VIP riêng máy lạnh cho đoàn từ 15 - 40 người"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Thực đơn gợi ý / Set Menu đoàn lữ hành
                  </label>
                  <textarea
                    rows={2}
                    value={fnbMenuHighlight}
                    onChange={(e) => setFnbMenuHighlight(e.target.value)}
                    placeholder="Chi tiết các món signature tiêu biểu trong set menu phục vụ đoàn..."
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Dietary & Facilities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Chế độ ẩm thực đặc biệt
                  </label>
                  <div className="space-y-1.5">
                    {[
                      "Hỗ trợ món chay thanh tịnh",
                      "Có thực đơn riêng cho trẻ em",
                      "Điều chỉnh gia vị theo vùng miền",
                      "Hỗ trợ thực đơn Halal cho khách quốc tế",
                      "Món ăn kiêng ít dầu mỡ / người cao tuổi",
                    ].map((opt) => {
                      const checked = dietaryOptions.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => toggleArrayItem(dietaryOptions, setDietaryOptions, opt)}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs font-medium text-left border flex items-center justify-between transition-all ${
                            checked
                              ? "bg-orange-500 text-white border-orange-500"
                              : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                          }`}
                        >
                          <span>{opt}</span>
                          {checked && <Check className="w-3.5 h-3.5 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Tiện ích cho công ty lữ hành & Khách đoàn
                  </label>
                  <div className="space-y-1.5">
                    {[
                      "Bãi đỗ xe 45 chỗ rộng rãi",
                      "Có sân khấu & Âm thanh Gala",
                      "Phòng máy lạnh thoáng mát",
                      "Xuất hóa đơn VAT đầy đủ",
                      "Không gian sân vườn ngoài trời",
                    ].map((facility) => {
                      const checked = fnbTourFacilities.includes(facility);
                      return (
                        <button
                          key={facility}
                          type="button"
                          onClick={() => toggleArrayItem(fnbTourFacilities, setFnbTourFacilities, facility)}
                          className={`w-full px-3 py-1.5 rounded-lg text-xs font-medium text-left border flex items-center justify-between transition-all ${
                            checked
                              ? "bg-orange-500 text-white border-orange-500"
                              : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                          }`}
                        >
                          <span>{facility}</span>
                          {checked && <Check className="w-3.5 h-3.5 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FORM 3: ĐIỂM THAM QUAN & VÉ */}
          {category === "attraction" && (
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-teal-200 shadow-xs space-y-5 bg-gradient-to-b from-teal-50/20 to-white">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-teal-900 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center font-bold">
                      2
                    </span>
                    Biểu mẫu chuyên biệt: Điểm tham quan & Vé vào cổng
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Cung cấp phân loại điểm đến, giờ mở cửa, quyền lợi vé và chính sách vé trẻ em
                  </p>
                </div>
                <Badge className="bg-teal-100 text-teal-800 border-teal-200 font-semibold text-xs">
                  <Compass className="w-3.5 h-3.5 mr-1" />
                  Điểm tham quan / Vé
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Tên điểm tham quan / Khu du lịch *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Vé Tham Quan Khu Du Lịch Thung Lũng Tình Yêu"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Phân loại điểm đến
                  </label>
                  <select
                    value={attractionType}
                    onChange={(e) => setAttractionType(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Khu du lịch sinh thái & Danh lam thắng cảnh">Khu du lịch sinh thái & Danh lam thắng cảnh</option>
                    <option value="Di tích văn hóa - lịch sử - tâm linh">Di tích văn hóa - lịch sử - tâm linh</option>
                    <option value="Công viên chủ đề & Giải trí quy mô lớn">Công viên chủ đề & Giải trí quy mô lớn</option>
                    <option value="Vườn hoa & Nông trại trải nghiệm công nghệ cao">Vườn hoa & Nông trại nông nghiệp</option>
                    <option value="Bảo tàng & Khu trưng bày nghệ thuật">Bảo tàng & Khu trưng bày nghệ thuật</option>
                    <option value="Làng nghề truyền thống bản địa">Làng nghề truyền thống bản địa</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Khung giờ mở cửa & Chốt nhận khách
                  </label>
                  <input
                    type="text"
                    value={attractionHours}
                    onChange={(e) => setAttractionHours(e.target.value)}
                    placeholder="VD: 07:30 - 17:30 (Ngừng bán vé lúc 17:00)"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Quyền lợi vé bao gồm (Chi tiết cho tour) *
                  </label>
                  <textarea
                    rows={2}
                    value={ticketIncludes}
                    onChange={(e) => setTicketIncludes(e.target.value)}
                    placeholder="VD: Vé vào cổng toàn khu, xe điện di chuyển nội khu, nước suối đóng chai, xem biểu diễn văn nghệ..."
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Chính sách vé trẻ em & Người cao tuổi
                  </label>
                  <input
                    type="text"
                    value={childTicketPolicy}
                    onChange={(e) => setChildTicketPolicy(e.target.value)}
                    placeholder="VD: Dưới 1m miễn phí, từ 1m - 1m4 tính 50% vé người lớn"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Quy định tham quan cần lưu ý
                  </label>
                  <input
                    type="text"
                    value={attractionRules}
                    onChange={(e) => setAttractionRules(e.target.value)}
                    placeholder="VD: Trang phục lịch sự, cấm mang flycam..."
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Attraction Facilities */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Tiện ích & Dịch vụ nội khu
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    "Bãi đỗ xe du lịch lớn",
                    "Nhà hàng & Trạm dừng nghỉ nội khu",
                    "Khu vệ sinh đạt chuẩn du lịch",
                    "Cửa hàng đặc sản lưu niệm",
                    "Trạm y tế sơ cấp cứu",
                    "Hướng dẫn viên tại điểm",
                    "Hỗ trợ xe lăn người khuyết tật",
                    "Tủ gửi đồ tư trang an toàn",
                  ].map((facility) => {
                    const checked = attractionFacilities.includes(facility);
                    return (
                      <button
                        key={facility}
                        type="button"
                        onClick={() => toggleArrayItem(attractionFacilities, setAttractionFacilities, facility)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium text-left border flex items-center justify-between transition-all ${
                          checked
                            ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                            : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                        }`}
                      >
                        <span className="truncate">{facility}</span>
                        {checked && <Check className="w-3.5 h-3.5 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* FORM 4: HOẠT ĐỘNG & TRẢI NGHIỆM */}
          {category === "activity" && (
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-purple-200 shadow-xs space-y-5 bg-gradient-to-b from-purple-50/20 to-white">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">
                      2
                    </span>
                    Biểu mẫu chuyên biệt: Hoạt động & Tour Trải nghiệm
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Cung cấp thời lượng, độ khó thể lực, thiết bị bảo hộ an toàn và số lượng người tham gia
                  </p>
                </div>
                <Badge className="bg-purple-100 text-purple-800 border-purple-200 font-semibold text-xs">
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  Trải nghiệm / Hoạt động
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Tên hoạt động trải nghiệm *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Tour Chèo SUP Ngắm Bình Minh & Rừng Thông Hồ Tuyền Lâm"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Phân loại hoạt động
                  </label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="Thể thao dưới nước (Chèo SUP, Kayak, Lặn biển)">Thể thao dưới nước (SUP, Kayak, Lặn biển)</option>
                    <option value="Thể thao mạo hiểm (Canyoning, Zipline, Dù lượn)">Thể thao mạo hiểm (Canyoning, Dù lượn)</option>
                    <option value="Khám phá thiên nhiên (Trekking, Leo núi)">Khám phá thiên nhiên (Trekking, Leo núi)</option>
                    <option value="Cắm trại & Gala dã ngoại (Camping/Glamping)">Cắm trại & Gala dã ngoại</option>
                    <option value="Trải nghiệm nông nghiệp & Làm nghề truyền thống">Trải nghiệm nông nghiệp & Làm nghề</option>
                    <option value="Giao lưu văn hóa bản địa (Cồng chiêng...)">Giao lưu văn hóa bản địa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Thời lượng trải nghiệm
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="VD: 2.5 - 3 giờ, Nửa ngày..."
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Mức độ thể lực / Độ khó
                  </label>
                  <select
                    value={difficultyLevel}
                    onChange={(e) => setDifficultyLevel(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl"
                  >
                    <option value="Dễ dàng (Thích hợp mọi lứa tuổi)">Dễ dàng (Thích hợp mọi lứa tuổi)</option>
                    <option value="Vừa sức (Cần thể lực cơ bản)">Vừa sức (Cần thể lực cơ bản)</option>
                    <option value="Thử thách / Mạo hiểm (Cần rèn luyện)">Thử thách / Mạo hiểm (Cần rèn luyện)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Lịch ca khởi hành trong ngày
                  </label>
                  <input
                    type="text"
                    value={departureSlots}
                    onChange={(e) => setDepartureSlots(e.target.value)}
                    placeholder="VD: Ca bình minh 05:00 và Ca chiều 14:30"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Giới hạn độ tuổi & Yêu cầu sức khỏe
                  </label>
                  <input
                    type="text"
                    value={ageRestriction}
                    onChange={(e) => setAgeRestriction(e.target.value)}
                    placeholder="VD: Từ 6 tuổi trở lên, không bệnh tim mạch"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Quy mô đoàn khách
                  </label>
                  <input
                    type="text"
                    value={activityGroupSize}
                    onChange={(e) => setActivityGroupSize(e.target.value)}
                    placeholder="VD: Tối thiểu 2 khách, tối đa 25 khách"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Trang thiết bị bảo hộ an toàn chuẩn bị cho khách *
                  </label>
                  <input
                    type="text"
                    value={safetyGear}
                    onChange={(e) => setSafetyGear(e.target.value)}
                    placeholder="VD: Áo phao tiêu chuẩn, mũ bảo hiểm chuyên dụng, túi chống nước điện thoại, đai an toàn Petzl..."
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* FORM 5: PHƯƠNG TIỆN & VẬN CHUYỂN */}
          {category === "transportation" && (
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-cyan-200 shadow-xs space-y-5 bg-gradient-to-b from-cyan-50/20 to-white">
              <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-cyan-900 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-600 text-white text-xs flex items-center justify-center font-bold">
                      2
                    </span>
                    Biểu mẫu chuyên biệt: Phương tiện & Vận chuyển Du lịch
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Cung cấp số chỗ ngồi, dòng xe đời xe, hình thức cho thuê và tiện ích trên xe
                  </p>
                </div>
                <Badge className="bg-cyan-100 text-cyan-800 border-cyan-200 font-semibold text-xs">
                  <Car className="w-3.5 h-3.5 mr-1" />
                  Phương tiện / Vận chuyển
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Tên gói phương tiện / Dịch vụ xe *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Xe Limousine 16 chỗ Hạng Thương Gia Tuyến Đà Lạt - Sài Gòn"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Phân loại phương tiện
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="Xe 16 chỗ Limousine VIP">Xe 16 chỗ Limousine VIP</option>
                    <option value="Xe du lịch 16 chỗ tiêu chuẩn">Xe du lịch 16 chỗ tiêu chuẩn (Transit/Solati)</option>
                    <option value="Xe du lịch 29 chỗ (Thaco/Samco)">Xe du lịch 29 chỗ (Thaco/Samco)</option>
                    <option value="Xe du lịch 45 chỗ Universe">Xe du lịch 45 chỗ Universe</option>
                    <option value="Xe du lịch 7 chỗ (Carnival/Fortuner)">Xe du lịch 7 chỗ (Carnival/Fortuner)</option>
                    <option value="Xe du lịch 4 chỗ cao cấp (Sedan)">Xe du lịch 4 chỗ cao cấp (Sedan)</option>
                    <option value="Tàu / Cano cao tốc du lịch">Tàu / Cano cao tốc du lịch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Dòng xe & Năm sản xuất
                  </label>
                  <input
                    type="text"
                    value={vehicleBrandModel}
                    onChange={(e) => setVehicleBrandModel(e.target.value)}
                    placeholder="VD: Hyundai Solati / DCar đời 2023 - 2024"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Số chỗ ngồi thực tế
                  </label>
                  <select
                    value={seats}
                    onChange={(e) => setSeats(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl"
                  >
                    <option value="4">4 chỗ</option>
                    <option value="7">7 chỗ</option>
                    <option value="9">9 chỗ VIP</option>
                    <option value="16">16 chỗ</option>
                    <option value="29">29 chỗ</option>
                    <option value="35">35 chỗ</option>
                    <option value="45">45 chỗ</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Hình thức phục vụ tour
                  </label>
                  <input
                    type="text"
                    value={serviceServiceType}
                    onChange={(e) => setServiceServiceType(e.target.value)}
                    placeholder="VD: Thuê xe theo tour nhiều ngày, Đưa đón sân bay, Tuyến cố định..."
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Tiêu chuẩn tài xế & Cam kết
                  </label>
                  <input
                    type="text"
                    value={driverStandard}
                    onChange={(e) => setDriverStandard(e.target.value)}
                    placeholder="VD: Tài xế kinh nghiệm > 5 năm, nhiệt tình, lịch sự"
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Transportation Facilities */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Tiện ích trên phương tiện
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {[
                    "Ghế da cao cấp có ngả lưng & massage",
                    "Wifi 4G tốc độ cao miễn phí",
                    "Cổng sạc điện thoại USB tại từng vị trí ngồi",
                    "Nước suối đóng chai & khăn lạnh",
                    "Màn hình TV giải trí & Loa nghe nhạc",
                    "Micro chuyên dụng cho Hướng dẫn viên",
                    "Cốp hành lý rộng rãi",
                    "Bảo hiểm hành khách đầy đủ",
                  ].map((facility) => {
                    const checked = transportFacilities.includes(facility);
                    return (
                      <button
                        key={facility}
                        type="button"
                        onClick={() => toggleArrayItem(transportFacilities, setTransportFacilities, facility)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium text-left border flex items-center justify-between transition-all ${
                          checked
                            ? "bg-cyan-600 text-white border-cyan-600 shadow-xs"
                            : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                        }`}
                      >
                        <span className="truncate">{facility}</span>
                        {checked && <Check className="w-3.5 h-3.5 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* Step 3: PRICE RANGE                                                */}
          {/* =================================================================== */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                  3
                </span>
                {category === "hotel"
                  ? "Khoảng giá dự kiến tính theo phòng (VNĐ / Phòng)"
                  : "Khoảng giá dự kiến tính trên đầu người (VNĐ / Người)"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {category === "hotel"
                  ? "Các công ty du lịch sẽ dựa vào khoảng giá từ - đến tính theo phòng/đêm này để ước tính chi phí khi thiết kế tour"
                  : "Các công ty du lịch sẽ dựa vào khoảng giá từ - đến trên đầu người này để ước tính chi phí khi thiết kế tour"}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-blue-900 mb-1">
                    Giá từ ({category === "hotel" ? "Mức tối thiểu / phòng" : "Mức tối thiểu / người"}) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={priceFrom}
                      onChange={(e) => setPriceFrom(e.target.value)}
                      placeholder="VD: 600000"
                      className="w-full pl-3 pr-20 py-2.5 text-base font-bold border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-blue-900"
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-600 font-bold">
                      VNĐ / {category === "hotel" ? "phòng" : "người"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-blue-900 mb-1">
                    Giá đến ({category === "hotel" ? "Mức tối đa / phòng" : "Mức tối đa / người"})
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={priceTo}
                      onChange={(e) => setPriceTo(e.target.value)}
                      placeholder="VD: 950000"
                      className="w-full pl-3 pr-20 py-2.5 text-base font-bold border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-blue-900"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-600 font-bold">
                      VNĐ / {category === "hotel" ? "phòng" : "người"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-blue-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <span className="text-xs text-gray-600">
                  Hiển thị niêm yết cho các công ty lữ hành:
                </span>
                <span className="text-base font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                  {formatPriceRangeDisplay()}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Mô tả chi tiết bài đăng & Các lưu ý quan trọng cho tour
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Giới thiệu điểm nổi bật, chính sách hoàn hủy, các ưu đãi đi kèm..."
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* =================================================================== */}
          {/* Step 4: PHOTO GALLERY & SET THUMBNAIL                               */}
          {/* =================================================================== */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                    4
                  </span>
                  Bộ sưu tập hình ảnh & Chọn ảnh đại diện (Thumbnail)
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Đăng tải nhiều góc chụp thực tế và bấm nút ngôi sao để chọn ảnh làm bìa (Cover Thumbnail)
                </p>
              </div>
              <span className="text-xs font-semibold text-gray-600">
                {images.length} hình ảnh
              </span>
            </div>

            {/* Add Image Input */}
            <div className="flex gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddImage())}
                placeholder="Dán đường dẫn ảnh (URL) và bấm Thêm ảnh..."
                className="flex-1 px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <Button
                type="button"
                onClick={handleAddImage}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
              >
                <Plus className="w-4 h-4 mr-1" />
                Thêm ảnh
              </Button>
            </div>

            {/* Images Grid with Thumbnail Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
              {images.map((img, idx) => {
                const isThumbnail = thumbnailIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all group h-40 bg-gray-100 ${
                      isThumbnail
                        ? "border-blue-600 ring-2 ring-blue-600/30 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Ảnh ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Thumbnail Badge */}
                    {isThumbnail && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                        <Star className="w-3 h-3 fill-white" />
                        Ảnh bìa (Thumbnail)
                      </div>
                    )}

                    {/* Action overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                      {!isThumbnail && (
                        <button
                          type="button"
                          onClick={() => setThumbnailIndex(idx)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-md flex items-center gap-1"
                        >
                          <Star className="w-3.5 h-3.5" />
                          Đặt làm Thumbnail
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 flex items-center gap-1 shadow-md"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Xóa ảnh
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* =================================================================== */}
          {/* Step 5: ADDRESS & GOOGLE MAPS GPS                                  */}
          {/* =================================================================== */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                  5
                </span>
                Địa chỉ
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Cung cấp địa chỉ chính xác và vị trí bản đồ để các đối tác và du khách dễ dàng tìm đến
              </p>
            </div>

            {/* 2-level address: Province & Ward */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Tỉnh / Thành phố *
                </label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                >
                  {allVietnamProvinces.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Phường / Xã *
                </label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                >
                  {getWardsForProvince(province).map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Số nhà, Tên đường / Khu vực cụ thể
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Ví dụ: 02 Trần Phú, Đèo Prenn, Bãi Dài..."
                  className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Google Map Location Picker */}
            <GoogleMapLocationPicker
              latitude={latitude}
              longitude={longitude}
              onChange={(lat, lng) => {
                setLatitude(lat);
                setLongitude(lng);
              }}
              addressLabel={[street, ward, province].filter(Boolean).join(", ")}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="rounded-xl border-gray-300"
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setViewMode("preview")}
              className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <Eye className="w-4 h-4 mr-1.5" />
              Mô phỏng bài đăng
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md font-semibold px-6"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              {isEditing ? "Cập nhật bài đăng" : "Gửi duyệt bài đăng"}
            </Button>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* MODE 2: LIVE PREVIEW MODE                                 */}
      {/* ========================================================= */}
      {viewMode === "preview" && (
        <div className="space-y-6">
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-md">
            <div>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-200" />
                <h3 className="font-bold text-sm">
                  Chế độ mô phỏng trực tiếp (Live Preview)
                </h3>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Đây là giao diện bài đăng của bạn sẽ hiển thị với các công ty du lịch khi tìm kiếm và thiết kế tour.
              </p>
            </div>
            <Button
              onClick={() => setViewMode("form")}
              size="sm"
              className="bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-xl"
            >
              <Edit3 className="w-4 h-4 mr-1" />
              Quay lại chỉnh sửa
            </Button>
          </div>

          {/* Preview Detail View */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Photo Showcase */}
              <div className="lg:col-span-7 space-y-2">
                <div className="h-80 w-full rounded-2xl overflow-hidden bg-gray-100 relative border border-gray-200">
                  <img
                    src={images[thumbnailIndex] || images[0]}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-blue-600/90 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    <ActiveIcon className="w-4 h-4" />
                    {activeCategoryMeta.label}
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/75 backdrop-blur-xs text-white px-3 py-1 rounded-lg text-xs flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Ảnh bìa (Thumbnail chính)
                  </div>
                </div>

                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`w-20 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 relative ${
                          thumbnailIndex === idx ? "border-blue-600 ring-2 ring-blue-600/20" : "border-gray-200"
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        {thumbnailIndex === idx && (
                          <div className="absolute top-1 left-1 bg-blue-600 text-white p-0.5 rounded-full">
                            <Star className="w-2.5 h-2.5 fill-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Info Box */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Sẵn sàng liên kết tour
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 leading-snug">
                    {name || "Tên dịch vụ chưa đặt"}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Cung cấp bởi: <strong>{currentUser.businessName || currentUser.name}</strong>
                  </p>

                  <div className="flex items-start gap-1.5 mt-3 text-xs text-gray-600">
                    <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{[street, ward, province].filter(Boolean).join(", ")}</span>
                  </div>

                  {/* Price Banner */}
                  <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-blue-50/70 to-indigo-50/70 border border-blue-100 space-y-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {category === "hotel"
                        ? "Khoảng giá ước lượng tính theo phòng"
                        : "Khoảng giá ước lượng trên đầu người"}
                    </span>
                    <div className="text-2xl font-extrabold text-blue-700">
                      {formatPriceRangeDisplay()}
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Mức giá giúp các đơn vị lữ hành thiết kế giá tour trọn gói chuẩn xác.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1 text-gray-600">
                  <div className="flex justify-between">
                    <span>Tọa độ Google Maps:</span>
                    <strong className="font-mono text-gray-900">{latitude.toFixed(4)}, {longitude.toFixed(4)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Khu vực:</span>
                    <strong className="text-gray-900">{ward}, {province}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Description & Category Details Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-xs">
              <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-600" />
                  Mô tả dịch vụ
                </h4>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {description || "Chưa có mô tả chi tiết."}
                </p>
              </div>

              <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-100 space-y-2">
                <h4 className="font-bold text-blue-900 text-sm flex items-center gap-1.5">
                  <ActiveIcon className="w-4 h-4 text-blue-600" />
                  Thông số chi tiết [{activeCategoryMeta.label}]
                </h4>
                <div className="space-y-1.5 text-gray-700">
                  {category === "hotel" && (
                    <>
                      <div>• Tên cơ sở: <strong>{name}</strong></div>
                      <div>• Loại hình: <strong>{hotelType}</strong> - Hạng sao: <strong>{stars === "0" ? "Tiêu chuẩn du lịch" : `${stars} Sao ⭐`}</strong></div>
                      <div>• Tổng số phòng: <strong>{totalRooms} phòng</strong></div>
                      <div>• Chính sách đi kèm: <strong>{policies}</strong></div>
                      <div>• Tiện nghi phòng: <strong>{hotelAmenities.join(", ")}</strong></div>
                    </>
                  )}
                  {category === "fnb" && (
                    <>
                      <div>• Mô hình: <strong>{fnbModel}</strong> - Phong cách: <strong>{cuisineStyle}</strong></div>
                      <div>• Giờ mở cửa: <strong>{openingHours}</strong> - Sức chứa đoàn: <strong>{fnbCapacity} khách</strong></div>
                      <div>• Thực đơn nổi bật: <strong>{fnbMenuHighlight}</strong></div>
                      <div>• Tiện ích đoàn: <strong>{fnbTourFacilities.join(", ")}</strong></div>
                    </>
                  )}
                  {category === "attraction" && (
                    <>
                      <div>• Phân loại: <strong>{attractionType}</strong></div>
                      <div>• Giờ đón khách: <strong>{attractionHours}</strong></div>
                      <div>• Vé bao gồm: <strong>{ticketIncludes}</strong></div>
                      <div>• Chính sách trẻ em: <strong>{childTicketPolicy}</strong></div>
                    </>
                  )}
                  {category === "activity" && (
                    <>
                      <div>• Thể loại: <strong>{activityType}</strong> - Thời lượng: <strong>{duration}</strong></div>
                      <div>• Độ khó: <strong>{difficultyLevel}</strong> - Độ tuổi: <strong>{ageRestriction}</strong></div>
                      <div>• Bảo hộ an toàn: <strong>{safetyGear}</strong></div>
                      <div>• Khởi hành: <strong>{departureSlots}</strong></div>
                    </>
                  )}
                  {category === "transportation" && (
                    <>
                      <div>• Loại xe: <strong>{vehicleType}</strong> ({seats} chỗ ngồi)</div>
                      <div>• Dòng xe: <strong>{vehicleBrandModel}</strong></div>
                      <div>• Hình thức phục vụ: <strong>{serviceServiceType}</strong></div>
                      <div>• Tiện ích xe: <strong>{transportFacilities.join(", ")}</strong></div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Submit Button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setViewMode("form")}
                className="rounded-xl"
              >
                <Edit3 className="w-4 h-4 mr-1.5" />
                Quay lại sửa thông tin
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md font-semibold"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Xác nhận & Gửi duyệt bài đăng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
