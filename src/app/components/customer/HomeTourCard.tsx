import { useState } from "react";
import {
  ArrowUpRight,
  Building2,
  Clock3,
  ImageOff,
  Star,
  Users,
} from "lucide-react";
import type { Tour } from "@/app/types";
import { Button } from "@/app/components/ui/button";
import { homeTourImage } from "./homepage-media";

interface HomeTourCardProps {
  tour: Tour;
  onView: (tour: Tour) => void;
  onBook?: (tour: Tour) => void;
}
export function HomeTourCard({ tour, onView, onBook }: HomeTourCardProps) {
  const [failedImage, setFailedImage] = useState("");
  const image = homeTourImage(tour);
  return (
    <article className="home-tour-card">
      <button
        className="home-tour-photo"
        onClick={() => onView(tour)}
        aria-label={`Xem tour ${tour.name}`}
      >
        {image && failedImage !== image ? (
          <img
            src={image}
            alt={`Cảnh quan ${tour.destination}`}
            loading="lazy"
            decoding="async"
            onError={() => setFailedImage(image)}
          />
        ) : (
          <span className="home-image-empty">
            <ImageOff aria-hidden="true" />
            Chưa có ảnh điểm đến
          </span>
        )}
        <span className="home-photo-label">{tour.destination}</span>
        <span className="home-photo-arrow">
          <ArrowUpRight aria-hidden="true" />
        </span>
      </button>
      <div className="home-tour-body">
        <div className="home-tour-agency">
          <span>
            <Building2 aria-hidden="true" />
            {tour.companyName || "Đơn vị tổ chức"}
          </span>
          {Number.isFinite(tour.rating) && tour.rating > 0 && (
            <span className="home-tour-rating">
              <Star aria-hidden="true" />
              {tour.rating.toFixed(1)}
            </span>
          )}
        </div>
        <h3>
          <button onClick={() => onView(tour)}>{tour.name}</button>
        </h3>
        <div className="home-tour-meta">
          <span>
            <Clock3 aria-hidden="true" />
            {tour.duration}
          </span>
          {tour.maxGuests > 0 && (
            <span>
              <Users aria-hidden="true" />
              {tour.minGuests > 0 ? `${tour.minGuests}–` : "Tối đa "}
              {tour.maxGuests} khách
            </span>
          )}
        </div>
        <div className="home-tour-bottom">
          <div>
            <span className="home-price-caption">Giá từ / khách</span>
            <p className="home-tour-price">
              {new Intl.NumberFormat("vi-VN").format(tour.price)} <span>đ</span>
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => (onBook ? onBook(tour) : onView(tour))}
            className="home-book-button"
          >
            {onBook ? "Đặt tour" : "Chi tiết"}
            <ArrowUpRight aria-hidden="true" />
          </Button>
        </div>
      </div>
    </article>
  );
}
