# Autenticación usando JWT

**JWT** significa _JSON Web Token_. Un _JWT_ no es más que un _string_, que tiene tres partes codificadas en _Base64_ separadas por un punto. Más adelante veremos qué significa y para qué usamos cada una de estas partes. Aunque es solamente un **token** (un _string_) y en él podemos guardar cualquier tipo de _data_ o _metadata_, el uso más común para estos _tokens_ es ayudanos a gestionar la autenticación y el acceso de los diferentes usuarios a nuestro sistema.

### Cookies vs JWT

Durante mucho tiempo se han venido usando **cookies** para autenticar, autorizar y gestionar sesiones de usuarios en servidores. Desde hace unos años, con la popularización de los **JWT**, su uso ha decrecido en favor de estos últimos. Las _cookies_ como mecanismo de gestión de sesiones son _stateful_ (con estado), esto es, en el servidor y en el cliente se guarda el mismo pedazo de información sobre el usuario (por lo general un identificador de sesión), mientras que los _JWT_ suelen usarse como mecanismo de autenticación _stateless_ (sin estado), es decir, el servidor no guarda información del _JWT_ una vez lo emite, sino que confía en la información del _JWT_ recibido desde el cliente.

Obviamente esta confianza del servidor está basada en la criptografía. Cada _JWT_ está firmado con una clave criptográfica que el servidor conoce, y así puede verificar que el contenido del _JWT_ no ha sido alterado por el cliente.

En ambos modos el cliente manda unas credenciales, y se le responde con una cookie o un JWT, según el caso. En las siguientes llamadas el cliente deberá enviar esa cookie o JWT, pero la diferencia radica en que el servidor en el segundo caso no tiene constancia de ninguna sesión de usuario, simplemente verifica que el JWT es correcto en cada llamada.

Usar _JWT_ tiene varias ventajas. Como hemos visto no es necesario que el sevidor guarde una sesión para el usuario en memoria/base de datos, por lo cual es más sencillo enviar _request_ a un clúster de servidores (no necesitan tener acceso común a una base de datos de sesiones). También favorece el poder tener por ejemplo un servidor que se encarge de gestionar sólo la autenticación de usuarios y expedir los _JWT_, para después usar ese _JWT_ en otro servidor del mismo sistema que se encarge de otra tarea, por ejemplo gestionar los pedidos de una tienda online, sin tener que comunicar el sistema de autenticación con el de pedidos, ya que este segundo puede verificar el _JWT_ simplemente teniendo la firma criptográfica.

---

### Partes de un JWT

Como hemos dicho, un _JWT_ no es más que un string que tiene tres partes: **header**, **payload** y **signature**.

- **Header**: encabezado dónde se indica, al menos, el algoritmo y el tipo de _token_.
- **Payload**: información contenida en el _token_. Por lo general datos de usuario y privilegios.
- **Signature**: firma del _token_. Permite la comunicación segura entre cliente y servidor.

En la web [jwt.io](jwt.io) existe un codificador/decodificador de _JWT_ muy fácil de usar y que nos puede servir para explorar como se contruyen y deconstruyen _JWT_.

### _JWT_ en NodeJS

Para trabajar con _JWT_ en el contexto de NodeJS, usaremos la librería de jsonwebtoken de npm: `jsonwebtoken`.

```
npm i jsonwebtoken
```

Esta librería nos facilita dos funciones, que usaremos para **firmar** y **verificar** _JWT_.

```javascript
const jwt = require('jsonwebtoken');
const token = jwt.sign(payload, secret); // esto meterá el payload dentro del token
const payload = jwt.verify(token, secret); // esto leerá el payload del token
```

Estas dos funciones son así de simples. `jwt.sign` creará un _token_ con la información proporcionada en el _payload_, y firmará el _token_ usando el _secret_ (una clave secreta almacenada en nuestro servidor). Después, para verificar y leer los datos almacenados en ese _JWT_, podremos hacer uso de la función `jwt.verify`, que además de verificar que el _JWT_ no ha sido alterado desde su creación usando el mismo _secret_, nos devolverá la información guardada en el payload del _JWT_.

---

## Gestión de cuentas de usuarios y accesos usando JWT

En los dos apartados anteriores hemos visto cómo se trabaja con _JWT_ de forma genérica, pero _JWT_ tiene un uso para el que destaca: el manejo de cuentas de usuarios y accesos a nuestro backend. Vamos entonces a ver cómo podemos aplicar _JWT_ a ello.

Como hemos visto, cuando un usuario envía una _request_ a nuestro backend, en algunos casos queremos que esa _request_ sea autenticada, es decir, contenga un secreto que sólo conoce el usuario que envía la _request_, de forma que nuestro backend pueda permitirle el acceso a partes de nuestro backend para las que el usuario haya sido autorizado, o le pertenezcan. Por ejemplo en una red social, las peticiones de un usuario deberán ir con este secreto, de tal forma que el backend pueda identificar qué usuario está mandando la _request_, y darle acceso únicamente a las partes de la red social que el usuario tiene asignadas.

Este secreto que el usuario envía en cada _request_, suele transferirse usando el header `Authorization`. Cuando un usuario hace _login_ (se identifica en nuestro backend) a través de un cliente _HTTP_ (web, aplicación móvil, dispositivo IOT, etc.) se le suele devolver ese secreto como respuesta a la petición de login. Es responsabilidad del cliente guardar de manera segura ese secreto, pues es su tarjeta de identificación, que deberá usar en cada petición siguiente al backend.

En las llamadas siguientes al backend después de haber hecho _login_, el cliente enviará este header en la _request_, dentro de la clave `Authorization`. Sólo de esta forma el backend podrá identificar al cliente y darle acceso a lo que proceda.
