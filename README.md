git clone https://github.com/fsimonbr/shortener.git

cd shortener

sudo docker-compose build

sudo docker-compose --project-name app-test -f docker-compose.yml up

:8081 - Admin interface

:8080 - API interface - /api/v1/[options]

:8082 - Redirect - /[brand]/[hash]
