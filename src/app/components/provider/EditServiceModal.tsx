import { useState, useEffect } from "react";
import {
  X,
  Upload,
  Image as ImageIcon,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { Service, ProviderType } from "@/app/types";

interface EditServiceModalProps {
  service: Service;
  currentProvider: {
    id: string;
    name: string;
    providerType?: ProviderType;
  };
  handleUpdateService: (
    serviceId: string,
    serviceData: Omit<Service, "id">,
  ) => void;
  onClose: () => void;
}

// Danh sách tỉnh/thành phố Việt Nam
const vietnamProvinces = [
  "Hà Nội",
  "Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "An Giang",
  "Bà Rịa - Vũng Tàu",
  "Bắc Giang",
  "Bắc Kạn",
  "Bạc Liêu",
  "Bắc Ninh",
  "Bến Tre",
  "Bình Định",
  "Bình Dương",
  "Bình Phước",
  "Bình Thuận",
  "Cà Mau",
  "Cao Bằng",
  "Đắk Lắk",
  "Đắk Nông",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Giang",
  "Hà Nam",
  "Hà Tĩnh",
  "Hải Dương",
  "Hậu Giang",
  "Hòa Bình",
  "Hưng Yên",
  "Khánh Hòa",
  "Kiên Giang",
  "Kon Tum",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Long An",
  "Nam Định",
  "Nghệ An",
  "Ninh Bình",
  "Ninh Thuận",
  "Phú Thọ",
  "Phú Yên",
  "Quảng Bình",
  "Quảng Nam",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sóc Trăng",
  "Sơn La",
  "Tây Ninh",
  "Thái Bình",
  "Thái Nguyên",
  "Thanh Hóa",
  "Thừa Thiên Huế",
  "Tiền Giang",
  "Trà Vinh",
  "Tuyên Quang",
  "Vĩnh Long",
  "Vĩnh Phúc",
  "Yên Bái",
];

export function EditServiceModal({
  service,
  currentProvider,
  handleUpdateService,
  onClose,
}: EditServiceModalProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  // Common fields
  const [name, setName] = useState(service.name);
  const [description, setDescription] = useState(
    service.description,
  );
  const [price, setPrice] = useState(service.price.toString());
  const [pricePerPerson, setPricePerPerson] = useState(
    service.pricePerPerson?.toString() || "",
  );
  const [capacity, setCapacity] = useState(
    service.capacity?.toString() || "",
  );

  // Địa chỉ chi tiết
  const [province, setProvince] = useState(
    service.province || "",
  );
  const [district, setDistrict] = useState(
    service.district || "",
  );
  const [ward, setWard] = useState(service.ward || "");
  const [street, setStreet] = useState(service.street || "");

  // Hotel fields
  const [stars, setStars] = useState(
    service.stars?.toString() || "3",
  );
  const [amenities, setAmenities] = useState<string[]>(
    service.amenities || [],
  );
  const [checkInTime, setCheckInTime] = useState(
    service.checkInTime || "14:00",
  );
  const [checkOutTime, setCheckOutTime] = useState(
    service.checkOutTime || "12:00",
  );
  const [amenityInput, setAmenityInput] = useState("");

  // Restaurant/Eatery fields
  const [subCategory, setSubCategory] = useState(
    service.subCategory || "",
  );
  const [openingHours, setOpeningHours] = useState(
    service.openingHours || "",
  );

  // Transportation fields
  const [vehicleType, setVehicleType] = useState(
    service.vehicleType || "",
  );
  const [seats, setSeats] = useState(
    service.seats?.toString() || "",
  );

  // Activity fields
  const [duration, setDuration] = useState(
    service.duration || "",
  );
  const [ageRestriction, setAgeRestriction] = useState(
    service.ageRestriction || "",
  );

  const handleAddAmenity = () => {
    if (amenityInput.trim()) {
      // Split by comma and add all amenities
      const newAmenities = amenityInput
        .split(",")
        .map(a => a.trim())
        .filter(a => a && !amenities.includes(a));
      
      if (newAmenities.length > 0) {
        setAmenities([...amenities, ...newAmenities]);
        setAmenityInput("");
      }
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    setAmenities(amenities.filter((a) => a !== amenity));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Tạo location string từ các phần địa chỉ
    const locationParts = [
      street,
      ward,
      district,
      province,
    ].filter(Boolean);
    const fullLocation = locationParts.join(", ");

    const baseService = {
      providerId: currentProvider.id,
      providerName: currentProvider.name,
      name,
      category: service.category,
      description,
      price: parseFloat(price),
      pricePerPerson: pricePerPerson
        ? parseFloat(pricePerPerson)
        : undefined,
      location: fullLocation,
      province,
      district,
      ward,
      street,
      image: service.image,
      rating: service.rating,
      capacity: capacity ? parseInt(capacity) : undefined,
      status: "pending" as const, // Sau khi sửa phải chờ kiểm duyệt lại
      createdAt: service.createdAt,
    };

    let serviceData: Omit<Service, "id">;

    switch (service.category) {
      case "hotel":
        serviceData = {
          ...baseService,
          stars: parseInt(stars),
          amenities,
          checkInTime,
          checkOutTime,
        };
        break;
      case "fnb":
        serviceData = {
          ...baseService,
          subCategory,
          openingHours,
        };
        break;
      case "transportation":
        serviceData = {
          ...baseService,
          vehicleType,
          seats: parseInt(seats),
        };
        break;
      case "activity":
        serviceData = {
          ...baseService,
          duration,
          ageRestriction,
        };
        break;
      default:
        serviceData = baseService;
    }

    handleUpdateService(service.id, serviceData);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 2000);
  };

  const getCategoryLabel = (category: Service["category"]) => {
    const labels = {
      hotel: "Khách sạn",
      fnb: "Nhà hàng/Quán ăn",
      transportation: "Vận chuyển",
      activity: "Hoạt động",
    };
    return labels[category] || "";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl my-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Chỉnh sửa bài đăng
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Loại: {getCategoryLabel(service.category)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Common Fields */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Thông tin cơ bản
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tên dịch vụ *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder={`Nhập tên ${getCategoryLabel(service.category).toLowerCase()}`}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mô tả *
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) =>
                        setDescription(e.target.value)
                      }
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
                      rows={4}
                      placeholder="Mô tả chi tiết về dịch vụ của bạn"
                      required
                    />
                  </div>

                  {/* Giá cơ bản - Ẩn với restaurant/eatery/activity */}
                  {service.category !== "fnb" && service.category !== "activity" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {service.category === "hotel"
                          ? "Giá phòng/đêm (VNĐ) *"
                          : "Giá cơ bản (VNĐ) *"}
                      </label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        placeholder={
                          service.category === "hotel"
                            ? "Giá phòng cho 1 đêm"
                            : "0"
                        }
                        required
                        min="0"
                      />
                    </div>
                  )}

                  {service.category !== "hotel" && service.category !== "fnb" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {service.category === "activity"
                          ? "Giá TB/người (VNĐ)"
                          : "Giá/người (VNĐ)"}
                      </label>
                      <input
                        type="number"
                        value={pricePerPerson}
                        onChange={(e) =>
                          setPricePerPerson(e.target.value)
                        }
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        placeholder="Giá cho 1 người"
                        min="0"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Để trống nếu không áp dụng
                      </p>
                    </div>
                  )}

                  {/* Sức chứa - Ẩn với restaurant/eatery/activity */}
                  {service.category !== "fnb" && service.category !== "activity" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Sức chứa/Số lượng
                      </label>
                      <input
                        type="number"
                        value={capacity}
                        onChange={(e) =>
                          setCapacity(e.target.value)
                        }
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        placeholder="Số người tối đa"
                        min="0"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Địa chỉ chi tiết */}
              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-6 border-2 border-green-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Địa chỉ chi tiết
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tỉnh/Thành phố *
                    </label>
                    <select
                      value={province}
                      onChange={(e) =>
                        setProvince(e.target.value)
                      }
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      required
                    >
                      <option value="">
                        -- Chọn tỉnh/thành phố --
                      </option>
                      {vietnamProvinces.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Quận/Huyện *
                    </label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) =>
                        setDistrict(e.target.value)
                      }
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="Nhập quận/huyện"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phường/Xã *
                    </label>
                    <input
                      type="text"
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="Nhập phường/xã"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số nhà, Đường
                    </label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) =>
                        setStreet(e.target.value)
                      }
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="Số nhà, tên đường"
                    />
                  </div>
                </div>
              </div>

              {/* Hotel fields */}
              {service.category === "hotel" && (
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border-2 border-indigo-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Thông tin khách sạn
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Xếp hạng sao
                      </label>
                      <select
                        value={stars}
                        onChange={(e) =>
                          setStars(e.target.value)
                        }
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      >
                        <option value="1">1 sao</option>
                        <option value="2">2 sao</option>
                        <option value="3">3 sao</option>
                        <option value="4">4 sao</option>
                        <option value="5">5 sao</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Giờ check-in
                      </label>
                      <input
                        type="time"
                        value={checkInTime}
                        onChange={(e) =>
                          setCheckInTime(e.target.value)
                        }
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Giờ check-out
                      </label>
                      <input
                        type="time"
                        value={checkOutTime}
                        onChange={(e) =>
                          setCheckOutTime(e.target.value)
                        }
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tiện nghi
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={amenityInput}
                          onChange={(e) =>
                            setAmenityInput(e.target.value)
                          }
                          onKeyPress={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(),
                            handleAddAmenity())
                          }
                          className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                          placeholder="Nhập tiện nghi, cách nhau bởi dấu phẩy (VD: Wifi, Bể bơi, Gym, Spa)"
                        />
                        <button
                          type="button"
                          onClick={handleAddAmenity}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Thêm
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        💡 Mẹo: Nhập nhiều tiện nghi cách nhau bởi dấu phẩy, sau đó nhấn Thêm
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {amenities.map((amenity) => (
                          <span
                            key={amenity}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
                          >
                            {amenity}
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveAmenity(amenity)
                              }
                              className="hover:text-blue-900"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* FnB Specific Fields */}
              {service.category === "fnb" && (
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border-2 border-orange-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Thông tin ẩm thực
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Loại hình *
                      </label>
                      <select
                        value={subCategory}
                        onChange={(e) => setSubCategory(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        required
                      >
                        <option value="">-- Chọn loại hình --</option>
                        <option value="restaurant">Quán ăn</option>
                        <option value="cafe">Cà phê</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Giờ mở cửa
                      </label>
                      <input
                        type="text"
                        value={openingHours}
                        onChange={(e) =>
                          setOpeningHours(e.target.value)
                        }
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        placeholder="VD: 8:00 - 22:00"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Transportation Specific Fields */}
              {service.category === "transportation" && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Thông tin phương tiện
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Loại phương tiện
                      </label>
                      <select
                        value={vehicleType}
                        onChange={(e) =>
                          setVehicleType(e.target.value)
                        }
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">
                          -- Chọn loại --
                        </option>
                        <option value="car">Ô tô</option>
                        <option value="bus">Xe buýt</option>
                        <option value="van">Xe Van</option>
                        <option value="minibus">
                          Xe 16 chỗ
                        </option>
                        <option value="motorcycle">
                          Xe máy
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Số chỗ ngồi
                      </label>
                      <input
                        type="number"
                        value={seats}
                        onChange={(e) =>
                          setSeats(e.target.value)
                        }
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        placeholder="Số chỗ"
                        min="1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Specific Fields */}
              {service.category === "activity" && (
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 border-2 border-pink-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Thông tin hoạt động
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Thời gian
                      </label>
                      <input
                        type="text"
                        value={duration}
                        onChange={(e) =>
                          setDuration(e.target.value)
                        }
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        placeholder="VD: 2 giờ, Cả ngày"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Giới hạn độ tuổi
                      </label>
                      <input
                        type="text"
                        value={ageRestriction}
                        onChange={(e) =>
                          setAgeRestriction(e.target.value)
                        }
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                        placeholder="VD: 6+, 18+, Không giới hạn"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-6 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-semibold"
                >
                  Lưu thay đổi
                </button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                ⚠️ Lưu ý: Sau khi chỉnh sửa, bài đăng sẽ cần
                được admin kiểm duyệt lại
              </div>
            </form>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Cập nhật thành công!
              </h3>
              <p className="text-gray-600">
                Bài đăng đã được cập nhật và đang chờ admin kiểm
                duyệt.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}