#!/bin/bash

# Script para ver los emails en MailHog
# Uso: ./ver_emails_mailhog.sh

echo "📧 Emails en MailHog:"
echo "===================="
echo ""

# Obtener los logs de MailHog y extraer información de emails
docker logs event_staffing_mailhog --tail=200 2>&1 | grep -A 5 '"From"' | grep -E '"From"|"To"|"Subject"' | head -50

echo ""
echo "✅ Para ver más detalles, abre: http://localhost:8025"
echo ""
echo "Si la web UI no funciona, usa este comando para ver todos los emails:"
echo "docker logs event_staffing_mailhog --tail=500 | grep -i 'from\|to\|subject'"
