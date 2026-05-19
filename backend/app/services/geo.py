import math
from decimal import Decimal


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calcula la distancia en metros entre dos coordenadas GPS usando la fórmula de Haversine."""
    R = 6_371_000  # Radio de la Tierra en metros
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def is_within_radius(
    employee_lat: float,
    employee_lon: float,
    event_lat: float,
    event_lon: float,
    max_meters: float = 500.0,
) -> tuple[bool, float]:
    """Retorna (dentro_del_radio, distancia_en_metros)."""
    distance = haversine_distance(employee_lat, employee_lon, event_lat, event_lon)
    return distance <= max_meters, round(distance, 1)
