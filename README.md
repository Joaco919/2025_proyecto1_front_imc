# Calculadora de IMC

Este proyecto es una aplicación web para calcular el Índice de Masa Corporal (IMC). Permite a los usuarios ingresar su altura y peso para obtener su IMC y la categoría correspondiente a su resultado.

## Descripción

La Calculadora de IMC es una aplicación desarrollada como parte del curso de Ingeniería de Software. Utiliza una arquitectura moderna con:

- Frontend: React + TypeScript + Vite
- Backend: NestJS + TypeScript

## Características

- Cálculo preciso del IMC
- Interfaz de usuario intuitiva y responsiva
- Validación de datos de entrada
- Clasificación automática según el resultado del IMC

## Enlaces

- [Aplicación en vivo](https://two025-proyecto1-front-imc.onrender.com)
- [API Backend](https://two025-proyecto1-back-imc-vlxv.onrender.com)

## Tecnologías Utilizadas

### Frontend
- React
- TypeScript
- Vite
- Axios para peticiones HTTP

### Backend
- NestJS
- TypeScript
- Validación de datos con class-validator

## Uso

1. Ingresa tu altura en metros (ejemplo: 1.75)
2. Ingresa tu peso en kilogramos (ejemplo: 70)
3. Haz clic en calcular para obtener tu IMC y clasificación

## Desarrollo Local

### Requisitos Previos
- Node.js
- npm o yarn

### Configuración del Frontend
```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

### Variables de Entorno
Para desarrollo local, crea un archivo `.env` con:
```
VITE_API_URL=http://localhost:3000
```

## Despliegue
El proyecto está desplegado en Render:
- Frontend: https://two025-proyecto1-front-imc.onrender.com
- Backend: https://two025-proyecto1-back-imc-vlxv.onrender.com

## Autor
- Grupo 12 - Joaquín Ferreyra
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
