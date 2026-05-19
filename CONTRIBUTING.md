# Guía de Contribución

## 🤝 Cómo Contribuir

Gracias por tu interés en contribuir a Event Staffing Platform. Aquí están las pautas:

## 📋 Antes de Empezar

1. Fork el repositorio
2. Clonar tu fork: `git clone https://github.com/tu-usuario/event-staffing-platform.git`
3. Crear rama: `git checkout -b feature/tu-feature`

## 🔧 Configuración Local

```bash
# Instalar dependencias
cd backend && pip install -r requirements.txt
cd ../frontend && npm install

# Levantar servicios
docker-compose up -d

# Ejecutar frontend
cd frontend && npm run dev
```

## 📝 Estándares de Código

### Backend (Python)
- Usar type hints
- Seguir PEP 8
- Máximo 100 caracteres por línea
- Docstrings en funciones públicas

```python
async def get_user(user_id: int) -> User:
    """Obtener usuario por ID."""
    return await db.get(User, user_id)
```

### Frontend (TypeScript/React)
- Usar TypeScript
- Componentes funcionales con hooks
- Props tipadas
- Nombres descriptivos

```typescript
interface UserProps {
  id: number
  name: string
  onDelete: (id: number) => void
}

export const UserCard: React.FC<UserProps> = ({ id, name, onDelete }) => {
  return <div>{name}</div>
}
```

## 🧪 Testing

```bash
# Backend
cd backend && pytest

# Frontend
cd frontend && npm run test
```

## 📤 Enviar Pull Request

1. Commit con mensajes claros:
   ```bash
   git commit -m "feat: agregar validación de horas entre eventos"
   ```

2. Push a tu rama:
   ```bash
   git push origin feature/tu-feature
   ```

3. Abrir Pull Request en GitHub
   - Describir cambios
   - Referenciar issues relacionados
   - Incluir screenshots si es UI

## 📋 Tipos de Commits

- `feat:` Nueva característica
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Cambios de formato
- `refactor:` Refactorización de código
- `test:` Agregar tests
- `chore:` Cambios en build/dependencias

## 🐛 Reportar Bugs

1. Verificar que el bug no existe ya
2. Crear issue con:
   - Descripción clara
   - Pasos para reproducir
   - Comportamiento esperado
   - Comportamiento actual
   - Screenshots si aplica

## 💡 Sugerir Mejoras

1. Crear issue con etiqueta `enhancement`
2. Describir la mejora
3. Explicar por qué es útil
4. Ejemplos de uso

## 📚 Documentación

- Actualizar README si cambias funcionalidad
- Agregar comentarios en código complejo
- Documentar nuevos endpoints en Swagger

## ✅ Checklist Antes de PR

- [ ] Código sigue estándares del proyecto
- [ ] Tests pasan
- [ ] Sin conflictos con `main`
- [ ] Documentación actualizada
- [ ] Commits con mensajes claros
- [ ] Sin archivos innecesarios

## 🎯 Áreas de Contribución

- 🐛 Bugs
- ✨ Nuevas características
- 📚 Documentación
- 🧪 Tests
- 🎨 UI/UX
- ⚡ Performance
- 🔒 Seguridad

## 📞 Preguntas

- Abrir issue con etiqueta `question`
- Describir claramente tu duda

---

**¡Gracias por contribuir!** 🙌
