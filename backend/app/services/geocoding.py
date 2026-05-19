"""Geocodificación usando Nominatim (OpenStreetMap) - gratuito, sin API key."""
import httpx
from decimal import Decimal


async def geocode_address(address: str, city: str = "", state: str = "", zip_code: str = "") -> tuple[Decimal | None, Decimal | None]:
    """
    Convierte una dirección en coordenadas lat/lng.
    Retorna (latitude, longitude) o (None, None) si no se encuentra.
    """
    parts = [p for p in [address, city, state, zip_code, "USA"] if p]
    full_address = ", ".join(parts)

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                "https://nominatim.openstreetmap.org/search",
                params={
                    "q": full_address,
                    "format": "json",
                    "limit": 1,
                    "countrycodes": "us",
                },
                headers={"User-Agent": "EventStaffingPlatform/1.0"},
            )
            data = response.json()
            if data:
                lat = Decimal(str(data[0]["lat"])).quantize(Decimal("0.0000001"))
                lng = Decimal(str(data[0]["lon"])).quantize(Decimal("0.0000001"))
                return lat, lng
    except Exception as e:
        print(f"[GEOCODING] Error: {e}")

    return None, None
