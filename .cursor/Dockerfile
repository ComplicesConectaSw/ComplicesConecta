# Dockerfile para Cloud Agents de Cursor
# Este Dockerfile configura el entorno base para agentes en segundo plano
# NO copia el código - será clonado por el agente automáticamente

FROM node:20

# Instalar herramientas de desarrollo necesarias (como root)
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    build-essential \
    python3 \
    python3-pip \
    ca-certificates \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# Crear usuario no-root para desarrollo
RUN useradd -m -s /bin/bash ubuntu && \
    echo 'ubuntu ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

# Configurar variables de entorno para desarrollo
ENV NODE_ENV=development
ENV PATH="/home/ubuntu/.local/bin:$PATH"

# Cambiar al usuario ubuntu
USER ubuntu
WORKDIR /home/ubuntu

# Instalar herramientas globales útiles para desarrollo (como usuario ubuntu)
RUN npm install -g \
    typescript \
    tsx \
    vite \
    @vitejs/plugin-react \
    eslint \
    prettier

# El código será clonado por el agente, no se copia aquí
# Las dependencias se instalarán después de clonar el repositorio

