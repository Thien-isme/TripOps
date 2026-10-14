export type UserRole = "user" | "guide" | "admin" | "provider" | "company_admin";

export type ProviderType =
  | "accommodation" // Dịch vụ lưu trú
  | "guide" // Cung cấp hướng dẫn viên
  | "fnb" // Dịch vụ ăn uống (Food & Beverage)
  | "attraction" // Điểm tham quan và giải trí
  | "adventure" // Hoạt động trải nghiệm
  | "support"; // Dịch vụ hỗ trợ

export interface TourCompany {
  id: string;
  name: string;
  description: string;
  logo?: string;
  coverImage?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  taxCode: string;
  licenseNumber?: string; // Số giấy phép kinh doanh lữ hành
  status: "pending" | "approved" | "rejected" | "suspended";
  rejectionReason?: string;
  adminId: string; // ID of the company_admin user
  createdAt: string;
  rating?: number;
  totalTours?: number;
  totalBookings?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  // Company admin / guide specific fields
  companyId?: string; // Belongs to which tour company
  companyName?: string;
  // Provider specific fields
  providerType?: ProviderType;
  businessName?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  taxCode?: string;
  accountStatus?: "pending" | "approved" | "rejected";
  rejectionReason?: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  time?: string;
  checkedIn?: boolean;
  checkInTime?: string;
  checkInImage?: string;
  checkInNote?: string;
}

export interface TourAlternativeMeal {
  id: string;
  restaurantName: string;
  priceDifference: number; // e.g. +50000, +180000, -30000
  description?: string;
  address?: string;
}

export interface TourMeal {
  id?: string;
  type: "breakfast" | "lunch" | "dinner";
  serviceId?: string;
  serviceName?: string;
  description?: string;
  pricePerPerson?: number;
  allowCustomMealRequest?: boolean; // Cho phép khách tự đề xuất nhà hàng ngoài danh sách
  alternativeMeals?: TourAlternativeMeal[]; // Danh sách nhà hàng đổi món/nâng cấp cho khách chọn
}

export interface TourAlternativeHotel {
  id: string;
  name: string;
  priceDifference: number; // e.g. +400000 or -350000
  description?: string;
  address?: string;
}

export interface TourHotel {
  id?: string;
  serviceId?: string;
  name: string;
  destination?: string; // e.g. "Đà Lạt", "Nha Trang"
  nights?: number; // e.g. 2
  stars?: number;
  pricePerNight: number;
  description?: string;
  address?: string;
  image?: string;
  allowCustomHotelRequest?: boolean; // Cho phép khách tự đề xuất khách sạn ngoài danh sách
  alternativeHotels?: TourAlternativeHotel[]; // Danh sách khách sạn nâng cấp/đổi hạng cho khách hàng chọn kèm giá chênh lệch
}

export interface DailyItinerary {
  id: string;
  day: number;
  date: string;
  title: string;
  description: string;
  locations: Location[];
  destinationCity?: string; // e.g. "Đà Lạt", "Nha Trang" — for multi-destination tours
  // Hotel & meals for this day (set by company)
  hotel?: TourHotel;
  meals?: TourMeal[];
}

export interface TourDepartureDate {
  date: string;
  price: number;
  label?: string;
  seatsAvailable?: number;
}

export interface TourPriceRow {
  ageGroup: "adult" | "child_2_11" | "child_under_2" | string;
  ageGroupLabel: string; // e.g. "Người lớn"
  ageRange?: string; // e.g. "Từ 12 tuổi"
  hotelType?: string;
  price: number;
}

export interface BookingPassenger {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: "male" | "female";
  ageGroup: "adult" | "child_2_11" | "child_under_2";
  price: number;
}

export interface CustomLocationChange {
  dayId: string;
  dayNumber: number;
  originalLocations: string[];
  requestedLocations: string;
  note?: string;
}

export interface CustomHotelChange {
  destination: string;
  originalHotelName?: string;
  originalPricePerNight?: number;
  newHotelName: string;
  mode: "system" | "custom";
  newPricePerNight?: number;
  stars?: number;
  address?: string;
  note?: string;
}

export interface CustomMealChange {
  dayNumber: number;
  mealType: "lunch" | "dinner";
  originalMealName?: string;
  newMealName: string;
  mode: "system" | "custom";
  pricePerPerson?: number;
}

export interface PaymentRequest {
  id: string;
  bookingId: string;
  amount: number;
  description: string;
  dueDate: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  createdAt: string;
  paidAt?: string;
}

export interface TourContract {
  id: string;
  bookingId: string;
  contractNumber: string;
  createdAt: string;
  signedByCustomer?: boolean;
}

export interface TourReview {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  tourDate?: string;
}

export interface Tour {
  id: string;
  tourCode: string;
  name: string;
  destination: string;
  duration: string;
  numberOfDays?: number;
  numberOfNights?: number;
  price: number;
  description: string;
  image: string;
  images?: string[];
  rating: number;
  minGuests: number;
  maxGuests: number;
  highlights: string[];
  hotels?: TourHotel[]; // List of hotels for this tour
  itinerary: DailyItinerary[];
  // Operation period (replaces departure dates for group bookings)
  operationPeriod?: string; // e.g. "Tháng 1 – Tháng 6 hàng năm"
  departureCity?: string; // e.g. "TP. Hồ Chí Minh"
  departureDates?: TourDepartureDate[];
  priceTable?: TourPriceRow[];
  // Regulations
  inclusions?: string[];
  exclusions?: string[];
  regulations?: string[];
  companyNote?: string;
  // Reviews
  reviews?: TourReview[];
  // Company info
  companyId?: string;
  companyName?: string;
  companyLogo?: string;
  // Creator info
  createdBy?: string;
  createdByName?: string;
  createdByEmail?: string;
  createdAt?: string;
  bookings?: number;
}

export interface Booking {
  id: string;
  tourId: string;
  tour: Tour;
  userId: string;
  userName: string;
  userEmail: string;
  numberOfGuests: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "rejected";
  bookingDate: string;
  tourStartDate: string;
  companyId?: string;
  companyName?: string;
  guideId?: string;
  guideName?: string;
  guideAvatar?: string;
  guidePhone?: string;
  // Payment
  paymentStatus?: "unpaid" | "deposit_paid" | "paid" | "refunded";
  depositAmount?: number;
  depositPaid?: boolean;
  remainingAmount?: number;
  paymentRequests?: PaymentRequest[];
  // Passenger list
  passengers?: BookingPassenger[];
  contactName?: string;
  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  bookingNotes?: string;
  // Customization
  hasLocationCustomization?: boolean;
  locationChanges?: CustomLocationChange[];
  customHotels?: Record<string, TourHotel>;
  customMeals?: Record<string, TourMeal[]>;
  customHotelChanges?: CustomHotelChange[];
  customMealChanges?: CustomMealChange[];
  // Contract
  contract?: TourContract;
  // Rejection / cancellation
  rejectionReason?: string;
  cancellationReason?: string;
  rejectedBy?: "admin" | "customer";
  rejectedGuideName?: string;
  rejectedGuideReason?: string;
  rejectedGuideAvatar?: string;
}

export interface GuideSchedule {
  id: string;
  booking: Booking;
  currentDay?: number;
  completedLocations: string[];
}

export interface Service {
  id: string;
  providerId: string;
  providerName: string;
  name: string;
  category:
    | "hotel"
    | "fnb"
    | "transportation"
    | "activity";
  subCategory?: string; // Sub-category cho FnB: "restaurant", "cafe"
  description: string;
  price: number;
  pricePerPerson?: number; // Giá cho một người
  location: string;
  // Địa chỉ chi tiết
  province?: string; // Tỉnh/Thành phố
  district?: string; // Quận/Huyện
  ward?: string; // Phường/Xã
  street?: string; // Số nhà, đường
  image: string;
  images?: string[]; // Nhiều ảnh cho bài đăng
  rating: number;
  capacity?: number;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string; // Lý do từ chối bài đăng
  createdAt: string;
  // Hotel specific fields
  stars?: number;
  amenities?: string[];
  checkInTime?: string;
  checkOutTime?: string;
  // FnB specific fields (Restaurant/Cafe)
  openingHours?: string;
  // Transportation specific fields
  vehicleType?: string;
  seats?: number;
  // Activity specific fields
  duration?: string;
  ageRestriction?: string;
}

// Room booking for accommodation providers
export interface RoomBooking {
  id: string;
  serviceId: string;
  serviceName: string;
  providerId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  numberOfRooms: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  bookingDate: string;
  specialRequests?: string;
  rejectionReason?: string;
}
export interface CustomTourRequest {
  id: string;
  userId?: string;
  // Business / contact info
  businessName?: string;
  businessEmail?: string;
  businessPhone?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  // Tour design
  destinations: string;
  departureDate: string;
  returnDate: string;
  numberOfPeople: string;
  budgetPerPerson?: string;
  hotelStars?: string;
  additionalInfo?: string;
  // Target company
  targetCompanyId: string;
  targetCompanyName: string;
  // Lifecycle
  status: "pending" | "reviewing" | "quoted" | "accepted" | "rejected" | "cancelled";
  createdAt: string;
  // Company response
  companyNote?: string;
  quotedPricePerPerson?: number;
  responseAt?: string;
}
