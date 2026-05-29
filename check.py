import sys 
sys.path.insert(0, '/app') 
from app.routers.dashboard import get_dashboard_charts 
print('OK:', get_dashboard_charts.__code__.co_filename) 
