#!/usr/bin/env python3
import sys
sys.path.insert(0, '/app')

from app.core.security import hash_password

password = "Admin1234!"
hashed = hash_password(password)
print(hashed)
