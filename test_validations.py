#!/usr/bin/env python3
"""
Script de Testing Automatizado - Sesión 11
Valida todas las funcionalidades implementadas
"""

import requests
import json
from datetime import datetime, timedelta
from typing import Dict, Any

# Configuración
BASE_URL = "http://localhost:8000"
SUPERADMIN_EMAIL = "superadmin@platform.com"
SUPERADMIN_PASSWORD = "Admin1234!"
COMPANY_ID = 1

# Colores para output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

class TestRunner:
    def __init__(self):
        self.token = None
        self.company_id = COMPANY_ID
        self.test_results = []
        
    def log(self, message: str, level: str = "INFO"):
        """Log con colores"""
        if level == "SUCCESS":
            print(f"{GREEN}✅ {message}{RESET}")
        elif level == "ERROR":
            print(f"{RED}❌ {message}{RESET}")
        elif level == "WARNING":
            print(f"{YELLOW}⚠️  {message}{RESET}")
        elif level == "INFO":
            print(f"{BLUE}ℹ️  {message}{RESET}")
        else:
            print(message)
    
    def login(self) -> bool:
        """Autenticarse como super admin"""
        try:
            response = requests.post(
                f"{BASE_URL}/auth/login",
                json={
                    "email": SUPERADMIN_EMAIL,
                    "password": SUPERADMIN_PASSWORD,
                    "company_id": self.company_id
                }
            )
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("access_token")
                self.log(f"Login exitoso. Token: {self.token[:20]}...", "SUCCESS")
                return True
            else:
                self.log(f"Login fallido: {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"Error en login: {str(e)}", "ERROR")
            return False
    
    def get_headers(self) -> Dict[str, str]:
        """Obtener headers con autenticación"""
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    def test_backend_health(self) -> bool:
        """Test 1: Verificar que el backend responde"""
        self.log("\n=== TEST 1: Backend Health ===", "INFO")
        try:
            response = requests.get(f"{BASE_URL}/docs")
            if response.status_code == 200:
                self.log("Backend respondiendo correctamente", "SUCCESS")
                self.test_results.append(("Backend Health", True))
                return True
            else:
                self.log(f"Backend no responde: {response.status_code}", "ERROR")
                self.test_results.append(("Backend Health", False))
                return False
        except Exception as e:
            self.log(f"Error: {str(e)}", "ERROR")
            self.test_results.append(("Backend Health", False))
            return False
    
    def test_weekly_config(self) -> bool:
        """Test 2: Verificar configuración semanal"""
        self.log("\n=== TEST 2: Weekly Configuration ===", "INFO")
        try:
            response = requests.get(
                f"{BASE_URL}/companies/current/weekly-config",
                headers=self.get_headers()
            )
            if response.status_code == 200:
                data = response.json()
                horas_entre_eventos = data.get("horas_entre_eventos")
                shift_start_minutes = data.get("shift_start_minutes")
                
                self.log(f"horas_entre_eventos: {horas_entre_eventos}", "SUCCESS")
                self.log(f"shift_start_minutes: {shift_start_minutes}", "SUCCESS")
                self.test_results.append(("Weekly Config", True))
                return True
            else:
                self.log(f"Error: {response.text}", "ERROR")
                self.test_results.append(("Weekly Config", False))
                return False
        except Exception as e:
            self.log(f"Error: {str(e)}", "ERROR")
            self.test_results.append(("Weekly Config", False))
            return False
    
    def test_database_connection(self) -> bool:
        """Test 3: Verificar conexión a BD"""
        self.log("\n=== TEST 3: Database Connection ===", "INFO")
        try:
            response = requests.get(
                f"{BASE_URL}/events",
                headers=self.get_headers()
            )
            if response.status_code == 200:
                data = response.json()
                count = len(data) if isinstance(data, list) else 0
                self.log(f"BD accesible. Eventos encontrados: {count}", "SUCCESS")
                self.test_results.append(("Database Connection", True))
                return True
            else:
                self.log(f"Error: {response.text}", "ERROR")
                self.test_results.append(("Database Connection", False))
                return False
        except Exception as e:
            self.log(f"Error: {str(e)}", "ERROR")
            self.test_results.append(("Database Connection", False))
            return False
    
    def test_validation_logic(self) -> bool:
        """Test 4: Verificar que la lógica de validación está en el código"""
        self.log("\n=== TEST 4: Validation Logic in Code ===", "INFO")
        try:
            # Leer el archivo de assignments.py
            with open("backend/app/routers/assignments.py", "r") as f:
                content = f.read()
            
            # Verificar que las validaciones están presentes
            checks = {
                "apply_to_event validation": 'EventAssignment.status.in_(["pending", "approved", "invited"])' in content,
                "approve_assignment validation": 'horas_entre_eventos > 0' in content,
                "direct_assign validation": 'direct_assign' in content,
                "time_diff calculation": 'time_diff = abs((event_start - other_start).total_seconds() / 3600)' in content,
            }
            
            all_passed = True
            for check_name, result in checks.items():
                if result:
                    self.log(f"✓ {check_name}", "SUCCESS")
                else:
                    self.log(f"✗ {check_name}", "ERROR")
                    all_passed = False
            
            self.test_results.append(("Validation Logic", all_passed))
            return all_passed
        except Exception as e:
            self.log(f"Error: {str(e)}", "ERROR")
            self.test_results.append(("Validation Logic", False))
            return False
    
    def test_frontend_translations(self) -> bool:
        """Test 5: Verificar traducciones del botón clock-in"""
        self.log("\n=== TEST 5: Frontend Translations ===", "INFO")
        try:
            # Leer archivos de traducción
            with open("frontend/src/i18n/es.json", "r") as f:
                es_data = json.load(f)
            
            with open("frontend/src/i18n/en.json", "r") as f:
                en_data = json.load(f)
            
            # Verificar mensajes
            es_message = es_data.get("profile", {}).get("clockInAvailable", "")
            en_message = en_data.get("profile", {}).get("clockInAvailable", "")
            
            es_ok = "minutos antes de iniciar el turno" in es_message
            en_ok = "minutes before starting the shift" in en_message
            
            if es_ok:
                self.log(f"ES: {es_message}", "SUCCESS")
            else:
                self.log(f"ES: Mensaje no encontrado o incorrecto", "ERROR")
            
            if en_ok:
                self.log(f"EN: {en_message}", "SUCCESS")
            else:
                self.log(f"EN: Mensaje no encontrado o incorrecto", "ERROR")
            
            result = es_ok and en_ok
            self.test_results.append(("Frontend Translations", result))
            return result
        except Exception as e:
            self.log(f"Error: {str(e)}", "ERROR")
            self.test_results.append(("Frontend Translations", False))
            return False
    
    def test_frontend_polling(self) -> bool:
        """Test 6: Verificar que el polling está implementado"""
        self.log("\n=== TEST 6: Frontend Polling ===", "INFO")
        try:
            with open("frontend/src/pages/EmployeeProfilePage.tsx", "r") as f:
                content = f.read()
            
            checks = {
                "Number conversion": "setShiftStartMinutes(Number(minutes))" in content,
                "Polling interval": "setInterval" in content and "30000" in content,
                "Console logging": "console.log" in content and "Clock-in check" in content,
            }
            
            all_passed = True
            for check_name, result in checks.items():
                if result:
                    self.log(f"✓ {check_name}", "SUCCESS")
                else:
                    self.log(f"✗ {check_name}", "ERROR")
                    all_passed = False
            
            self.test_results.append(("Frontend Polling", all_passed))
            return all_passed
        except Exception as e:
            self.log(f"Error: {str(e)}", "ERROR")
            self.test_results.append(("Frontend Polling", False))
            return False
    
    def print_summary(self):
        """Imprimir resumen de tests"""
        self.log("\n" + "="*50, "INFO")
        self.log("RESUMEN DE TESTS", "INFO")
        self.log("="*50, "INFO")
        
        passed = sum(1 for _, result in self.test_results if result)
        total = len(self.test_results)
        
        for test_name, result in self.test_results:
            status = "✅ PASADO" if result else "❌ FALLIDO"
            print(f"{test_name}: {status}")
        
        self.log(f"\nTotal: {passed}/{total} tests pasados", "INFO")
        
        if passed == total:
            self.log("🎉 TODOS LOS TESTS PASARON", "SUCCESS")
        else:
            self.log(f"⚠️  {total - passed} tests fallaron", "WARNING")
    
    def run_all_tests(self):
        """Ejecutar todos los tests"""
        self.log("="*50, "INFO")
        self.log("INICIANDO TESTS AUTOMATIZADOS - SESIÓN 11", "INFO")
        self.log("="*50, "INFO")
        
        # Test 1: Backend health
        self.test_backend_health()
        
        # Test 2: Login
        if not self.login():
            self.log("No se puede continuar sin autenticación", "ERROR")
            return
        
        # Test 3: Weekly config
        self.test_weekly_config()
        
        # Test 4: Database connection
        self.test_database_connection()
        
        # Test 5: Validation logic
        self.test_validation_logic()
        
        # Test 6: Frontend translations
        self.test_frontend_translations()
        
        # Test 7: Frontend polling
        self.test_frontend_polling()
        
        # Resumen
        self.print_summary()

if __name__ == "__main__":
    runner = TestRunner()
    runner.run_all_tests()
