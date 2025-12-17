# Integración con Fathom Analytics

## Configuración

### 1. Variables de Entorno

Agrega las siguientes variables a tu archivo `.env`:

```env
# URLs de la aplicación
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# Fathom Analytics API (para uso directo con API key)
FATHOM_API_KEY=tu_fathom_api_key
FATHOM_API_URL=https://api.usefathom.com/v1

# Fathom OAuth (para conexión de usuarios)
FATHOM_CLIENT_ID=tu_fathom_client_id
FATHOM_CLIENT_SECRET=tu_fathom_client_secret
```

### 2. Configuración en Fathom

1. Ve a tu cuenta de Fathom Analytics
2. Crea una nueva aplicación OAuth en la configuración
3. Configura la URL de callback: `http://localhost:3000/fathom/callback`
4. Obtén tu `CLIENT_ID` y `CLIENT_SECRET`

## Endpoints Disponibles

### OAuth Flow

#### 1. Iniciar Conexión

```
GET /fathom/connect
Authorization: Bearer {jwt_token}
```

Redirige al usuario a Fathom para autorización.

#### 2. Callback (automático)

```
GET /fathom/callback?code={code}&state={state}
```

Maneja la respuesta de Fathom y guarda el token.

#### 3. Verificar Estado de Conexión

```
GET /fathom/connection/status
Authorization: Bearer {jwt_token}

Response:
{
  "success": true,
  "connected": true
}
```

#### 4. Desconectar Cuenta

```
DELETE /fathom/connection
Authorization: Bearer {jwt_token}
```

### Datos de Usuario (requiere conexión OAuth)

#### 1. Obtener Sitios del Usuario

```
GET /fathom/user/sites
Authorization: Bearer {jwt_token}
```

#### 2. Estadísticas de Sitio

```
GET /fathom/user/sites/{siteId}/stats?from=2024-01-01&to=2024-01-31
Authorization: Bearer {jwt_token}
```

#### 3. Dashboard Resumido

```
GET /fathom/user/sites/{siteId}/dashboard?period=7d
Authorization: Bearer {jwt_token}
```

### Endpoints de Admin (requiere API key y rol admin)

#### 1. Sitios (Admin)

```
GET /fathom/admin/sites
Authorization: Bearer {jwt_token}
```

#### 2. Estadísticas (Admin)

```
GET /fathom/admin/sites/{siteId}/stats
Authorization: Bearer {jwt_token}
```

## Uso desde el Frontend

### 1. Botón de Conexión

```javascript
// Componente para conectar cuenta
export default function ConnectFathomButton() {
  const handleConnect = () => {
    // Redirige al backend para iniciar OAuth
    window.location.href = "/fathom/connect";
  };

  return (
    <button onClick={handleConnect} className="btn">
      Conectar cuenta de Fathom
    </button>
  );
}
```

### 2. Verificar Estado de Conexión

```javascript
// Hook para verificar conexión
const [isConnected, setIsConnected] = useState(false);

useEffect(() => {
  const checkConnection = async () => {
    try {
      const response = await fetch("/fathom/connection/status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setIsConnected(data.connected);
    } catch (error) {
      console.error("Error verificando conexión:", error);
    }
  };

  checkConnection();
}, []);
```

### 3. Obtener Datos de Fathom

```javascript
// Obtener sitios del usuario
const fetchUserSites = async () => {
  try {
    const response = await fetch("/fathom/user/sites", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error obteniendo sitios:", error);
  }
};

// Obtener estadísticas
const fetchSiteStats = async (siteId, period = "7d") => {
  try {
    const response = await fetch(
      `/fathom/user/sites/${siteId}/dashboard?period=${period}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
  }
};
```

### 4. Manejar Callback en Frontend

```javascript
// En tu componente de dashboard
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const connected = urlParams.get("connected");
  const error = urlParams.get("error");

  if (connected === "true") {
    // Mostrar mensaje de éxito
    setMessage("¡Cuenta de Fathom conectada exitosamente!");
    // Limpiar URL
    window.history.replaceState({}, document.title, window.location.pathname);
  } else if (error) {
    // Manejar errores
    switch (error) {
      case "oauth_denied":
        setError("Autorización denegada");
        break;
      case "oauth_failed":
        setError("Error conectando con Fathom");
        break;
      default:
        setError("Error desconocido");
    }
    // Limpiar URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}, []);
```

## Flujo Completo

1. **Usuario hace clic en "Conectar Fathom"**

   - Frontend redirige a `/fathom/connect`
   - Backend genera estado único y redirige a Fathom

2. **Usuario autoriza en Fathom**

   - Fathom redirige a `/fathom/callback` con código
   - Backend intercambia código por token y lo guarda

3. **Usuario regresa al dashboard**

   - Frontend detecta parámetros de éxito/error
   - Muestra mensaje apropiado

4. **Usuario ve sus datos**
   - Frontend consulta `/fathom/user/sites`
   - Muestra estadísticas usando el token OAuth del usuario

## Modelos de Base de Datos

### OAuthState (temporal)

```javascript
{
  userId: ObjectId,
  state: String,
  createdAt: Date (expires in 10 minutes)
}
```

### FathomToken (persistente)

```javascript
{
  userId: ObjectId,
  accessToken: String,
  refreshToken: String,
  tokenType: String,
  expiresAt: Date,
  scope: String,
  connectedAt: Date
}
```

## Seguridad

- Los tokens OAuth se almacenan por usuario
- Los estados OAuth expiran en 10 minutos
- Todas las rutas requieren autenticación JWT
- Los endpoints de admin requieren rol de administrador
- Los tokens de usuario solo pueden acceder a sus propios datos
