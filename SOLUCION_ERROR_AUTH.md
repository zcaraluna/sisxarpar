# Solución: Error JWTSessionError

Este error ocurre cuando hay una sesión JWT existente creada con un secreto diferente.

## Solución Rápida

1. **Limpiar las cookies del navegador:**
   - Abre las herramientas de desarrollador (F12)
   - Ve a la pestaña "Application" (Chrome) o "Storage" (Firefox)
   - En "Cookies", elimina todas las cookies de `localhost:3000`
   - O simplemente usa modo incógnito/privado

2. **Verificar el archivo .env:**
   Asegúrate de que tu archivo `.env` tenga:
   ```env
   AUTH_SECRET="tu-secreto-aqui"
   AUTH_TRUST_HOST=true
   ```

3. **Generar un nuevo secreto:**
   Si necesitas generar un nuevo secreto, ejecuta:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
   Y copia el resultado en tu archivo `.env` como valor de `AUTH_SECRET`.

4. **Reiniciar el servidor:**
   ```bash
   npm start
   ```

## Nota

Este error es común cuando:
- Cambias el secreto entre sesiones
- Tienes sesiones antiguas en el navegador
- El secreto no está configurado correctamente

Una vez que limpies las cookies y configures el secreto correctamente, el error debería desaparecer.

