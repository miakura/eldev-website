# Deploy ELDEV (`eldev.website`)

## DNS

У регистратора / в DNS-панели домена `eldev.website`:

| Тип | Имя | Значение |
|-----|-----|----------|
| A | `@` (`eldev.website`) | IPv4 вашего VPS |
| A | `www` | тот же IPv4 |
| AAAA | `@` | IPv6 VPS (если есть) |
| AAAA | `www` | тот же IPv6 |

Проверка:

```bash
dig +short eldev.website A
dig +short www.eldev.website A
```

Подождите распространения DNS (обычно минуты, иногда до часа).

## Docker на VPS

```bash
git clone <repo-url> /opt/eldev
cd /opt/eldev
cp .env.example .env
docker compose up -d --build
curl -I http://127.0.0.1
```

Контейнер слушает 80 (и проброс 443 зарезервирован под TLS-прокси).

## TLS: Certbot + nginx на хосте

Вариант A — nginx на хосте как reverse proxy к контейнеру на `127.0.0.1:8080` (смените `ports` в compose на `"8080:80"`):

```nginx
server {
    listen 80;
    server_name eldev.website www.eldev.website;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Затем:

```bash
sudo certbot --nginx -d eldev.website -d www.eldev.website
sudo systemctl reload nginx
```

Certbot добавит `listen 443 ssl` и редирект HTTP→HTTPS.

## TLS: Caddy

```caddy
eldev.website, www.eldev.website {
    reverse_proxy 127.0.0.1:8080
}
```

Caddy сам выпустит сертификаты Let’s Encrypt.

## Обновление

С локальной машины (не затирает `.env`):

```bash
./deploy/rsync-vps.sh root@YOUR_VPS_IP
```

Или на VPS, если там есть git:

```bash
cd /opt/eldev
git pull
docker compose -f docker-compose.vps.yml up -d --build
```
