import { useState, type FormEvent } from "react";
import { format, startOfDay } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Compass,
  MapPin,
  Route,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import type { Tour } from "@/app/types";
import { Button, buttonVariants } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Calendar } from "@/app/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { HomeTourCard } from "@/app/components/customer/HomeTourCard";
import {
  heroImage,
  homeDestinations,
} from "@/app/components/customer/homepage-media";
import type { TourSearchCriteria } from "@/app/components/customer/tour-search";
import "@/styles/customer-home.css";

interface HomePageProps {
  onShowLogin: () => void;
  popularTours: Tour[];
  onNavigate?: (page: string) => void;
  onViewTour?: (tour: Tour) => void;
  onBookTour?: (tour: Tour) => void;
  onOpenAIAdvisor?: () => void;
  onSearchTours?: (criteria: TourSearchCriteria) => void;
}

export function HomePage({
  popularTours,
  onNavigate,
  onViewTour,
  onBookTour,
  onOpenAIAdvisor,
  onSearchTours,
}: HomePageProps) {
  const [destination, setDestination] = useState("");
  const [departure, setDeparture] = useState<Date>();
  const [guests, setGuests] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const today = startOfDay(new Date());
  const publicTours = popularTours.filter(
    (tour) =>
      tour.tourType !== "custom_request" &&
      tour.visibility !== "hidden" &&
      (tour.status === "published" ||
        tour.status === "completed" ||
        !tour.status),
  );
  const featuredTours = publicTours.slice(0, 6);
  const destinations = homeDestinations.filter((place) =>
    publicTours.some((tour) => tour.destination === place.name),
  );
  const quickDestinations = Array.from(
    new Set(publicTours.map((tour) => tour.destination)),
  ).slice(0, 5);

  function search(place = destination) {
    const criteria = {
      destination: place.trim(),
      departureDate: departure ? format(departure, "yyyy-MM-dd") : "",
      guests,
    };
    if (onSearchTours) onSearchTours(criteria);
    else onNavigate?.("book-tours");
  }
  function submitSearch(event: FormEvent) {
    event.preventDefault();
    search();
  }

  return (
    <div className="trip-home">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-container home-hero-grid">
          <div className="home-hero-copy">
            <p className="home-eyebrow">
              <span />
              HÀNH TRÌNH VIỆT NAM, THEO CÁCH CỦA BẠN
            </p>
            <h1 id="home-title">
              Đi xa một chút,
              <br />
              <span>gần nhau hơn.</span>
            </h1>
            <p className="home-hero-description">
              Tìm một chuyến đi đáng nhớ cho gia đình, nhóm bạn hay cả công ty.
              Phần hành trình, để TripOps cùng bạn chuẩn bị.
            </p>
            <div className="home-hero-actions">
              <Button
                onClick={() => onNavigate?.("book-tours")}
                className="home-primary-button"
              >
                Khám phá tour
                <ArrowUpRight aria-hidden="true" />
              </Button>
              <a href="#home-destinations" className="home-text-link">
                Tìm cảm hứng
                <ArrowDown aria-hidden="true" />
              </a>
            </div>
            <div className="home-hero-note">
              <Users aria-hidden="true" />
              <span>Một hành trình. Cả đoàn cùng trải nghiệm.</span>
            </div>
          </div>
          <figure className="home-hero-photo">
            <img
              src={heroImage}
              alt="Núi đá vôi, đồng lúa và dòng sông ở Ninh Bình"
              loading="eager"
              decoding="async"
              width="1800"
              height="1013"
            />
            <figcaption>
              <MapPin aria-hidden="true" />
              <span>
                Ninh Bình, Việt Nam<small>Đi để thấy những điều mới</small>
              </span>
            </figcaption>
            <span className="home-image-index" aria-hidden="true">
              VIỆT NAM / 01
            </span>
          </figure>
        </div>
      </section>

      <div className="home-container home-search-wrap">
        <form
          className="home-search"
          onSubmit={submitSearch}
          aria-label="Tìm tour cho đoàn"
        >
          <div className="home-search-field">
            <label htmlFor="home-destination">
              <MapPin aria-hidden="true" />
              Bạn muốn đi đâu?
            </label>
            <Input
              id="home-destination"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              placeholder="Điểm đến hoặc tên tour"
              className="home-search-input"
              autoComplete="off"
              list="home-destination-suggestions"
            />
            <datalist id="home-destination-suggestions">
              {quickDestinations.map((place) => (
                <option key={place} value={place} />
              ))}
            </datalist>
          </div>
          <div className="home-search-field home-search-date">
            <label htmlFor="home-departure">
              <CalendarDays aria-hidden="true" />
              Ngày đi dự kiến
            </label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger
                id="home-departure"
                className={`${buttonVariants({ variant: "ghost" })} home-date-trigger`}
              >
                <span className={departure ? "" : "home-placeholder"}>
                  {departure
                    ? format(departure, "dd/MM/yyyy")
                    : "Chọn ngày khởi hành"}
                </span>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                aria-label="Chọn ngày khởi hành"
                className="home-calendar-popover w-auto p-0"
                collisionPadding={16}
              >
                <Calendar
                  locale={vi}
                  labels={{
                    labelPrevious: () => "Tháng trước",
                    labelNext: () => "Tháng sau",
                  }}
                  mode="single"
                  selected={departure}
                  onSelect={(date) => {
                    setDeparture(date);
                    setCalendarOpen(false);
                  }}
                  disabled={{ before: today }}
                  fromDate={today}
                  defaultMonth={departure || today}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {departure && (
              <button
                type="button"
                className="home-clear-date"
                aria-label="Xóa ngày đi"
                onClick={() => setDeparture(undefined)}
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="home-search-field">
            <label htmlFor="home-guests">
              <Users aria-hidden="true" />
              Đoàn có bao nhiêu người?
            </label>
            <Input
              id="home-guests"
              type="number"
              min="1"
              step="1"
              value={guests}
              onChange={(event) => setGuests(event.target.value)}
              placeholder="Số khách"
              className="home-search-input"
            />
          </div>
          <Button
            type="submit"
            className="home-primary-button home-search-submit"
          >
            <Search aria-hidden="true" />
            Tìm tour
          </Button>
        </form>
        <div className="home-quick-search">
          <span>Gợi ý cho bạn:</span>
          {quickDestinations.map((place) => (
            <button key={place} onClick={() => search(place)}>
              {place}
              <ArrowUpRight aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      {destinations.length > 0 && (
        <section
          id="home-destinations"
          className="home-container home-section"
          aria-labelledby="destinations-title"
        >
          <div className="home-section-heading">
            <div>
              <p className="home-eyebrow">BẮT ĐẦU TỪ MỘT ĐIỂM ĐẾN</p>
              <h2 id="destinations-title">Lần này, mình đi đâu?</h2>
            </div>
            <p className="home-section-intro">
              Một chút núi rừng, một chút biển xanh.
              <br />
              Chọn nơi cả đoàn muốn cùng nhau khám phá.
            </p>
          </div>
          <div className="home-destinations">
            {destinations.map((place, index) => (
              <button
                key={place.name}
                onClick={() => search(place.name)}
                className={`home-destination home-destination-${index}`}
                aria-label={`Khám phá tour ${place.name}`}
              >
                <div className="home-destination-photo">
                  <img
                    src={place.image}
                    alt={`Phong cảnh ${place.name}`}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="home-destination-region">
                    {place.region}
                  </span>
                </div>
                <span className="home-destination-caption">
                  <span>
                    <strong>{place.name}</strong>
                    <small>{place.description}</small>
                  </span>
                  <ArrowUpRight aria-hidden="true" />
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section
        className="home-featured-section"
        aria-labelledby="featured-title"
      >
        <div className="home-container">
          <div className="home-section-heading">
            <div>
              <p className="home-eyebrow">CHỌN MỘT CHUYẾN ĐI</p>
              <h2 id="featured-title">Những hành trình chờ bạn</h2>
              <p className="home-section-description">
                Lịch trình có sẵn, dễ lựa chọn cho cả đoàn.
              </p>
            </div>
            <Button
              variant="ghost"
              className="home-view-all"
              onClick={() => onNavigate?.("book-tours")}
            >
              Xem tất cả tour
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
          {featuredTours.length ? (
            <div className="home-tour-grid">
              {featuredTours.map((tour) => (
                <HomeTourCard
                  key={tour.id}
                  tour={tour}
                  onView={(selected) => onViewTour?.(selected)}
                  onBook={onBookTour}
                />
              ))}
            </div>
          ) : (
            <div className="home-empty">
              <Compass aria-hidden="true" />
              <h3>Hành trình mới đang được chuẩn bị</h3>
              <p>
                Bạn có thể gửi nhu cầu để nhận một phương án riêng cho đoàn.
              </p>
              <Button onClick={() => onNavigate?.("custom-tour")}>
                Gửi yêu cầu thiết kế
                <ArrowRight aria-hidden="true" />
              </Button>
            </div>
          )}
        </div>
      </section>

      <section
        className="home-container home-custom-section"
        aria-labelledby="custom-title"
      >
        <div className="home-custom-photo">
          <img
            src={`${import.meta.env.BASE_URL}images/destinations/da-lat.webp`}
            alt="Hồ và rừng thông Đà Lạt"
            loading="lazy"
            decoding="async"
          />
          <span>
            <Route aria-hidden="true" />
            Hành trình riêng của đoàn bạn
          </span>
        </div>
        <div className="home-custom-copy">
          <p className="home-eyebrow">KHÔNG CẦN THEO MỘT KHUÔN MẪU</p>
          <h2 id="custom-title">
            Đoàn bạn có ý tưởng.
            <br />
            Mình cùng lên hành trình.
          </h2>
          <p>
            Ngày đi linh hoạt, điểm đến yêu thích, ngân sách phù hợp. Gửi nhu
            cầu của đoàn để công ty du lịch đề xuất lịch trình và báo giá riêng.
          </p>
          <ul>
            <li>
              <Check aria-hidden="true" />
              Chọn thời gian và điểm đến
            </li>
            <li>
              <Check aria-hidden="true" />
              Trao đổi phương án trước khi chốt
            </li>
          </ul>
          <Button
            className="home-primary-button"
            onClick={() => onNavigate?.("custom-tour")}
          >
            Thiết kế chuyến đi của bạn
            <ArrowUpRight aria-hidden="true" />
          </Button>
        </div>
      </section>

      {onOpenAIAdvisor && (
        <section
          className="home-container home-ai-section"
          aria-labelledby="ai-title"
        >
          <div className="home-ai-icon">
            <Sparkles aria-hidden="true" />
          </div>
          <div>
            <h2 id="ai-title">Chưa biết chọn hành trình nào?</h2>
            <p>Chia sẻ sở thích và ngân sách, để AI gợi ý tour phù hợp.</p>
          </div>
          <Button
            variant="outline"
            onClick={onOpenAIAdvisor}
            className="home-ai-button"
          >
            Tìm tour cùng AI
            <ArrowRight aria-hidden="true" />
          </Button>
        </section>
      )}

      <section
        className="home-container home-how-section"
        id="home-how-it-works"
        aria-labelledby="how-title"
      >
        <div className="home-section-heading">
          <div>
            <p className="home-eyebrow">ĐƠN GIẢN TỪ BƯỚC ĐẦU</p>
            <h2 id="how-title">Từ ý tưởng đến chuyến đi</h2>
          </div>
        </div>
        <ol className="home-steps">
          {[
            {
              icon: Search,
              title: "Tìm hành trình bạn thích",
              text: "Khám phá tour có sẵn hoặc gửi nhu cầu riêng của đoàn.",
            },
            {
              icon: SlidersHorizontal,
              title: "Thống nhất cùng công ty du lịch",
              text: "Trao đổi lịch trình, lựa chọn dịch vụ và xác nhận giá.",
            },
            {
              icon: Compass,
              title: "Sẵn sàng lên đường",
              text: "Thanh toán theo yêu cầu và theo dõi chuyến đi trong booking.",
            },
          ].map((step, index) => (
            <li key={step.title}>
              <div className="home-step-top">
                <step.icon aria-hidden="true" />
                <span>0{index + 1}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
