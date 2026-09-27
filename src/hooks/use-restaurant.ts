import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { restaurant } from "@/lib/zayqa-data";
import { getRestaurantSettings } from "@/lib/restaurant.functions";

export const RESTAURANT_SETTINGS_KEY = ["restaurant-settings"] as const;

// Starts from the built-in details so server and first client render match, then applies saved settings.
export function useRestaurant() {
  const fetchSettings = useServerFn(getRestaurantSettings);
  const { data } = useQuery({ queryKey: RESTAURANT_SETTINGS_KEY, queryFn: () => fetchSettings(), staleTime: 5 * 60_000 });
  if (!data) return restaurant;
  return {
    ...restaurant,
    name: data.name,
    tagline: data.tagline,
    phrase: data.secondary_phrase,
    phone: data.phone,
    email: data.email,
    address: data.address,
    hours: data.hours,
  };
}
