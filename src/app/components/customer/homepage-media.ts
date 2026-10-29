import type { Tour } from "@/app/types";

const imageBase = `${import.meta.env.BASE_URL}images/destinations/`;
export const homeDestinations = [
  {
    name: "Sapa",
    image: `${imageBase}sapa.webp`,
    description: "Đi giữa những mùa vàng",
    region: "Miền Bắc",
  },
  {
    name: "Phú Quốc",
    image: `${imageBase}phu-quoc.webp`,
    description: "Hẹn nhau bên biển xanh",
    region: "Biển đảo",
  },
  {
    name: "Đà Lạt",
    image: `${imageBase}da-lat.webp`,
    description: "Một khoảng trời bình yên",
    region: "Tây Nguyên",
  },
  {
    name: "Đà Nẵng",
    image: `${imageBase}da-nang.webp`,
    description: "Từ phố biển đến Hội An",
    region: "Miền Trung",
  },
];
export const heroImage = `${imageBase}ninh-binh.webp`;
const destinationImages: Record<string, string> = {
  "Ninh Bình": heroImage,
  "Nha Trang": `${imageBase}nha-trang.webp`,
  ...Object.fromEntries(homeDestinations.map((d) => [d.name, d.image])),
};

// Replace only the unrelated stock placeholders in the demo, never an Agency's own photo.
export function homeTourImage(tour: Tour) {
  const placeholder =
    /photo-(1583417319070-4a69db38a482|1559827260-dc66d52bef19)/.test(
      tour.image || "",
    );
  return (
    ((!tour.image || placeholder) && destinationImages[tour.destination]) ||
    tour.image ||
    ""
  );
}
