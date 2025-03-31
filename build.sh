#!/bin/bash
cd Bolicheck2
# Instalar dependencias de Django
pip install -r requirements.txt

# Aplicar migraciones
python manage.py migrate

# Recoger archivos estáticos de Django
python manage.py collectstatic --noinput

# Construir React
cd front-end
npm install
npm run build

# Mover la build de React al backend
mv dist ../static

# Volver al backend
cd ..