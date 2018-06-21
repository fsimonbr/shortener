git clone https://github.com/fsimonbr/shortener.git

cd shortener

sudo docker-compose build

sudo docker-compose --project-name app-test -f docker-compose.yml up

:3001 - Admin interface

:2000 - API interface

:8080 - Redirect
