#!/usr/bin/env python3
import re

# Read the file
with open('frontend/src/pages/EventDetailPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace hardcoded Spanish text with translation keys
replacements = [
    ("if (!endTime) { setError('Ingresa la hora de fin'); return }", "if (!endTime) { setError(t('events.enterEndTime')); return }"),
    ("if (!confirm(`¿Finalizar el evento para TODOS los empleados con hora de salida ${endTime}?`))", "if (!confirm(t('events.finalizeEventConfirm', { time: endTime })))"),
    ("<p className=\"text-xs font-semibold text-slate-700 mb-2\">Finalizar evento para todos los empleados:</p>", "<p className=\"text-xs font-semibold text-slate-700 mb-2\">{t('events.finalizeEventForAll')}</p>"),
    ("<label className=\"text-xs text-slate-600 whitespace-nowrap\">Hora de fin:</label>", "<label className=\"text-xs text-slate-600 whitespace-nowrap\">{t('events.endTime')}</label>"),
    ("{loading ? 'Cerrando...' : '⏹ Cerrar Evento'}", "{loading ? t('events.closingEvent') : `⏹ ${t('events.closeEvent')}`}"),
    ("Esta acción aplica la hora de fin a todos los empleados y cambia el evento a Finalizado.", "{t('events.thisActionApplies')}"),
    ("setError(e.response?.data?.detail || 'Error al cerrar el evento')", "setError(e.response?.data?.detail || t('common.error'))"),
    ("<button\n        onClick={startEdit}\n        className=\"text-xs text-blue-500 hover:text-blue-700 underline mt-0.5\"\n      >\n        Editar hora entrada\n      </button>", "<button\n        onClick={startEdit}\n        className=\"text-xs text-blue-500 hover:text-blue-700 underline mt-0.5\"\n      >\n        {t('events.editClockIn')}\n      </button>"),
    ("if (loading) return <p className=\"text-gray-500\">Cargando...</p>", "if (loading) return <p className=\"text-gray-500\">{t('common.loading')}</p>"),
    ("if (!event) return <p className=\"text-red-500\">Evento no encontrado</p>", "if (!event) return <p className=\"text-red-500\">{t('events.notFound')}</p>"),
    ("<p className=\"text-sm text-slate-500\">Cargando empleados...</p>", "<p className=\"text-sm text-slate-500\">{t('common.loading')}</p>"),
    ("<p className=\"text-sm text-slate-500\">No hay empleados con roles asignados.</p>", "<p className=\"text-sm text-slate-500\">{t('events.noEmployeesWithRoles')}</p>"),
    ("Turnos del Evento", "{t('events.shiftsTitle')}"),
    ("<p className=\"text-sm text-slate-500\">Ningún empleado ha iniciado turno aún.</p>", "<p className=\"text-sm text-slate-500\">{t('events.noShiftsStarted')}</p>"),
]

for old, new in replacements:
    content = content.replace(old, new)

# Write the file back
with open('frontend/src/pages/EventDetailPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Translations fixed!")
